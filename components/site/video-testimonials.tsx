import { hasVideo, pick } from '@/lib/content'
import type { Locale, Testimonial } from '@/lib/content/types'
import { cn } from '@/lib/utils'
import { VideoClip } from './video-clip'

/**
 * Video-first testimonials: the clip leads, with name, context and the quote
 * underneath. Testimonials without a playable clip are skipped, so a picked
 * testimonial whose video was removed later never shows a dead play button.
 */
export function VideoTestimonials({
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
  const items = testimonials.filter((t) => hasVideo(t.videoClip)).slice(0, max)
  if (items.length === 0) return null

  return (
    <ul
      className={cn(
        'grid gap-8',
        items.length === 1 && 'max-w-3xl',
        items.length === 2 && 'md:grid-cols-2',
        items.length >= 3 && 'md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((tst) => (
        <li key={tst._id}>
          <figure className="flex h-full flex-col">
            <VideoClip clip={tst.videoClip} playLabel={playLabel} locale={locale} />
            <figcaption className="mt-4">
              <span className="font-semibold text-inkt">{tst.name}</span>
              {tst.context ? (
                <span className="block text-base text-leisteen">{pick(tst.context, locale)}</span>
              ) : null}
            </figcaption>
            <blockquote className="mt-3 text-base text-inkt">{pick(tst.quote, locale)}</blockquote>
          </figure>
        </li>
      ))}
    </ul>
  )
}
