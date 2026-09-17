import { z } from 'zod'

/**
 * Shared contact-form validation (brief §7.4). The SAME schema runs on the
 * client (react-hook-form) and in the server action. Error `message` values are
 * stable codes mapped to `form.errors.*` translations, so no UI text lives here.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const CONTACT_SUBJECTS = ['general', 'registration', 'teens', 'volunteer', 'other'] as const
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]

export const contactSchema = z.object({
  // Anti-spam (brief §11): honeypot must stay empty; loadedAt drives the 3s trap.
  website: z.string().max(0, 'honeypot').optional().default(''),
  formLoadedAt: z.number().optional().default(0),

  name: z.string().trim().min(1, 'required'),
  email: z.string().trim().regex(EMAIL_RE, 'email'),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(1, 'required'),
})

export type ContactInput = z.infer<typeof contactSchema>

export type ContactResult = { ok: true } | { ok: false; error: 'generic' }
