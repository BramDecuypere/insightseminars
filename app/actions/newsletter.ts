'use server'

import { startDoubleOptin } from '@/lib/integrations/brevo'
import { newsletterSchema, type NewsletterFormInput, type NewsletterResult } from '@/lib/forms/newsletter'

/**
 * Newsletter double opt-in server action (brief §7.5). Delegates to Brevo's
 * doubleOptinConfirmation endpoint with the per-locale list and template. The
 * email address is never logged (brief §11).
 */
export async function subscribeNewsletter(data: NewsletterFormInput): Promise<NewsletterResult> {
  const parsed = newsletterSchema.safeParse(data)
  if (!parsed.success) return { ok: false, error: 'generic' }

  const clean = parsed.data

  // Anti-spam, always enforced server-side (brief §11): fail silently.
  if (clean.website) return { ok: false, error: 'generic' }
  if (Date.now() - (clean.formLoadedAt || 0) < 3000) return { ok: false, error: 'generic' }

  const ok = await startDoubleOptin({ email: clean.email, locale: clean.locale })
  return ok ? { ok: true } : { ok: false, error: 'generic' }
}
