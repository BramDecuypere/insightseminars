/**
 * Belgian structured payment reference (OGM/gestructureerde mededeling, §6.8):
 * 10 digits + 2 check digits, where the check is the 10 digits mod 97
 * (97 when the remainder is 0). Rendered as +++123/4567/89012+++.
 */

/** The two check digits (as a zero-padded string) for a 10-digit base. */
export function checkDigits(base10: string): string {
  if (!/^\d{10}$/.test(base10)) {
    throw new Error('OGM base must be exactly 10 digits')
  }
  const remainder = Number(BigInt(base10) % BigInt(97))
  const check = remainder === 0 ? 97 : remainder
  return String(check).padStart(2, '0')
}

/** The full 12-digit reference for a 10-digit base. */
export function computeOgm(base10: string): string {
  return base10 + checkDigits(base10)
}

/** Format 12 digits as +++123/4567/89012+++. */
export function formatOgm(twelveDigits: string): string {
  if (!/^\d{12}$/.test(twelveDigits)) {
    throw new Error('OGM must be exactly 12 digits')
  }
  const a = twelveDigits.slice(0, 3)
  const b = twelveDigits.slice(3, 7)
  const c = twelveDigits.slice(7, 12)
  return `+++${a}/${b}/${c}+++`
}

/** Generate a random, formatted OGM. Pass a base for deterministic tests. */
export function generateOgm(base10?: string): string {
  const base =
    base10 ??
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
  return formatOgm(computeOgm(base))
}
