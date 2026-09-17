/**
 * Age logic on the seminar start date (brief §6.6), computed on the calendar
 * date (day/month/year), independent of timezone-of-day.
 */

export interface BirthDate {
  day: number
  month: number // 1-12
  year: number
}

function toParts(value: string | Date): { y: number; m: number; d: number } {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [y, m, d] = dtf.format(new Date(value)).split('-').map(Number)
  return { y, m, d }
}

/** Completed years of age on the given date. */
export function ageOn(birth: BirthDate, on: string | Date): number {
  const { y, m, d } = toParts(on)
  let age = y - birth.year
  if (m < birth.month || (m === birth.month && d < birth.day)) age -= 1
  return age
}

export function isAdultOn(birth: BirthDate, startDate: string | Date): boolean {
  return ageOn(birth, startDate) >= 18
}

/** Whether the teen's age on the start date is within [min, max] inclusive. */
export function isTeenAgeValid(
  birth: BirthDate,
  startDate: string | Date,
  min: number,
  max: number,
): boolean {
  const age = ageOn(birth, startDate)
  return age >= min && age <= max
}

/** True when a birth date is a real calendar date (§ form validation). */
export function isRealDate(birth: BirthDate): boolean {
  const { day, month, year } = birth
  if (month < 1 || month > 12 || day < 1 || year < 1900) return false
  const daysInMonth = new Date(year, month, 0).getDate()
  return day <= daysInMonth
}
