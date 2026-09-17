/**
 * Registration identifiers (brief §7.1): `INS-` plus 8 Crockford base32
 * characters (no I, L, O, U to avoid confusion). Used as the sheet key and in
 * emails, so it must stay short and unambiguous.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function generateRegistrationId(random: () => number = Math.random): string {
  let out = ''
  for (let i = 0; i < 8; i += 1) {
    out += ALPHABET[Math.floor(random() * ALPHABET.length)]
  }
  return `INS-${out}`
}

/** A random 10-digit base for an OGM (see lib/domain/ogm). */
export function randomOgmBase(random: () => number = Math.random): string {
  return Array.from({ length: 10 }, () => Math.floor(random() * 10)).join('')
}
