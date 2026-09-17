import { describe, expect, it } from 'vitest'
import { isValidBelgianEnterprise, isValidEnterpriseNumber, normalizeVat } from './vat'

describe('normalizeVat', () => {
  it('strips spaces and dots and upper-cases', () => {
    expect(normalizeVat('be 0123.456.749')).toBe('BE0123456749')
  })
})

describe('isValidBelgianEnterprise', () => {
  // 0402.206.045 is a well-known valid Belgian enterprise number (mod-97 check).
  it('accepts a valid number with or without prefix and separators', () => {
    expect(isValidBelgianEnterprise('BE0402206045')).toBe(true)
    expect(isValidBelgianEnterprise('0402.206.045')).toBe(true)
  })

  it('rejects a bad check', () => {
    expect(isValidBelgianEnterprise('BE0402206046')).toBe(false)
  })

  it('rejects the wrong length', () => {
    expect(isValidBelgianEnterprise('12345')).toBe(false)
  })
})

describe('isValidEnterpriseNumber', () => {
  it('accepts a valid Belgian number', () => {
    expect(isValidEnterpriseNumber('BE0402206045')).toBe(true)
  })

  it('accepts a plausible foreign EU VAT number', () => {
    expect(isValidEnterpriseNumber('NL123456789B01')).toBe(true)
  })

  it('rejects nonsense', () => {
    expect(isValidEnterpriseNumber('hello')).toBe(false)
    expect(isValidEnterpriseNumber('')).toBe(false)
  })
})
