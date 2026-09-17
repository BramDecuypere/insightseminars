import { z } from 'zod'

/**
 * Shared newsletter validation (brief §7.5). Only an email is collected; the
 * locale picks the Brevo list and double opt-in template. Anti-spam mirrors the
 * other forms (honeypot + 3s time trap).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const newsletterSchema = z.object({
  website: z.string().max(0, 'honeypot').optional().default(''),
  formLoadedAt: z.number().optional().default(0),
  email: z.string().trim().regex(EMAIL_RE, 'email'),
  locale: z.enum(['nl', 'en']),
})

export type NewsletterFormInput = z.infer<typeof newsletterSchema>

export type NewsletterResult = { ok: true } | { ok: false; error: 'generic' }
