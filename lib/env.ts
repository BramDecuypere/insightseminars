import 'server-only'
import { z } from 'zod'

/**
 * Environment validation (brief §8.6). Integration keys are optional so the
 * preview and local dev never crash when they are absent: each integration
 * checks its own keys and logs a warning instead (see `requireEnv`). Only the
 * always-safe public vars are strictly parsed.
 */

const schema = z.object({
  // Public, always present (a sensible default keeps preview working).
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://insightseminars.be'),

  // Payments / links.
  PAYMENT_MODE: z.enum(['mollie', 'bank_transfer']).default('bank_transfer'),
  MOLLIE_API_KEY: z.string().optional(),
  PAYMENT_LINK_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Google Sheets.
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),

  // Brevo (transactional email + newsletter).
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Insight Seminars België <info@insightseminars.be>'),
  NOTIFY_EMAIL: z.string().default('info@insightseminars.be'),
  BREVO_LIST_ID_NL: z.string().optional(),
  BREVO_LIST_ID_EN: z.string().optional(),
  BREVO_DOI_TEMPLATE_ID_NL: z.string().optional(),
  BREVO_DOI_TEMPLATE_ID_EN: z.string().optional(),

  // Invoicing fallback.
  INVOICE_EMAIL: z.string().default('info@insightseminars.be'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  // Only the defaulted/public vars can fail here; surface it loudly but do not
  // hard-crash the dev server.
  console.error('[v0] Invalid environment configuration:', parsed.error.flatten().fieldErrors)
}

export const env = (parsed.success ? parsed.data : schema.parse({})) as z.infer<typeof schema>

export const isProd = process.env.NODE_ENV === 'production'
export const paymentMode = env.PAYMENT_MODE

/** True when every listed key is set; otherwise logs once which keys are missing. */
export function hasKeys(keys: (keyof typeof env)[], integration: string): boolean {
  const missing = keys.filter((k) => !env[k])
  if (missing.length > 0) {
    console.warn(
      `[v0] ${integration} is not configured (missing ${missing.join(', ')}); ` +
        'falling back to logging instead of a live call.',
    )
    return false
  }
  return true
}

export const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
