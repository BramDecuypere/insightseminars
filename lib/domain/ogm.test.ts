import { describe, expect, it } from 'vitest'
import { checkDigits, computeOgm, formatOgm } from './ogm'

describe('OGM check digits (mod 97, 0 becomes 97)', () => {
  it('uses the remainder as the check digits', () => {
    expect(checkDigits('0000000001')).toBe('01')
    expect(checkDigits('0000000042')).toBe('42')
  })

  it('uses 97 when the remainder is 0', () => {
    // 97 mod 97 = 0 -> 97
    expect(checkDigits('0000000097')).toBe('97')
    // 194 mod 97 = 0 -> 97
    expect(checkDigits('0000000194')).toBe('97')
  })

  it('computes the full 12-digit reference', () => {
    expect(computeOgm('0000000097')).toBe('000000009797')
    expect(computeOgm('0000000001')).toBe('000000000101')
  })

  it('formats as +++123/4567/89012+++', () => {
    expect(formatOgm('123456789012')).toBe('+++123/4567/89012+++')
  })

  it('rejects a base that is not exactly 10 digits', () => {
    expect(() => checkDigits('123')).toThrow()
    expect(() => formatOgm('123')).toThrow()
  })
})
