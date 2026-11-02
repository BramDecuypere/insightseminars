'use client'

import { Pause, Play } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Below this many items the loop would show gaps on wide screens. */
const MIN_ITEMS_TO_SCROLL = 4
const SECONDS_PER_ITEM = 8

/**
 * Slowly scrolling band of testimonial cards (rendered by the caller, so this
 * client component stays free of content-layer imports). The list is rendered
 * twice for a seamless loop; the copy is hidden from assistive tech and focus.
 *
 * Motion that runs longer than 5 seconds needs a pause control (WCAG 2.2.2),
 * so there is an explicit button besides pausing on hover/focus. With
 * prefers-reduced-motion the band becomes a static, swipeable row instead.
 * With too few items to loop it falls back to a simple grid.
 */
export function TestimonialBand({
  items,
  label,
  pauseLabel,
  resumeLabel,
}: {
  items: { key: string; node: ReactNode }[]
  label: string
  pauseLabel: string
  resumeLabel: string
}) {
  const [paused, setPaused] = useState(false)

  if (items.length === 0) return null

  if (items.length < MIN_ITEMS_TO_SCROLL) {
    return (
      <ul aria-label={label} className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.key}>{item.node}</li>
        ))}
      </ul>
    )
  }

  const card = 'w-[min(22rem,80vw)] shrink-0 snap-start pr-6'

  return (
    <div>
      <div
        className="testimonial-band overflow-hidden motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto"
        data-paused={paused || undefined}
      >
        <div
          className="testimonial-band-track flex w-max"
          style={{ '--band-duration': `${items.length * SECONDS_PER_ITEM}s` } as CSSProperties}
        >
          <ul aria-label={label} className="flex">
            {items.map((item) => (
              <li key={item.key} className={card}>
                {item.node}
              </li>
            ))}
          </ul>
          <ul aria-hidden inert className="flex motion-reduce:hidden">
            {items.map((item) => (
              <li key={item.key} className={card}>
                {item.node}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className={cn(
          'mt-4 inline-flex items-center gap-2 rounded-full border border-lijn px-4 py-2 text-base font-semibold text-inkt transition-colors hover:bg-mist',
          'motion-reduce:hidden',
        )}
      >
        {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        {paused ? resumeLabel : pauseLabel}
      </button>
    </div>
  )
}
