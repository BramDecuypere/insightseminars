import 'server-only'
import { env, hasKeys } from '@/lib/env'

/**
 * Brevo transactional email + newsletter double opt-in (brief §8.4). Uses the
 * REST API with a plain `fetch` and the `api-key` header — no SDK. When the API
 * key is missing (dev/preview), calls log and no-op instead of crashing.
 */

const API = 'https://api.brevo.com/v3'

export interface EmailAttachment {
  name: string
  /** Base64-encoded content. */
  content: string
}

export interface SendEmailInput {
  to: { email: string; name?: string }
  subject: string
  html: string
  text: string
  replyTo?: { email: string; name?: string }
  attachments?: EmailAttachment[]
}

/** Parse `EMAIL_FROM` ("Name <email>") into Brevo's sender shape. */
function parseSender(): { email: string; name?: string } {
  const raw = env.EMAIL_FROM
  const match = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (match) return { name: match[1] || undefined, email: match[2] }
  return { email: raw.trim() }
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!hasKeys(['BREVO_API_KEY'], 'Brevo')) {
    // No recipient address in the log (brief §11: no personal data in logs).
    console.log(`[v0] (brevo stub) transactional email skipped: "${input.subject}"`)
    return
  }
  const body = {
    sender: parseSender(),
    to: [input.to],
    replyTo: input.replyTo,
    subject: input.subject,
    htmlContent: input.html,
    textContent: input.text,
    attachment: input.attachments?.map((a) => ({ name: a.name, content: a.content })),
  }
  const res = await fetch(`${API}/smtp/email`, {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY as string,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    // Never let a mail failure break the registration; log and continue.
    console.error(`[brevo] send failed (${res.status}): ${detail}`)
  }
}

export interface NewsletterInput {
  email: string
  locale: 'nl' | 'en'
}

/** Start Brevo's double opt-in flow for the newsletter (brief §7.5). */
export async function startDoubleOptin({ email, locale }: NewsletterInput): Promise<boolean> {
  const listKey = locale === 'en' ? 'BREVO_LIST_ID_EN' : 'BREVO_LIST_ID_NL'
  const templateKey = locale === 'en' ? 'BREVO_DOI_TEMPLATE_ID_EN' : 'BREVO_DOI_TEMPLATE_ID_NL'
  if (!hasKeys(['BREVO_API_KEY', listKey, templateKey], 'Brevo newsletter')) {
    // No subscriber address in the log (brief §11: no personal data in logs).
    console.log(`[v0] (brevo stub) double opt-in skipped (${locale})`)
    return true
  }
  const redirect =
    locale === 'en'
      ? `${env.NEXT_PUBLIC_SITE_URL}/en/newsletter/confirmed`
      : `${env.NEXT_PUBLIC_SITE_URL}/nl/nieuwsbrief/bevestigd`
  const res = await fetch(`${API}/contacts/doubleOptinConfirmation`, {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY as string,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes: { LANGUAGE: locale.toUpperCase() },
      includeListIds: [Number(env[listKey as keyof typeof env])],
      templateId: Number(env[templateKey as keyof typeof env]),
      redirectionUrl: redirect,
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error(`[brevo] double opt-in failed (${res.status}): ${detail}`)
    return false
  }
  return true
}
