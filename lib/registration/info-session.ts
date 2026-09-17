import 'server-only'
import { getEventBySlug, getProgramBySlug, pick } from '@/lib/content'
import type { Locale } from '@/lib/content/types'
import { formatBrusselsTimestamp, formatDate } from '@/lib/domain/dates'
import { generateRegistrationId } from '@/lib/domain/id'
import { appendInfoSessionSignup } from '@/lib/integrations/sheets'
import { startDoubleOptin } from '@/lib/integrations/brevo'
import { icsAttachment } from '@/lib/integrations/ics'
import { sendInternalEmail, sendRegistrantEmail } from '@/lib/emails'
import * as tpl from '@/emails/templates'
import { infoSessionSchema, type InfoSessionInput } from './schema'
import type { SubmitResult } from './types'

/**
 * Free info-session / workshop signup (brief §7.3). One step: append to the
 * `Infosessies` tab, email the confirmation with the meeting link (server-side
 * only) and an .ics attachment, and start the newsletter double opt-in when the
 * visitor opted in. The meeting URL never reaches the browser.
 */
export async function runInfoSessionSignup(payload: {
  locale: Locale
  eventSlug: string
  data: InfoSessionInput
}): Promise<SubmitResult> {
  const { locale, eventSlug, data } = payload
  const now = new Date()

  try {
    const parsed = infoSessionSchema.safeParse(data)
    if (!parsed.success) {
      if (data.website || now.getTime() - (data.formLoadedAt || 0) < 3000) {
        return { ok: false, error: 'generic' }
      }
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message
      return { ok: false, fieldErrors }
    }
    const clean = parsed.data
    if (clean.website) return { ok: false, error: 'generic' }
    if (now.getTime() - (clean.formLoadedAt || 0) < 3000) return { ok: false, error: 'generic' }

    const event = await getEventBySlug(eventSlug)
    if (!event) return { ok: false, error: 'generic' }

    let title = event.title ? pick(event.title, locale) : event.slug
    if (!event.title && event.programSlug) {
      const program = await getProgramBySlug(event.programSlug)
      if (program) title = pick(program.title, locale)
    }
    const registrationId = generateRegistrationId()
    const dateDisplay = formatDate(event.start, locale)
    const time = event.scheduleNote ? pick(event.scheduleNote, locale) : ''

    await appendInfoSessionSignup({
      registratie_id: registrationId,
      aangemaakt_op: formatBrusselsTimestamp(now),
      taal: locale,
      activiteit_slug: event.slug,
      activiteit: title,
      startdatum: event.start.slice(0, 10),
      voornaam: clean.firstName,
      email: clean.email,
      via: clean.referral,
      nieuwsbrief: clean.newsletter,
    })

    // Meeting link is server-side only (§5.2): used in the email, never rendered.
    const meetingUrl = event.meetingUrl ?? ''
    const ics = icsAttachment(
      {
        uid: registrationId,
        start: event.start,
        end: event.end,
        summary: title,
        description: meetingUrl,
        url: meetingUrl || undefined,
      },
      'infosessie.ics',
    )

    await sendRegistrantEmail(
      tpl.infoSessionConfirmed(
        { firstName: clean.firstName, event: title, date: dateDisplay, time, meetingUrl },
        locale,
      ),
      { email: clean.email, name: clean.firstName },
      [ics],
    )

    await sendInternalEmail(
      tpl.internalRegistration({
        event: title,
        name: clean.firstName,
        status: 'ingeschreven (infosessie)',
        fields: [
          { label: 'Referentie', value: registrationId },
          { label: 'Activiteit', value: `${title} (${dateDisplay})` },
          { label: 'E-mail', value: clean.email },
          { label: 'Via', value: clean.referral || '—' },
          { label: 'Nieuwsbrief', value: clean.newsletter ? 'ja' : 'nee' },
        ],
      }),
    )

    if (clean.newsletter) {
      await startDoubleOptin({ email: clean.email, locale })
    }

    return { ok: true, redirect: `/${locale}/register/confirmation?ref=${registrationId}&state=info` }
  } catch (err) {
    console.error('[v0] infoSessionSignup failed:', err)
    return { ok: false, error: 'generic' }
  }
}
