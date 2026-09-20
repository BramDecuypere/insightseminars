import type { FlowOption } from './flow'

/**
 * Result of the submitRegistration server action (brief §7.1). The client
 * either navigates to `redirect` (confirmation page or a payment checkout) or
 * renders the returned errors. Field errors carry the same stable codes the
 * shared schema produces, so the form maps them to `form.errors.*`.
 */
export type SubmitResult =
  | { ok: true; redirect: string }
  | { ok: false; error: 'priceExpired'; options: FlowOption[] }
  | { ok: false; error: 'full' | 'closed' | 'generic' }
  | { ok: false; fieldErrors: Record<string, string> }

/** Confirmation states rendered by the confirmation page (§7.1). */
export type ConfirmationState =
  | 'paid'
  | 'pending'
  | 'open'
  | 'failed'
  | 'canceled'
  | 'expired'
  | 'transfer'
  | 'later'
  | 'waitlist'
  | 'free'
  | 'check'
  | 'info'
