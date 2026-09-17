import 'server-only'
import { findRegistration } from '@/lib/integrations/sheets'
import type { ConfirmationState } from './types'

/**
 * Map a sheet row's Dutch status (brief §8.3) to a confirmation-page state
 * (brief §7.1), so the client poller can react as a Mollie payment settles.
 */

export interface RegistrationStatus {
  /** Resolved confirmation state, or 'unknown' when the row can't be read. */
  state: ConfirmationState | 'unknown'
  /** Whether the poller should keep waiting for a change. */
  pending: boolean
  payUrl?: string
  eventSlug?: string
}

const STATE_BY_STATUS: Record<string, ConfirmationState> = {
  betaald: 'paid',
  voorschot_betaald: 'paid',
  ingeschreven: 'free',
  mislukt: 'failed',
  geannuleerd: 'failed',
  verlopen: 'failed',
  wacht_op_betaling: 'pending',
  wacht_op_overschrijving: 'transfer',
  betaal_later: 'later',
  te_controleren: 'check',
  wachtlijst: 'waitlist',
}

export async function readRegistrationStatus(ref: string): Promise<RegistrationStatus> {
  if (!ref) return { state: 'unknown', pending: false }
  const found = await findRegistration(ref)
  if (!found) {
    // Not configured (preview) or not found yet — keep the pending view.
    return { state: 'unknown', pending: true }
  }
  const dutch = String(found.values.status ?? '')
  const state = STATE_BY_STATUS[dutch] ?? 'pending'
  return {
    state,
    pending: state === 'pending',
    payUrl: String(found.values.betaallink ?? '') || undefined,
    eventSlug: String(found.values.activiteit_slug ?? '') || undefined,
  }
}
