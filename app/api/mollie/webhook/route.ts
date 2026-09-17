import { NextResponse } from 'next/server'
import { getPayment, paymentAmount } from '@/lib/integrations/mollie'
import { findRegistration, updateRegistration } from '@/lib/integrations/sheets'
import { sendInternalEmail, sendRegistrantEmail } from '@/lib/emails'
import * as tpl from '@/emails/templates'
import { buildRowEmailContext } from '@/lib/registration/emails'
import { formatBrusselsTimestamp } from '@/lib/domain/dates'

/**
 * Mollie payment webhook (brief §8.2). Mollie POSTs a form-encoded `id`; we
 * fetch the payment (never trusting the body), find the row via
 * metadata.registrationId, and move its status forward. On "paid" we settle the
 * balance idempotently and send the confirmation exactly once. We answer 200
 * fast for every handled outcome, and 500 only on an internal error so Mollie
 * retries when it should.
 */

export const runtime = 'nodejs'

const round2 = (x: number): number => Math.round(x * 100) / 100
const num = (v: unknown): number => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const STATUS_MAP: Record<string, string> = {
  paid: 'betaald',
  failed: 'mislukt',
  canceled: 'geannuleerd',
  expired: 'verlopen',
  open: 'wacht_op_betaling',
  pending: 'wacht_op_betaling',
  authorized: 'wacht_op_betaling',
}

const ok = () => NextResponse.json({ ok: true }, { status: 200 })

export async function POST(req: Request) {
  let id = ''
  try {
    const form = await req.formData()
    id = String(form.get('id') ?? '')
  } catch {
    return ok()
  }
  if (!id) return ok()

  try {
    const payment = await getPayment(id)
    // Not configured (dev/preview stub) — nothing to act on.
    if (!payment) return ok()

    const registrationId = String((payment.metadata as { registrationId?: string })?.registrationId ?? '')
    if (!registrationId) return ok()

    const found = await findRegistration(registrationId)
    if (!found) {
      console.warn(`[mollie webhook] registration ${registrationId} not found`)
      return ok()
    }

    const row = found.values
    const currentStatus = String(row.status ?? '')
    const status = String(payment.status)

    // Forward-only: a late non-paid callback never downgrades a settled row.
    if (status !== 'paid' && (currentStatus === 'betaald' || currentStatus === 'voorschot_betaald')) {
      return ok()
    }

    if (status !== 'paid') {
      const mapped = STATUS_MAP[status] ?? 'wacht_op_betaling'
      if (mapped !== currentStatus) await updateRegistration(registrationId, { status: mapped })
      return ok()
    }

    // ---- paid: settle idempotently by summing every PAID payment on the row ----
    const ids = String(row.mollie_ids ?? '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    const idSet = new Set(ids)
    idSet.add(payment.id)

    let paidSum = 0
    for (const pid of idSet) {
      const p = pid === payment.id ? payment : await getPayment(pid)
      if (p && String(p.status) === 'paid') paidSum += paymentAmount(p)
    }
    paidSum = round2(paidSum)

    const price = num(row.prijs_eur)
    const credits = num(row.voorschot_eerder_eur) + num(row.sponsoring_eur)
    const outstanding = round2(Math.max(0, price - credits - paidSum))
    const mollieIds = Array.from(idSet).join(',')
    const stamp = formatBrusselsTimestamp(new Date())

    if (outstanding === 0) {
      const alreadyConfirmed = String(row.bevestiging_verstuurd_op ?? '').length > 0
      if (alreadyConfirmed) {
        // Replay after confirmation: keep the numbers right, never resend.
        await updateRegistration(registrationId, {
          status: 'betaald',
          betaald_eur: paidSum,
          openstaand_eur: 0,
          mollie_ids: mollieIds,
        })
        return ok()
      }
      await updateRegistration(registrationId, {
        status: 'betaald',
        betaald_eur: paidSum,
        openstaand_eur: 0,
        mollie_ids: mollieIds,
        betaald_op: stamp,
        bevestiging_verstuurd_op: stamp,
      })
      const ctx = await buildRowEmailContext(row)
      await sendRegistrantEmail(
        tpl.registrationConfirmed({ ...ctx.emailBase, amount: ctx.emailBase.paid }, ctx.locale),
        ctx.recipient,
      )
      await sendInternalEmail(
        tpl.internalRegistration({
          event: ctx.eventTitle,
          name: ctx.recipient.name ?? '',
          status: 'betaald',
          fields: [
            { label: 'Referentie', value: registrationId },
            { label: 'Betaald', value: ctx.emailBase.paid ?? '' },
            { label: 'Status', value: 'betaald' },
          ],
        }),
      )
      return ok()
    }

    // A balance remains → the deposit is in. Send "voorschot ontvangen" once.
    const wasDeposit = currentStatus === 'voorschot_betaald'
    await updateRegistration(registrationId, {
      status: 'voorschot_betaald',
      betaald_eur: paidSum,
      openstaand_eur: outstanding,
      mollie_ids: mollieIds,
      betaald_op: stamp,
    })
    if (!wasDeposit) {
      const ctx = await buildRowEmailContext({
        ...row,
        betaald_eur: paidSum,
        openstaand_eur: outstanding,
      })
      await sendRegistrantEmail(tpl.depositReceived(ctx.emailBase, ctx.locale), ctx.recipient)
    }
    return ok()
  } catch (err) {
    console.error('[mollie webhook] error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
