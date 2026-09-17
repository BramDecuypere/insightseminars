import { describe, expect, it } from 'vitest'
import type { InsightEvent } from '@/lib/content/types'
import { isVisible, registrationState } from './events'
import { ageOn, isTeenAgeValid } from './age'

const base: InsightEvent = {
  _id: 'e1',
  type: 'seminar',
  slug: 'insight-1-2027-02-antwerpen',
  start: '2027-02-19T09:00:00+01:00',
  end: '2027-02-21T22:00:00+01:00',
  language: 'en-nl',
  registrationStatus: 'open',
  paymentTiming: 'immediate',
  priceOptions: [],
}

describe('event visibility (§6.1)', () => {
  it('disappears once now is past the end', () => {
    expect(isVisible(base, new Date('2027-02-21T20:00:00Z'))).toBe(true)
    expect(isVisible(base, new Date('2027-02-22T00:00:00Z'))).toBe(false)
  })
})

describe('registration state (§6.2)', () => {
  const now = new Date('2026-06-01T00:00:00Z')
  it('is open for a future open event', () => {
    expect(registrationState(base, now)).toBe('open')
  })
  it('is waitlist when full and waitlist enabled', () => {
    expect(
      registrationState({ ...base, registrationStatus: 'full', waitlistEnabled: true }, now),
    ).toBe('waitlist')
  })
  it('is closed once the start has passed', () => {
    expect(registrationState(base, new Date('2027-02-20T00:00:00Z'))).toBe('closed')
  })
})

describe('age on the start date (§6.6)', () => {
  it('counts completed years', () => {
    expect(ageOn({ day: 20, month: 2, year: 2009 }, '2027-02-19T09:00:00+01:00')).toBe(17)
    expect(ageOn({ day: 19, month: 2, year: 2009 }, '2027-02-19T09:00:00+01:00')).toBe(18)
  })
  it('validates the teen age range inclusively', () => {
    expect(isTeenAgeValid({ day: 1, month: 1, year: 2013 }, '2027-05-06', 14, 19)).toBe(true)
    expect(isTeenAgeValid({ day: 1, month: 1, year: 2014 }, '2027-05-06', 14, 19)).toBe(false)
  })
})
