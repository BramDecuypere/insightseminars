import type { PriceOption } from '@/lib/content/types'
import { endOfDayBrussels } from './dates'

/**
 * Price rules (brief §6.3). Amounts are euros here; convert to integer cents
 * with toCents() before any money maths in server code.
 */

export function toCents(euros: number): number {
  return Math.round(euros * 100)
}

/** An option is valid when it has no validUntil, or today is on/before it (Brussels). */
export function isOptionValid(option: PriceOption, now: Date): boolean {
  if (!option.validUntil) return true
  return now.getTime() <= endOfDayBrussels(option.validUntil).getTime()
}

/**
 * The options a visitor may pick right now. While any early-bird option is
 * valid, all regular options are hidden; once it lapses, the regular price
 * appears. `option` and `audit` kinds are unaffected by that rule.
 */
export function visibleOptions(options: PriceOption[], now: Date): PriceOption[] {
  const valid = options.filter((o) => isOptionValid(o, now))
  const hasEarly = valid.some((o) => o.kind === 'earlyBird')
  return hasEarly ? valid.filter((o) => o.kind !== 'regular') : valid
}

/** Lowest valid non-audit amount, or null when the event is free (§6.3). */
export function lowestPrice(options: PriceOption[], now: Date): number | null {
  const amounts = visibleOptions(options, now)
    .filter((o) => o.kind !== 'audit')
    .map((o) => o.amount)
    .filter((a) => a > 0)
  if (amounts.length === 0) return null
  return Math.min(...amounts)
}

/** An event is free when it has no options, or only zero amounts (§6.3). */
export function isFree(options: PriceOption[]): boolean {
  if (!options || options.length === 0) return true
  return options.every((o) => o.amount <= 0)
}

/** The valid early-bird option, if one is currently active. */
export function activeEarlyBird(
  options: PriceOption[],
  now: Date,
): PriceOption | undefined {
  return visibleOptions(options, now).find((o) => o.kind === 'earlyBird')
}
