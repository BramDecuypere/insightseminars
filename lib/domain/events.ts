import type { InsightEvent } from '@/lib/content/types'
import { endOfDayBrussels } from './dates'

/**
 * Event visibility and registration availability (brief §6.1–6.2).
 * All comparisons use the injected `now` so they are testable.
 */

/** Visible while its end is now or later; past events disappear on their own. */
export function isVisible(event: InsightEvent, now: Date): boolean {
  return new Date(event.end).getTime() >= now.getTime()
}

export function sortByStart<T extends { start: string }>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}

export type RegistrationState = 'open' | 'waitlist' | 'closed'

/**
 * Whether registration is open (§6.2): status open/almostFull, start in the
 * future, and no deadline passed.
 */
export function isRegistrationOpen(event: InsightEvent, now: Date): boolean {
  const statusOk =
    event.registrationStatus === 'open' ||
    event.registrationStatus === 'almostFull'
  const inFuture = new Date(event.start).getTime() > now.getTime()
  const deadlineOk =
    !event.registrationDeadline ||
    endOfDayBrussels(event.registrationDeadline).getTime() >= now.getTime()
  return statusOk && inFuture && deadlineOk
}

/** The registration CTA state for an event (§6.2). */
export function registrationState(
  event: InsightEvent,
  now: Date,
): RegistrationState {
  if (isRegistrationOpen(event, now)) return 'open'
  if (event.registrationStatus === 'full' && event.waitlistEnabled) {
    return 'waitlist'
  }
  return 'closed'
}
