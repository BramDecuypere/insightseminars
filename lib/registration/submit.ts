import 'server-only'
import {
  getEventBySlug,
  getFacilitatorById,
  getLegalPage,
  getProgramBySlug,
  getSettings,
  getVenueById,
  pick,
} from '@/lib/content'
import type { InsightEvent, Locale, SiteSettings } from '@/lib/content/types'
import { registrationState } from '@/lib/domain/events'
import { visibleOptions } from '@/lib/domain/pricing'
import { computeAmounts } from '@/lib/domain/money'
import { formatDate, formatDateRange, formatBrusselsTimestamp } from '@/lib/domain/dates'
import { ageOn } from '@/lib/domain/age'
import { generateOgm } from '@/lib/domain/ogm'
import { generateRegistrationId } from '@/lib/domain/id'
import { payLinkUrl } from '@/lib/domain/paylink'
import { formatEuro } from '@/lib/format'
import { paymentMode } from '@/lib/env'
import { appendRegistration, type SheetRow } from '@/lib/integrations/sheets'
import { createPayment } from '@/lib/integrations/mollie'
import { buildConsentPdf } from '@/lib/integrations/pdf'
import type { EmailAttachment } from '@/lib/integrations/brevo'
import { sendInternalEmail, sendRegistrantEmail } from '@/lib/emails'
import * as tpl from '@/emails/templates'
import { optionId, resolveFlow, type FlowContext } from './flow'
import { makeRegistrationSchema, type RegistrationInput } from './schema'
import type { ConfirmationState, SubmitResult } from './types'

const LANGUAGE_LABEL: Record<InsightEvent['language'], { nl: string; en: string }> = {
  nl: { nl: 'Nederlands', en: 'Dutch' },
  en: { nl: 'Engels', en: 'English' },
  'en-nl': { nl: 'Engels, met vertaling naar het Nederlands', en: 'English, with Dutch translation' },
  'nl-en': { nl: 'Nederlands, met vertaling naar het Engels', en: 'Dutch, with English translation' },
}

const num = (s: string): number => {
  const n = Number((s || '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Due date: the earlier of now+transferDueDays and the day before the start. */
function transferDueDate(now: Date, days: number, start: string): Date {
  const byDays = new Date(now.getTime() + days * 86400000)
  const dayBefore = new Date(new Date(start).getTime() - 86400000)
  return byDays.getTime() < dayBefore.getTime() ? byDays : dayBefore
}

async function eventTitleFor(event: InsightEvent, locale: Locale): Promise<string> {
  if (event.title) return pick(event.title, locale)
  if (event.programSlug) {
    const program = await getProgramBySlug(event.programSlug)
    if (program) return pick(program.title, locale)
  }
  return event.slug
}

async function buildFlow(event: InsightEvent, locale: Locale, settings: SiteSettings, now: Date) {
  let prerequisites: string[] = []
  let ageMin: number | undefined
  let ageMax: number | undefined
  if (event.programSlug) {
    const program = await getProgramBySlug(event.programSlug)
    prerequisites = program?.prerequisites ?? []
    ageMin = program?.ageMin
    ageMax = program?.ageMax
  }
  const eventTitle = await eventTitleFor(event, locale)
  return resolveFlow({
    event,
    eventTitle,
    locale,
    prerequisites,
    ageMin,
    ageMax,
    allowBankTransfer: settings.allowBankTransfer,
    now,
  })
}

/** Core registration handler shared by the seminar, teen and waitlist forms. */
export async function runSubmitRegistration(payload: {
  locale: Locale
  eventSlug: string
  data: RegistrationInput
  consentFile?: File
}): Promise<SubmitResult> {
  const { locale, eventSlug, data } = payload
  const now = new Date()

  try {
    const event = await getEventBySlug(eventSlug)
    if (!event) return { ok: false, error: 'generic' }

    const settings = await getSettings()
    const ctx = await buildFlow(event, locale, settings, now)

    // Validate with the same schema the client used.
    const parsed = makeRegistrationSchema(ctx).safeParse(data)
    if (!parsed.success) {
      // Honeypot / time-trap: fail silently as a generic error (no field hints).
      if (data.website || now.getTime() - (data.formLoadedAt || 0) < 3000) {
        return { ok: false, error: 'generic' }
      }
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join('.')] = issue.message
      }
      return { ok: false, fieldErrors }
    }
    const clean = parsed.data

    // Anti-spam, always enforced server-side (§7.1).
    if (clean.website) return { ok: false, error: 'generic' }
    if (now.getTime() - (clean.formLoadedAt || 0) < 3000) return { ok: false, error: 'generic' }

    // --- Availability (§6.2) ---
    const state = registrationState(event, now)
    const isWaitlist = ctx.flow === 'waitlist'
    if (!isWaitlist && state !== 'open') {
      return { ok: false, error: state === 'waitlist' ? 'full' : 'closed' }
    }

    // --- Recompute price on the server (§6.3) ---
    const visible = visibleOptions(event.priceOptions ?? [], now)
    let price = 0
    if (!isWaitlist && !ctx.free && visible.length > 0) {
      const chosen = visible.find((o) => optionId(o) === clean.priceOptionId)
      if (!chosen) {
        return { ok: false, error: 'priceExpired', options: ctx.options }
      }
      price = chosen.amount
    }

    // --- Consent guard (teen under 18, §7.2): defence-in-depth beyond the schema ---
    if (ctx.flow === 'teen') {
      const under18 =
        ageOn(
          { day: clean.birthDay, month: clean.birthMonth, year: clean.birthYear },
          event.start,
        ) < 18
      if (under18) {
        if (clean.consentMethod === '') return { ok: false, error: 'generic' }
        if (clean.consentMethod === 'sign' && !clean.consentSignature) {
          return { ok: false, error: 'generic' }
        }
        if (clean.consentMethod === 'upload' && !payload.consentFile) {
          return { ok: false, error: 'generic' }
        }
      }
    }
    if (payload.consentFile) {
      const okType = ['application/pdf', 'image/jpeg', 'image/png'].includes(
        payload.consentFile.type,
      )
      if (!okType || payload.consentFile.size > 4 * 1024 * 1024) {
        return { ok: false, error: 'generic' }
      }
    }

    const amounts = computeAmounts({
      price,
      payChoice: clean.payChoice,
      depositAmount: event.depositAmount,
      earlierDeposit: clean.earlierDeposit === 'ja' ? num(clean.earlierDepositAmount) : 0,
      sponsoring: clean.sponsoring === 'ja' ? num(clean.sponsoringAmount) : 0,
    })

    // --- Identity + IDs ---
    const registrationId = generateRegistrationId()
    const eventTitle = ctx.eventTitle
    const dates = formatDateRange(event.start, event.end, locale)
    const isTeen = ctx.flow === 'teen'

    // --- Decide status, payment method, confirmation state (§7.1) ---
    // Bank transfer is only ever driven by the global PAYMENT_MODE ops toggle;
    // registrants can no longer choose it — paid registrations go through Mollie.
    const bankTransferMode = paymentMode === 'bank_transfer'
    let status: string
    let confirmationState: ConfirmationState
    let betaalwijze = ''
    let ogm = ''
    let payUrl = ''
    let mollieId = ''
    let mollieCheckoutUrl = ''

    const dueDate = transferDueDate(now, settings.transferDueDays ?? 14, event.start)

    if (isWaitlist) {
      status = 'wachtlijst'
      confirmationState = 'waitlist'
    } else if (ctx.free) {
      status = 'ingeschreven'
      confirmationState = 'free'
    } else if (amounts.declaredCredit) {
      status = 'te_controleren'
      confirmationState = 'check'
      payUrl = payLinkUrl(registrationId, locale)
    } else if (event.paymentTiming === 'later') {
      status = 'betaal_later'
      confirmationState = 'later'
      betaalwijze = 'betaallink'
      payUrl = payLinkUrl(registrationId, locale)
      if (settings.allowBankTransfer) ogm = generateOgm()
    } else if (bankTransferMode) {
      status = 'wacht_op_overschrijving'
      confirmationState = 'transfer'
      betaalwijze = 'overschrijving'
      ogm = generateOgm()
    } else {
      // PAYMENT_MODE=mollie with immediate timing (§8.2): create the payment for
      // the amount due now, store its id, and hand back the checkout URL. If
      // Mollie is unavailable, keep the row pending with a personal pay link.
      status = 'wacht_op_betaling'
      confirmationState = 'pending'
      betaalwijze = 'mollie'
      payUrl = payLinkUrl(registrationId, locale)
      const displayName = isTeen
        ? `${clean.teenFirstName} ${clean.teenLastName}`.trim()
        : `${clean.firstName} ${clean.lastName}`.trim()
      const created = await createPayment({
        amount: amounts.payNow,
        description: `${eventTitle}, ${dates} – ${displayName}`,
        registrationId,
        eventSlug: event.slug,
        locale,
      })
      if (created) {
        mollieId = created.id
        mollieCheckoutUrl = created.checkoutUrl
      }
    }

    // --- Build the sheet row (§8.3), mapped by header name downstream ---
    const termsPage = await getLegalPage('terms')
    const isAdultAnswer = isTeen
      ? ageOn(
          { day: clean.birthDay, month: clean.birthMonth, year: clean.birthYear },
          event.start,
        ) >= 18
      : clean.isAdult === 'ja'

    const participant = isTeen
      ? { first: clean.teenFirstName, last: clean.teenLastName, email: clean.teenEmail }
      : { first: clean.firstName, last: clean.lastName, email: clean.email }

    // Contact columns: guardian for teens, the participant themselves for adults.
    const contact = isTeen
      ? {
          naam: `${clean.guardianFirstName} ${clean.guardianLastName}`.trim(),
          email: clean.guardianEmail,
          gsm: clean.guardianPhone,
          relatie: clean.relationship === 'guardian' ? 'voogd' : 'ouder',
        }
      : {
          naam: `${clean.firstName} ${clean.lastName}`.trim(),
          email: clean.email,
          gsm: clean.phone,
          relatie: 'zelf',
        }

    const priorParticipation = [
      clean.auditHistory,
      ...Object.values(clean.prerequisiteHistory ?? {}),
    ]
      .filter(Boolean)
      .join(' | ')

    const tarief = ctx.options.find((o) => o.id === clean.priceOptionId)?.label ?? ''

    const row: SheetRow = {
      registratie_id: registrationId,
      aangemaakt_op: formatBrusselsTimestamp(now),
      taal: locale,
      activiteit_slug: event.slug,
      activiteit: eventTitle,
      startdatum: event.start.slice(0, 10),
      programma: event.programSlug ?? '',
      tarief,
      prijs_eur: amounts.price,
      betaalkeuze: clean.payChoice,
      voorschot_eerder_eur: clean.earlierDeposit === 'ja' ? num(clean.earlierDepositAmount) : 0,
      sponsoring_eur: clean.sponsoring === 'ja' ? num(clean.sponsoringAmount) : 0,
      sponsor: clean.sponsor,
      betaald_eur: 0,
      openstaand_eur: amounts.outstanding,
      betaalwijze,
      status,
      mollie_ids: mollieId,
      mededeling: ogm,
      betaald_op: '',
      bevestiging_verstuurd_op: '',
      betaallink: payUrl,
      stuur_betaallink: false,
      betaallink_verstuurd_op: '',
      factuur_nodig: clean.invoiceNeeded === 'ja',
      factuur_naam: clean.invoiceCompany,
      factuur_ondernemingsnummer: clean.invoiceVat,
      factuur_adres: clean.invoiceSameAddress
        ? `${clean.street}, ${clean.postalCode} ${clean.city}`
        : clean.invoiceAddress,
      factuur_email: clean.invoiceEmail,
      peppol: clean.peppol,
      peppol_id: clean.peppolId,
      deelnemer_voornaam: participant.first,
      deelnemer_familienaam: participant.last,
      deelnemer_geboortedatum: isTeen
        ? `${clean.birthYear}-${String(clean.birthMonth).padStart(2, '0')}-${String(clean.birthDay).padStart(2, '0')}`
        : '',
      deelnemer_email: participant.email,
      contact_naam: contact.naam,
      contact_email: contact.email,
      contact_gsm: contact.gsm,
      contact_relatie: contact.relatie,
      straat: clean.street,
      postcode: clean.postalCode,
      gemeente: clean.city,
      land: clean.country,
      meerderjarig: isAdultAnswer,
      noodcontact_naam: clean.emergencyName,
      noodcontact_gsm: clean.emergencyPhone,
      foto_toestemming: clean.photoConsent === 'ja',
      whatsapp: clean.whatsapp === 'ja',
      intentie: clean.intention,
      via: clean.referral,
      eerdere_deelname: priorParticipation,
      toestemming_methode: clean.consentMethod,
      toestemming_op: clean.consentMethod ? formatBrusselsTimestamp(now) : '',
      toestemming_naam: clean.consentTypedName,
      toestemming_versie: settings.consentVersion ?? '',
      voorwaarden_versie: termsPage?.version ?? '',
      opmerkingen: '',
    }

    await appendRegistration(row)

    // --- Consent record (§7.2): build the PDF, attach the upload, never store ---
    let consentAttachments: EmailAttachment[] | undefined
    if (isTeen && clean.consentMethod) {
      const attachments: EmailAttachment[] = []
      try {
        attachments.push(
          await buildConsentPdf({
            orgName: settings.orgName,
            event: eventTitle,
            dates,
            teenName: `${clean.teenFirstName} ${clean.teenLastName}`.trim(),
            teenBirthDate: String(row.deelnemer_geboortedatum ?? ''),
            guardianName: `${clean.guardianFirstName} ${clean.guardianLastName}`.trim(),
            guardianEmail: clean.guardianEmail,
            guardianPhone: clean.guardianPhone,
            relationship: clean.relationship === 'guardian' ? 'voogd' : 'ouder',
            consentText: settings.consentText ? pick(settings.consentText, locale) : '',
            consentVersion: settings.consentVersion ?? '',
            typedName: clean.consentTypedName,
            signatureDataUrl: clean.consentMethod === 'sign' ? clean.consentSignature : undefined,
            timestamp: formatBrusselsTimestamp(now),
          }),
        )
      } catch (err) {
        console.error('[v0] consent PDF build failed:', err)
      }
      if (payload.consentFile) {
        const buf = Buffer.from(await payload.consentFile.arrayBuffer())
        attachments.push({ name: payload.consentFile.name, content: buf.toString('base64') })
      }
      if (attachments.length > 0) consentAttachments = attachments
    }

    // --- Emails (§13.9) ---
    const iban = settings.iban ?? ''
    const accountHolder = settings.accountHolder ?? settings.legalName ?? settings.orgName
    const venue = event.venueId ? await getVenueById(event.venueId) : null
    const facilitatorNames = (
      await Promise.all((event.facilitatorIds ?? []).map((id) => getFacilitatorById(id)))
    )
      .filter(Boolean)
      .map((f) => f!.name)
      .join(', ')

    const emailBase: tpl.RegistrationEmailData = {
      firstName: isTeen ? clean.guardianFirstName : clean.firstName,
      event: eventTitle,
      dates,
      schedule: event.scheduleNote ? pick(event.scheduleNote, locale) : undefined,
      venue: venue?.name,
      address: venue ? [venue.street, `${venue.postalCode ?? ''} ${venue.city ?? ''}`.trim()].filter(Boolean).join(', ') : undefined,
      facilitators: facilitatorNames || undefined,
      language: LANGUAGE_LABEL[event.language]?.[locale],
      registrationId,
      emailInfo: event.emailInfo ? pick({ nl: (event.emailInfo.nl ?? []).join('\n'), en: (event.emailInfo.en ?? []).join('\n') }, locale) : undefined,
      iban,
      accountHolder,
      ogm,
      dueDate: formatDate(dueDate, locale),
      payUrl,
      amount: formatEuro(amounts.payNow || amounts.price, locale),
      remaining: formatEuro(amounts.outstanding, locale),
      allowBankTransfer: settings.allowBankTransfer,
      invoiceCompany: clean.invoiceNeeded === 'ja' ? clean.invoiceCompany : undefined,
      teenFirstName: isTeen ? clean.teenFirstName : undefined,
      guardianFirstName: isTeen ? clean.guardianFirstName : undefined,
    }

    const recipient = { email: contact.email, name: contact.naam }

    let registrantEmail: tpl.EmailResult | null = null
    if (isWaitlist) registrantEmail = tpl.waitlist(emailBase, locale)
    else if (ctx.free) registrantEmail = tpl.registrationConfirmed(emailBase, locale)
    else if (amounts.declaredCredit) registrantEmail = tpl.paymentCheck(emailBase, locale)
    else if (event.paymentTiming === 'later') registrantEmail = tpl.registrationPayLater(emailBase, locale)
    else if (betaalwijze === 'overschrijving') registrantEmail = tpl.registrationBankTransfer(emailBase, locale)
    // Mollie immediate: the confirmation email is sent by the webhook on "paid" (Prompt 6).

    if (registrantEmail) {
      await sendRegistrantEmail(registrantEmail, recipient, consentAttachments)
    }

    // Internal notification, always Dutch (§13.9).
    await sendInternalEmail(
      tpl.internalRegistration({
        event: eventTitle,
        name: contact.naam,
        status,
        fields: [
          { label: 'Referentie', value: registrationId },
          { label: 'Activiteit', value: `${eventTitle} (${dates})` },
          { label: 'Deelnemer', value: `${participant.first} ${participant.last}` },
          { label: 'Contact', value: `${contact.email} · ${contact.gsm}` },
          { label: 'Tarief', value: String(tarief) },
          { label: 'Prijs', value: formatEuro(amounts.price, 'nl') },
          { label: 'Nu te betalen', value: formatEuro(amounts.payNow, 'nl') },
          { label: 'Openstaand', value: formatEuro(amounts.outstanding, 'nl') },
          { label: 'Status', value: status },
        ],
        invoice:
          clean.invoiceNeeded === 'ja'
            ? { company: clean.invoiceCompany, peppol: clean.peppol || 'nee' }
            : undefined,
      }),
      consentAttachments,
    )

    // --- Redirect target ---
    // Mollie immediate: send the visitor straight to the hosted checkout.
    if (mollieCheckoutUrl) {
      return { ok: true, redirect: mollieCheckoutUrl }
    }

    const params = new URLSearchParams({ ref: registrationId, state: confirmationState })
    params.set('event', event.slug)
    if (confirmationState === 'transfer') {
      params.set('amount', String(amounts.price))
      params.set('due', dueDate.toISOString().slice(0, 10))
      if (ogm) params.set('ogm', ogm)
    } else if (confirmationState === 'later' || confirmationState === 'check') {
      params.set('due', dueDate.toISOString().slice(0, 10))
    }

    return { ok: true, redirect: `/${locale}/register/confirmation?${params.toString()}` }
  } catch (err) {
    console.error('[v0] submitRegistration failed:', err)
    return { ok: false, error: 'generic' }
  }
}
