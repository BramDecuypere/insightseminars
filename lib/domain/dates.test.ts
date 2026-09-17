import { describe, expect, it } from 'vitest'
import { endOfDayBrussels, formatDateRange } from './dates'

describe('formatDateRange (Brussels)', () => {
  it('renders a same-month range', () => {
    expect(
      formatDateRange('2027-02-19T09:00:00+01:00', '2027-02-21T22:00:00+01:00', 'nl'),
    ).toBe('19\u201321 februari 2027')
  })

  it('renders a cross-month range', () => {
    expect(
      formatDateRange('2027-04-30T09:00:00+02:00', '2027-05-02T22:00:00+02:00', 'nl'),
    ).toBe('30 april \u2013 2 mei 2027')
  })

  it('renders English month names', () => {
    expect(
      formatDateRange('2026-11-04T09:00:00+01:00', '2026-11-08T22:00:00+01:00', 'en'),
    ).toBe('4\u20138 November 2026')
  })
})

describe('endOfDayBrussels', () => {
  it('is 21:59:59.999Z on a summer (CEST) date', () => {
    expect(endOfDayBrussels('2026-10-04').toISOString()).toBe('2026-10-04T21:59:59.999Z')
  })

  it('is 22:59:59.999Z on a winter (CET) date', () => {
    expect(endOfDayBrussels('2027-01-19').toISOString()).toBe('2027-01-19T22:59:59.999Z')
  })
})
