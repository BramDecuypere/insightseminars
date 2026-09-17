/**
 * Belgian enterprise / VAT number validation (brief §6.13). Belgian format is
 * `BE0123456789` or `0123.456.789` (10 digits, first digit 0 or 1, with a
 * mod-97 check). Other EU VAT formats are accepted loosely so foreign
 * companies can still register.
 */

/** Strip spaces, dots and an optional country prefix; upper-case the result. */
export function normalizeVat(input: string): string {
  return input.replace(/[\s.]/g, '').toUpperCase()
}

/** Belgian enterprise number: 10 digits with a 97-complement check on the last 2. */
export function isValidBelgianEnterprise(input: string): boolean {
  const cleaned = normalizeVat(input).replace(/^BE/, '')
  if (!/^0?\d{9}$/.test(cleaned)) return false
  const digits = cleaned.padStart(10, '0')
  if (!/^[01]/.test(digits)) return false
  const base = Number(digits.slice(0, 8))
  const check = Number(digits.slice(8, 10))
  return 97 - (base % 97) === check
}

/** A loose EU VAT shape: 2 letters + 2-13 alphanumerics, at least one digit. */
export function isValidEuVat(input: string): boolean {
  return /^[A-Z]{2}(?=[0-9A-Z]*[0-9])[0-9A-Z]{2,13}$/.test(normalizeVat(input))
}

/** Accept a valid Belgian enterprise number or any plausible EU VAT number. */
export function isValidEnterpriseNumber(input: string): boolean {
  if (!input) return false
  const cleaned = normalizeVat(input)
  if (/^BE/.test(cleaned) || /^0?\d{9,10}$/.test(cleaned)) {
    return isValidBelgianEnterprise(cleaned) || isValidEuVat(cleaned)
  }
  return isValidEuVat(cleaned)
}
