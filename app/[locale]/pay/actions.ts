'use server'

import { findRegistration, updateRegistration } from '@/lib/integrations/sheets'
import { createPayment } from '@/lib/integrations/mollie'
import { verifyPayToken } from '@/lib/domain/paylink'

/**
 * Start a Mollie payment from a personal pay link (brief §7.1). The amount is
 * read FRESH from the sheet's `openstaand_eur` on every click, so a volunteer
 * adjusting the balance changes what is charged. The token is re-verified
 * server-side; a new payment id is appended to `mollie_ids` for the webhook.
 */

export type PayLinkResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: 'invalid' | 'notfound' | 'paid' | 'unavailable' }

const num = (v: unknown): number => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export async function createPayLinkPayment(
  registrationId: string,
  token: string,
): Promise<PayLinkResult> {
  if (!verifyPayToken(registrationId, token)) return { ok: false, error: 'invalid' }

  const found = await findRegistration(registrationId)
  if (!found) return { ok: false, error: 'notfound' }

  const row = found.values
  const outstanding = num(row.openstaand_eur)
  if (outstanding <= 0) return { ok: false, error: 'paid' }

  const locale = String(row.taal ?? '') === 'en' ? 'en' : 'nl'
  const eventTitle = String(row.activiteit ?? '')
  const name = String(row.contact_naam ?? '')

  const created = await createPayment({
    amount: outstanding,
    description: `${eventTitle} – ${name}`.trim(),
    registrationId,
    eventSlug: String(row.activiteit_slug ?? ''),
    locale,
  })
  if (!created) return { ok: false, error: 'unavailable' }

  // Record the new payment id for the webhook, and mark the row awaiting payment.
  const ids = String(row.mollie_ids ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  ids.push(created.id)
  await updateRegistration(registrationId, {
    mollie_ids: ids.join(','),
    betaalwijze: 'mollie',
    status: 'wacht_op_betaling',
  })

  return { ok: true, checkoutUrl: created.checkoutUrl }
}
