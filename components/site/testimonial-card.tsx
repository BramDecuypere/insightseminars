import Image from 'next/image'
import type { Locale, Testimonial } from '@/lib/content/types'
import { pick } from '@/lib/content'
import { VideoClip } from './video-clip'

/**
 * Testimonial (brief §9.4): the situation line in leisteen above a large quote,
 * then name and context, with an optional round photo or a video clip. Never
 * rendered with invented content — only published, consented testimonials.
 */
export function TestimonialCard({
  testimonial,
  locale,
  playLabel,
}: {
  testimonial: Testimonial
  locale: Locale
  playLabel: string
}) {
  const photoAlt =
    (locale === 'en' ? testimonial.photo?.alt.en : testimonial.photo?.alt.nl) ||
    testimonial.photo?.alt.nl ||
    ''

  return (
    <figure className="flex h-full flex-col rounded-panel border border-lijn bg-papier p-6">
      {testimonial.videoClip ? (
        <div className="mb-5">
          <VideoClip clip={testimonial.videoClip} playLabel={playLabel} locale={locale} />
        </div>
      ) : null}
      <p className="text-base text-leisteen">{pick(testimonial.situation, locale)}</p>
      <blockquote className="type-lead mt-2 flex-1 text-inkt">
        {pick(testimonial.quote, locale)}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {testimonial.photo ? (
          <Image
            src={testimonial.photo.src}
            alt={photoAlt}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        ) : null}
        <span className="text-base">
          <span className="font-semibold text-inkt">{testimonial.name}</span>
          {testimonial.context ? (
            <span className="block text-leisteen">{pick(testimonial.context, locale)}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  )
}
