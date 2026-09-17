import type { Locale } from '@/lib/content/types'

/**
 * Whole-euro currency label, Belgian formatting (brief §6). Prices in the seed
 * are whole euros; "Vanaf €475". Cents only appear where an amount needs them.
 */
export function formatEuro(amount: number, locale: Locale): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0
  return new Intl.NumberFormat(locale === 'nl' ? 'nl-BE' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount)
}
