import { getTranslations } from 'next-intl/server'
import type { RegistrationStatus } from '@/lib/content/types'
import type { RegistrationState } from '@/lib/domain/events'

/**
 * Status pill (brief §9.4). Colour is never the only signal: a dot sits beside
 * an always-present text label (§10, WCAG 2.2).
 */
const DOT: Record<string, string> = {
  open: 'var(--accent-3)',
  almostFull: 'var(--accent-2)',
  full: 'var(--leisteen)',
  waitlist: 'var(--accent-4)',
  closed: 'var(--leisteen)',
}

function resolveKey(
  status: RegistrationStatus,
  regState: RegistrationState,
): keyof typeof DOT {
  if (regState === 'waitlist') return 'waitlist'
  if (regState === 'open') return status === 'almostFull' ? 'almostFull' : 'open'
  return status === 'full' ? 'full' : 'closed'
}

export async function StatusBadge({
  status,
  regState,
}: {
  status: RegistrationStatus
  regState: RegistrationState
}) {
  const t = await getTranslations('status')
  const key = resolveKey(status, regState)

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-mist px-3 py-1 text-sm font-semibold text-inkt">
      <span
        aria-hidden
        className="size-2.5 rounded-full"
        style={{ backgroundColor: DOT[key] }}
      />
      {t(key)}
    </span>
  )
}
