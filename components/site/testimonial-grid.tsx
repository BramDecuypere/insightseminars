import type { Locale, Testimonial } from '@/lib/content/types'
import { cn } from '@/lib/utils'
import { TestimonialCard } from './testimonial-card'

/**
 * Written testimonials in a grid whose column count follows the number of
 * items (1–3), so one or two quotes never leave an empty column behind.
 * `max` caps what is shown, matching the editor-facing limit in the Studio.
 */
export function TestimonialGrid({
  testimonials,
  locale,
  playLabel,
  max = 3,
  className,
}: {
  testimonials: Testimonial[]
  locale: Locale
  playLabel: string
  max?: number
  className?: string
}) {
  const items = testimonials.slice(0, max)
  if (items.length === 0) return null

  return (
    <ul
      className={cn(
        'grid gap-6',
        items.length === 1 && 'max-w-2xl',
        items.length === 2 && 'md:grid-cols-2',
        items.length >= 3 && 'md:grid-cols-3',
        className,
      )}
    >
      {items.map((tst) => (
        <li key={tst._id}>
          <TestimonialCard testimonial={tst} locale={locale} playLabel={playLabel} />
        </li>
      ))}
    </ul>
  )
}
