'use server'

import type { Locale } from '@/lib/content/types'
import { runSubmitRegistration } from '@/lib/registration/submit'
import { runInfoSessionSignup } from '@/lib/registration/info-session'
import type { RegistrationInput, InfoSessionInput } from '@/lib/registration/schema'
import type { SubmitResult } from '@/lib/registration/types'

/**
 * Server actions for the registration forms (brief §7.1, §7.3). Thin wrappers
 * over the server-only logic so the client can import just these functions.
 */

export async function submitRegistration(payload: {
  locale: Locale
  eventSlug: string
  data: RegistrationInput
  /** Teen consent upload (brief §7.2). Sent as a File so it is never stored. */
  consentFile?: File
}): Promise<SubmitResult> {
  return runSubmitRegistration(payload)
}

export async function submitInfoSession(payload: {
  locale: Locale
  eventSlug: string
  data: InfoSessionInput
}): Promise<SubmitResult> {
  return runInfoSessionSignup(payload)
}

export type { RegistrationStatus } from '@/lib/registration/status'

/**
 * Read a registration's current confirmation state from the sheet (brief §7.1).
 * The confirmation page polls this while a Mollie payment is still pending.
 */
export async function getRegistrationStatus(ref: string) {
  const { readRegistrationStatus } = await import('@/lib/registration/status')
  return readRegistrationStatus(ref)
}
