'use server'

import { env } from '@/lib/env'
import { sendEmail } from '@/lib/integrations/brevo'
import {
  contactSchema,
  type ContactInput,
  type ContactResult,
  type ContactSubject,
} from '@/lib/forms/contact'

/**
 * Contact form server action (brief §7.4). Emails NOTIFY_EMAIL with `replyTo`
 * set to the sender, then reports success. Nothing is stored. The internal
 * email is always in Dutch. Form payloads are never logged (brief §11).
 */

// Dutch labels for the internal email (independent of the visitor's locale).
const SUBJECT_LABELS: Record<ContactSubject, string> = {
  general: 'Algemene vraag',
  registration: 'Inschrijving of betaling',
  teens: 'Tiener Insight',
  volunteer: 'Meewerken als vrijwilliger',
  other: 'Iets anders',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function submitContact({ data }: { data: ContactInput }): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) return { ok: false, error: 'generic' }

  const clean = parsed.data

  // Anti-spam, always enforced server-side (brief §11): fail silently as a
  // generic error, giving bots no field hints.
  if (clean.website) return { ok: false, error: 'generic' }
  if (Date.now() - (clean.formLoadedAt || 0) < 3000) return { ok: false, error: 'generic' }

  const subjectLabel = SUBJECT_LABELS[clean.subject]
  const lines: [string, string][] = [
    ['Naam', clean.name],
    ['E-mailadres', clean.email],
    ['Onderwerp', subjectLabel],
  ]

  const html = `
    <h2>Nieuw contactbericht</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${lines
        .map(
          ([k, v]) =>
            `<tr><td style="font-weight:bold;vertical-align:top">${k}</td><td>${escapeHtml(v)}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="white-space:pre-wrap">${escapeHtml(clean.message)}</p>
  `.trim()

  const text = [
    'Nieuw contactbericht',
    ...lines.map(([k, v]) => `${k}: ${v}`),
    '',
    clean.message,
  ].join('\n')

  await sendEmail({
    to: { email: env.NOTIFY_EMAIL },
    replyTo: { email: clean.email, name: clean.name },
    subject: `Nieuw contactbericht — ${subjectLabel}`,
    html,
    text,
  })

  return { ok: true }
}
