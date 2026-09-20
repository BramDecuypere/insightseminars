import 'server-only'
import { findRegistration } from '@/lib/integrations/sheets'
import { getPayment } from '@/lib/integrations/mollie'
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
  geannuleerd: 'canceled',
  verlopen: 'expired',
  wacht_op_betaling: 'pending',
  wacht_op_overschrijving: 'transfer',
  betaal_later: 'later',
  te_controleren: 'check',
  wachtlijst: 'waitlist',
}

/**
 * Map a live Mollie payment status to a confirmation state. `authorized` funds
 * are guaranteed, so we treat them as paid for the visitor's feedback; `pending`
 * is still settling (keep polling); everything else is terminal.
 */
const STATE_BY_MOLLIE: Record<string, ConfirmationState> = {
  paid: 'paid',
  authorized: 'paid',
  pending: 'pending',
  open: 'open',
  failed: 'failed',
  canceled: 'canceled',
  expired: 'expired',
}

/**
 * Ask Mollie directly for the outcome of a registration's payment(s). This
 * covers the window right after the redirect, before the webhook has written
 * the final status to the sheet. Returns null when Mollie is not configured
 * (dev/preview) or no payment id is on record.
 */
async function liveStateFromMollie(mollieIds: unknown): Promise<ConfirmationState | null> {
  const ids = String(mollieIds ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  if (ids.length === 0) return null

  let latest: ConfirmationState | null = null
  for (const id of ids) {
    let payment
    try {
      payment = await getPayment(id)
    } catch {
      continue
    }
    if (!payment) continue
    const mapped = STATE_BY_MOLLIE[String(payment.status)] ?? 'pending'
    // A paid/authorized payment wins outright over any other outcome.
    if (mapped === 'paid') return 'paid'
    latest = mapped
  }
  return latest
}

export async function readRegistrationStatus(ref: string): Promise<RegistrationStatus> {
  if (!ref) return { state: 'unknown', pending: false }
  const found = await findRegistration(ref)
  if (!found) {
    // Not configured (preview) or not found yet — keep the pending view.
    return { state: 'unknown', pending: true }
  }
  const dutch = String(found.values.status ?? '')
  let state = STATE_BY_STATUS[dutch] ?? 'pending'

  // While the sheet still shows "waiting", the webhook may not have landed yet:
  // ask Mollie so a canceled/expired/failed/paid outcome shows up immediately.
  if (state === 'pending') {
    const live = await liveStateFromMollie(found.values.mollie_ids)
    if (live) state = live
  }

  return {
    state,
    pending: state === 'pending',
    payUrl: String(found.values.betaallink ?? '') || undefined,
    eventSlug: String(found.values.activiteit_slug ?? '') || undefined,
  }
}
