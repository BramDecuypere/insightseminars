import { describe, expect, it } from 'vitest'
import type { PriceOption } from '@/lib/content/types'
import { isFree, lowestPrice, visibleOptions } from './pricing'

const options: PriceOption[] = [
  { kind: 'earlyBird', label: { nl: 'Vroegboek' }, amount: 775, validUntil: '2026-10-04' },
  { kind: 'regular', label: { nl: 'Standaard' }, amount: 850 },
  { kind: 'audit', label: { nl: 'Audit' }, amount: 695, requiresGraduate: true },
]

describe('early-bird visibility around the Brussels end-of-day cut-off', () => {
  it('hides the regular price through 23:59 Brussels on the validUntil date', () => {
    // 2026-10-04 is CEST (+02:00); end of day = 21:59:59.999Z
    const justBefore = new Date('2026-10-04T21:59:00.000Z')
    const visible = visibleOptions(options, justBefore)
    expect(visible.some((o) => o.kind === 'earlyBird')).toBe(true)
    expect(visible.some((o) => o.kind === 'regular')).toBe(false)
    expect(lowestPrice(options, justBefore)).toBe(775)
  })

  it('shows the regular price once the early-bird day has passed', () => {
    const justAfter = new Date('2026-10-04T22:30:00.000Z')
    const visible = visibleOptions(options, justAfter)
    expect(visible.some((o) => o.kind === 'earlyBird')).toBe(false)
    expect(visible.some((o) => o.kind === 'regular')).toBe(true)
    expect(lowestPrice(options, justAfter)).toBe(850)
  })

  it('keeps the early-bird valid at the last Brussels second of the day', () => {
    const lastSecond = new Date('2026-10-04T21:59:59.500Z')
    expect(lowestPrice(options, lastSecond)).toBe(775)
  })
})

describe('lowestPrice and isFree', () => {
  it('ignores audit amounts for the "vanaf" price', () => {
    const now = new Date('2026-10-04T22:30:00.000Z')
    // regular 850 shown, audit 695 excluded
    expect(lowestPrice(options, now)).toBe(850)
  })

  it('treats no options or only zero amounts as free', () => {
    expect(isFree([])).toBe(true)
    expect(isFree([{ kind: 'option', label: { nl: 'Gratis' }, amount: 0 }])).toBe(true)
  })

  it('picks the lowest of independent options', () => {
    const now = new Date('2027-01-01T00:00:00.000Z')
    const teen: PriceOption[] = [
      { kind: 'option', label: { nl: 'Met overnachting' }, amount: 600 },
      { kind: 'option', label: { nl: 'Zonder overnachting' }, amount: 400 },
    ]
    expect(lowestPrice(teen, now)).toBe(400)
  })
})
