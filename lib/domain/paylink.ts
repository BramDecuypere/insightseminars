import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { env, siteUrl } from '@/lib/env'

/**
 * Personal pay-link tokens (brief §7.1). `t` is HMAC-SHA256(registrationId,
 * PAYMENT_LINK_SECRET), compared in constant time. One link stays valid whatever
 * volunteers adjust, because the amount is read fresh from the sheet on click.
 */

const secret = () => env.PAYMENT_LINK_SECRET ?? 'dev-insecure-secret'

export function signRegistrationId(registrationId: string): string {
  return createHmac('sha256', secret()).update(registrationId).digest('hex')
}

export function verifyPayToken(registrationId: string, token: string | undefined): boolean {
  if (!token) return false
  const expected = signRegistrationId(registrationId)
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(token, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** The full pay link for a registration, stored in the sheet's `betaallink` column. */
export function payLinkUrl(registrationId: string, locale: 'nl' | 'en' = 'nl'): string {
  const token = signRegistrationId(registrationId)
  return `${siteUrl}/${locale}/pay/${registrationId}?t=${token}`
}
