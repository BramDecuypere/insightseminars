'use client'

import Image from 'next/image'
import { useState, type CSSProperties } from 'react'
import { Lightbox } from '@/components/site/lightbox'
import { accentVar } from '@/components/site/accent'
import type { Accent, ImageAsset, Locale } from '@/lib/content/types'

/**
 * Mosaic photo grid (brief §4). Click/tap opens `Lightbox` on that image.
 * Hover is a CSS-only subtle zoom + accent tint overlay; both are covered by
 * the global `prefers-reduced-motion` rule, so no extra guard is needed here.
 */
export function PhotoGrid({
  images,
  locale,
  accent = 'accent3',
  openLabel,
  prevLabel,
  nextLabel,
}: {
  images: ImageAsset[]
  locale: Locale
  accent?: Accent
  openLabel: string
  prevLabel: string
  nextLabel: string
}) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  if (!images.length) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((image, i) => {
          const alt = (locale === 'en' ? image.alt?.en : image.alt?.nl) || image.alt?.nl || ''
          const caption =
            (locale === 'en' ? image.caption?.en : image.caption?.nl) || image.caption?.nl
          return (
            <figure key={image.src + i} className="flex flex-col overflow-hidden rounded-panel border border-lijn">
              <button
                type="button"
                onClick={() => {
                  setIndex(i)
                  setOpen(true)
                }}
                className="group relative block aspect-[4/3] w-full overflow-hidden"
                style={{ '--tint': accentVar[accent] } as CSSProperties}
              >
                <Image
                  src={image.src}
                  alt={alt}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <span className="absolute inset-0 bg-[var(--tint)] opacity-0 transition-opacity duration-300 group-hover:opacity-15" />
                <span className="sr-only">{openLabel}</span>
              </button>
              {caption ? (
                <figcaption className="bg-mist px-3 py-2 text-sm text-leisteen">{caption}</figcaption>
              ) : null}
            </figure>
          )
        })}
      </div>
      <Lightbox
        images={images}
        index={index}
        onIndexChange={setIndex}
        open={open}
        onOpenChange={setOpen}
        locale={locale}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
      />
    </>
  )
}
