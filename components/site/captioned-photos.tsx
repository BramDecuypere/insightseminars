import Image from 'next/image'
import { pick } from '@/lib/content'
import type { CaptionedPhoto, Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

/** Photos with a title and explanatory text underneath, one or two per row. */
export function CaptionedPhotos({
  photos,
  locale,
  className,
}: {
  photos: CaptionedPhoto[]
  locale: Locale
  className?: string
}) {
  if (photos.length === 0) return null

  return (
    <ul className={cn('grid gap-10', photos.length > 1 && 'md:grid-cols-2', className)}>
      {photos.map((photo, i) => {
        const title = pick(photo.title, locale)
        const text = pick(photo.text, locale)
        return (
          <li key={i}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-panel border border-lijn">
                <Image
                  src={photo.image.src}
                  alt={pick(photo.image.alt, locale)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {title || text ? (
                <figcaption className="mt-4">
                  {title ? <span className="type-h3 block text-inkt">{title}</span> : null}
                  {text ? <span className="type-body mt-2 block text-inkt">{text}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          </li>
        )
      })}
    </ul>
  )
}
