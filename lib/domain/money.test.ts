import { describe, expect, it } from 'vitest'
import { computeAmounts, toMollieValue } from './money'

describe('computeAmounts', () => {
  it('charges the full price by default', () => {
    expect(computeAmounts({ price: 475, payChoice: 'volledig' })).toEqual({
      price: 475,
      payNow: 475,
      outstanding: 0,
      declaredCredit: false,
    })
  })

  it('charges the deposit and leaves the rest outstanding', () => {
    expect(
      computeAmounts({ price: 475, payChoice: 'voorschot', depositAmount: 100 }),
    ).toEqual({ price: 475, payNow: 100, outstanding: 375, declaredCredit: false })
  })

  it('ignores a deposit choice when the event has no deposit', () => {
    const r = computeAmounts({ price: 475, payChoice: 'voorschot' })
    expect(r.payNow).toBe(475)
    expect(r.outstanding).toBe(0)
  })

  it('starts no payment when an earlier deposit is declared (te_controleren)', () => {
    const r = computeAmounts({ price: 475, payChoice: 'volledig', earlierDeposit: 100 })
    expect(r.declaredCredit).toBe(true)
    expect(r.payNow).toBe(0)
    expect(r.outstanding).toBe(375)
  })

  it('starts no payment when sponsoring is declared', () => {
    const r = computeAmounts({ price: 475, payChoice: 'volledig', sponsoring: 475 })
    expect(r.declaredCredit).toBe(true)
    expect(r.payNow).toBe(0)
    expect(r.outstanding).toBe(0)
  })

  it('treats a zero price as free', () => {
    expect(computeAmounts({ price: 0, payChoice: 'volledig' })).toEqual({
      price: 0,
      payNow: 0,
      outstanding: 0,
      declaredCredit: false,
    })
  })
})

describe('toMollieValue', () => {
  it('formats to two decimals', () => {
    expect(toMollieValue(475)).toBe('475.00')
    expect(toMollieValue(99.9)).toBe('99.90')
  })
})
