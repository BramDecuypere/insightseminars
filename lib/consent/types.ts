/**
 * Shared consent types (GDPR cookie banner). Isomorphic — imported by the
 * `'use server'` cookie writer (lib/consent/actions.ts) and by client
 * components reading `document.cookie` — so it must stay free of
 * `next/headers` and other server-only imports.
 */

export const CONSENT_COOKIE = 'isb_consent'
export const CONSENT_VERSION = 1
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180 // 6 months

/** Fired on `window` after a consent choice is saved, so components mounted
 *  elsewhere in the tree (e.g. Analytics) can react without a page reload. */
export const CONSENT_CHANGE_EVENT = 'isb:consent-change'

export type ConsentPreferences = {
  analytics: boolean
}

export type ConsentRecord = ConsentPreferences & { v: number }

export function parseConsentCookie(value: string | undefined): ConsentRecord | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<ConsentRecord>
    if (parsed.v !== CONSENT_VERSION || typeof parsed.analytics !== 'boolean') return null
    return { analytics: parsed.analytics, v: CONSENT_VERSION }
  } catch {
    return null
  }
}

export function serializeConsent(preferences: ConsentPreferences): string {
  return JSON.stringify({ ...preferences, v: CONSENT_VERSION } satisfies ConsentRecord)
}

/** Reads the saved choice from `document.cookie`. Client-only: returns null during SSR. */
export function readClientConsentCookie(): ConsentRecord | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  if (!match) return null
  return parseConsentCookie(decodeURIComponent(match[1]))
}
