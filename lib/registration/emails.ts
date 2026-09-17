import 'server-only'
import { getEventBySlug, getFacilitatorById, getSettings, getVenueById, pick } from '@/lib/content'
import type { Locale } from '@/lib/content/types'
import { formatDate, formatDateRange } from '@/lib/domain/dates'
import { formatEuro } from '@/lib/format'
import type { SheetRow } from '@/lib/integrations/sheets'
import type { RegistrationEmailData } from '@/emails/templates'

/**
 * Rebuild the data a registration email needs from a Google Sheets row (brief
 * §7.1, §8.3). Used by the Mollie webhook and the pay-link / cron flows, which
 * only have the sheet row to work from. Event extras (venue, facilitators,
 * schedule) are looked up from the CMS when the event still exists.
 */

const s = (v: SheetRow[string]): string => (v == null ? '' : String(v))
const n = (v: SheetRow[string]): number => {
  const x = Number(s(v).replace(',', '.'))
  return Number.isFinite(x) ? x : 0
}

/** Due date: the earlier of now+days and the day before the start. */
function dueDate(now: Date, days: number, start?: string): Date {
  const byDays = new Date(now.getTime() + days * 86400000)
  if (!start) return byDays
  const dayBefore = new Date(new Date(start).getTime() - 86400000)
  return byDays.getTime() < dayBefore.getTime() ? byDays : dayBefore
}

export interface RowEmailContext {
  locale: Locale
  emailBase: RegistrationEmailData
  recipient: { email: string; name?: string }
  isTeen: boolean
  registrationId: string
  eventTitle: string
  event: Awaited<ReturnType<typeof getEventBySlug>>
}

export async function buildRowEmailContext(row: SheetRow): Promise<RowEmailContext> {
  const locale = (s(row.taal) === 'en' ? 'en' : 'nl') as Locale
  const slug = s(row.activiteit_slug)
  const eventTitle = s(row.activiteit)
  const registrationId = s(row.registratie_id)
  const isTeen = s(row.deelnemer_geboortedatum).length > 0

  const settings = await getSettings()
  const event = slug ? await getEventBySlug(slug) : null
  const dates = event ? formatDateRange(event.start, event.end, locale) : s(row.startdatum)
  const venue = event?.venueId ? await getVenueById(event.venueId) : null
  const facilitatorNames = event
    ? (await Promise.all((event.facilitatorIds ?? []).map((id) => getFacilitatorById(id))))
        .filter(Boolean)
        .map((f) => f!.name)
        .join(', ')
    : ''

  const contactName = s(row.contact_naam)
  const contactFirst = contactName.split(' ')[0] || contactName
  const paid = n(row.betaald_eur)
  const outstanding = n(row.openstaand_eur)
  const due = dueDate(new Date(), settings.transferDueDays ?? 14, event?.start)

  const emailBase: RegistrationEmailData = {
    firstName: contactFirst,
    event: eventTitle,
    dates,
    schedule: event?.scheduleNote ? pick(event.scheduleNote, locale) : undefined,
    venue: venue?.name,
    address: venue
      ? [venue.street, `${venue.postalCode ?? ''} ${venue.city ?? ''}`.trim()].filter(Boolean).join(', ')
      : undefined,
    facilitators: facilitatorNames || undefined,
    registrationId,
    iban: settings.iban,
    accountHolder: settings.accountHolder ?? settings.legalName ?? settings.orgName,
    ogm: s(row.mededeling) || undefined,
    dueDate: formatDate(due, locale),
    payUrl: s(row.betaallink) || undefined,
    amount: formatEuro(n(row.prijs_eur), locale),
    paid: formatEuro(paid, locale),
    remaining: formatEuro(outstanding, locale),
    allowBankTransfer: settings.allowBankTransfer,
    teenFirstName: isTeen ? s(row.deelnemer_voornaam) : undefined,
    guardianFirstName: isTeen ? contactFirst : undefined,
  }

  return {
    locale,
    emailBase,
    recipient: { email: s(row.contact_email), name: contactName || undefined },
    isTeen,
    registrationId,
    eventTitle,
    event,
  }
}
