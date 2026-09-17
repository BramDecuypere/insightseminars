import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { listRegistrations, updateRegistration } from '@/lib/integrations/sheets'
import { sendRegistrantEmail } from '@/lib/emails'
import * as tpl from '@/emails/templates'
import { buildRowEmailContext } from '@/lib/registration/emails'
import { formatBrusselsTimestamp } from '@/lib/domain/dates'

/**
 * Daily Vercel Cron (brief §7.1): email the personal pay link to every row
 * whose `stuur_betaallink` box is ticked, then clear the box and stamp
 * `betaallink_verstuurd_op`. Protected by CRON_SECRET (Vercel sends it as a
 * Bearer token).
 */

export const runtime = 'nodejs'

const TICKED = new Set(['ja', 'true', 'waar', 'yes', '1'])
const isTicked = (v: unknown): boolean => TICKED.has(String(v ?? '').trim().toLowerCase())

function authorized(req: Request): boolean {
  const secret = env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const rows = await listRegistrations()
    const pending = rows.filter((r) => isTicked(r.values.stuur_betaallink) && r.values.betaallink)

    let sent = 0
    for (const { values } of pending) {
      const id = String(values.registratie_id ?? '')
      if (!id) continue
      const ctx = await buildRowEmailContext(values)
      await sendRegistrantEmail(tpl.payLink(ctx.emailBase, ctx.locale), ctx.recipient)
      await updateRegistration(id, {
        stuur_betaallink: false,
        betaallink_verstuurd_op: formatBrusselsTimestamp(new Date()),
      })
      sent += 1
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('[cron send-pay-links] error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
