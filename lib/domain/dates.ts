import type { Locale } from '@/lib/content/types'

/**
 * Date logic in the Europe/Brussels timezone (brief §2, §6). All functions are
 * pure and accept an injectable `now` so they can be tested deterministically.
 */

export const TIME_ZONE = 'Europe/Brussels'

/** Minutes that the given instant is offset from UTC in Brussels (handles DST). */
export function brusselsOffsetMinutes(instant: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(instant).reduce<Record<string, string>>(
    (acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value
      return acc
    },
    {},
  )
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === '24' ? '00' : parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  // Offsets are whole minutes; round away sub-second noise from the instant.
  return Math.round((asUtc - instant.getTime()) / 60000)
}

/**
 * The UTC instant of the end of a calendar day (23:59:59.999) in Brussels.
 * Used for early-bird and deadline cut-offs, which are valid "through" a day.
 */
export function endOfDayBrussels(dateStr: string): Date {
  const localAsUtc = Date.parse(`${dateStr}T23:59:59.999Z`)
  const offset = brusselsOffsetMinutes(new Date(localAsUtc))
  return new Date(localAsUtc - offset * 60000)
}

/** The UTC instant of the start of a calendar day (00:00:00) in Brussels. */
export function startOfDayBrussels(dateStr: string): Date {
  const localAsUtc = Date.parse(`${dateStr}T00:00:00.000Z`)
  const offset = brusselsOffsetMinutes(new Date(localAsUtc))
  return new Date(localAsUtc - offset * 60000)
}

const MONTHS: Record<Locale, string[]> = {
  nl: [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
    'september', 'oktober', 'november', 'december',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ],
}

function brusselsParts(instant: Date) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
  const parts = dtf.formatToParts(instant).reduce<Record<string, string>>(
    (acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value
      return acc
    },
    {},
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  }
}

/**
 * Human date range in Brussels time (brief §6.11).
 * Same month:   "19–21 februari 2027"
 * Across months: "30 april – 2 mei 2027"
 */
export function formatDateRange(
  start: string | Date,
  end: string | Date,
  locale: Locale,
): string {
  const s = brusselsParts(typeof start === 'string' ? new Date(start) : start)
  const e = brusselsParts(typeof end === 'string' ? new Date(end) : end)
  const months = MONTHS[locale] ?? MONTHS.nl

  if (s.year === e.year && s.month === e.month) {
    if (s.day === e.day) return `${s.day} ${months[s.month - 1]} ${s.year}`
    return `${s.day}\u2013${e.day} ${months[e.month - 1]} ${e.year}`
  }
  if (s.year === e.year) {
    return `${s.day} ${months[s.month - 1]} \u2013 ${e.day} ${months[e.month - 1]} ${e.year}`
  }
  return `${s.day} ${months[s.month - 1]} ${s.year} \u2013 ${e.day} ${months[e.month - 1]} ${e.year}`
}

/** Sheet/audit timestamp in Brussels time: "YYYY-MM-DD HH:mm" (brief §8.3). */
export function formatBrusselsTimestamp(instant: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = dtf.formatToParts(instant).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {})
  const hour = parts.hour === '24' ? '00' : parts.hour
  return `${parts.year}-${parts.month}-${parts.day} ${hour}:${parts.minute}`
}

/** Short single date, Brussels time. */
export function formatDate(value: string | Date, locale: Locale): string {
  const p = brusselsParts(typeof value === 'string' ? new Date(value) : value)
  const months = MONTHS[locale] ?? MONTHS.nl
  return `${p.day} ${months[p.month - 1]} ${p.year}`
}
