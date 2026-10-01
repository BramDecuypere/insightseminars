'use server'

import { cookies } from 'next/headers'
import { CONSENT_COOKIE, CONSENT_MAX_AGE, serializeConsent, type ConsentPreferences } from './types'

/** Persists the visitor's cookie choice. Called from the banner/preferences dialog. */
export async function saveConsent(preferences: ConsentPreferences): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CONSENT_COOKIE, serializeConsent(preferences), {
    maxAge: CONSENT_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}
