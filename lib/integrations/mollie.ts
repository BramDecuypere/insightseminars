import 'server-only'
import { createMollieClient, Locale, type MollieClient, type Payment } from '@mollie/api-client'
import { env, hasKeys, siteUrl } from '@/lib/env'
import { toMollieValue } from '@/lib/domain/money'

/**
 * Mollie payments (brief §8.2). We never pass `method`, so Mollie's checkout
 * shows every enabled method (Bancontact, iDEAL, cards). When the API key is
 * missing (dev/preview) every call logs and no-ops, so the registration flow
 * keeps working and falls back to the pending state with a pay link.
 */

/** Mollie payment statuses we handle (brief §8.2). */
export type MollieStatus =
  | 'open'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'canceled'
  | 'expired'
  | 'failed'

let cached: MollieClient | null = null

function configured(): boolean {
  return hasKeys(['MOLLIE_API_KEY'], 'Mollie')
}

function client(): MollieClient {
  if (cached) return cached
  cached = createMollieClient({ apiKey: env.MOLLIE_API_KEY as string })
  return cached
}

export interface CreatePaymentInput {
  amount: number
  /** Human description, truncated to Mollie's 255-char limit. */
  description: string
  registrationId: string
  eventSlug: string
  locale: 'nl' | 'en'
}

export interface CreatedPayment {
  id: string
  checkoutUrl: string
}

/**
 * Create a payment and return its id + checkout URL. Returns null when Mollie
 * is not configured (the caller then keeps the row pending with a pay link).
 */
export async function createPayment(input: CreatePaymentInput): Promise<CreatedPayment | null> {
  if (!configured()) {
    console.log(
      `[v0] (mollie stub) create payment ${toMollieValue(input.amount)} EUR for ${input.registrationId}`,
    )
    return null
  }
  const payment = await client().payments.create({
    amount: { currency: 'EUR', value: toMollieValue(input.amount) },
    description: input.description.slice(0, 255),
    redirectUrl: `${siteUrl}/${input.locale}/register/confirmation?ref=${input.registrationId}&state=pending`,
    webhookUrl: `${siteUrl}/api/mollie/webhook`,
    locale: input.locale === 'nl' ? Locale.nl_BE : Locale.en_US,
    metadata: { registrationId: input.registrationId, eventSlug: input.eventSlug },
  })
  const checkoutUrl = payment.getCheckoutUrl() ?? payment._links?.checkout?.href
  if (!checkoutUrl) {
    console.error('[mollie] payment created without a checkout URL', payment.id)
    return null
  }
  return { id: payment.id, checkoutUrl }
}

/**
 * Fetch a payment (webhook: never trust the request body, brief §8.2). Returns
 * null only when Mollie is not configured. A live API error is thrown so the
 * webhook can answer 500 and let Mollie retry.
 */
export async function getPayment(id: string): Promise<Payment | null> {
  if (!configured()) {
    console.log(`[v0] (mollie stub) get payment ${id}`)
    return null
  }
  return client().payments.get(id)
}

/** Read the amount value ("475.00") of a payment as a number. */
export function paymentAmount(payment: Payment): number {
  const n = Number(payment.amount?.value)
  return Number.isFinite(n) ? n : 0
}
