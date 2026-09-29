import { Check } from 'lucide-react'
import { accentVar } from '@/components/site/accent'
import type { Accent } from '@/lib/content/types'

/**
 * Shared list markers (brief §9.2). Both take an optional accent so the
 * check colour follows the program accent; falls back to accent3 (green),
 * the site's default marker colour, when no program context exists.
 */

/** Plain vertical list with an accent-coloured check bullet. */
export function CheckList({
  items,
  accent = 'accent3',
}: {
  items: string[]
  accent?: Accent
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-lg text-inkt">
          <Check className="mt-1 size-5 shrink-0" style={{ color: accentVar[accent] }} aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Grid of mist chips with an accent-coloured check icon. */
export function FeatureBoxes({
  items,
  accent = 'accent3',
}: {
  items: string[]
  accent?: Accent
}) {
  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-2 rounded-full border border-lijn bg-mist px-4 py-2 text-base text-inkt"
        >
          <Check className="size-4 shrink-0" style={{ color: accentVar[accent] }} aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  )
}
