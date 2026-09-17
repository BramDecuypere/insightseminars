import 'server-only'
import { render } from '@react-email/render'
import { env } from '@/lib/env'
import { sendEmail, type EmailAttachment } from '@/lib/integrations/brevo'
import type { EmailResult } from '@/emails/templates'

/**
 * Render React Email templates to HTML + plain text and dispatch through Brevo
 * (brief §8.4, §13.9). Registrant emails go out in the page language; internal
 * emails are always Dutch. Failures are swallowed by the Brevo layer so a mail
 * problem never breaks a registration.
 */

async function renderResult(result: EmailResult): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(result.element),
    render(result.element, { plainText: true }),
  ])
  return { html, text }
}

export async function sendRegistrantEmail(
  result: EmailResult,
  to: { email: string; name?: string },
  attachments?: EmailAttachment[],
): Promise<void> {
  const { html, text } = await renderResult(result)
  await sendEmail({ to, subject: result.subject, html, text, attachments })
}

export async function sendInternalEmail(
  result: EmailResult,
  attachments?: EmailAttachment[],
): Promise<void> {
  const { html, text } = await renderResult(result)
  await sendEmail({
    to: { email: env.NOTIFY_EMAIL },
    subject: result.subject,
    html,
    text,
    attachments,
  })
}
