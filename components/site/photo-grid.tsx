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
 *
 * `fullBleed` renders a seamless, gapless wall meant to span the full
 * viewport width (caller must not wrap it in `container-site`), with more
 * columns so it still reads as a grid rather than a single stretched strip.
 */
export function PhotoGrid({
  images,
  locale,
  accent = 'accent3',
  openLabel,
  prevLabel,
  nextLabel,
  fullBleed = false,
}: {
  images: ImageAsset[]
  locale: Locale
  accent?: Accent
  openLabel: string
  prevLabel: string
  nextLabel: string
  fullBleed?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  if (!images.length) return null

  return (
    <>
      <div
        className={
          fullBleed
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
            : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'
        }
      >
        {images.map((image, i) => {
          const alt = (locale === 'en' ? image.alt?.en : image.alt?.nl) || image.alt?.nl || ''
          const caption =
            (locale === 'en' ? image.caption?.en : image.caption?.nl) || image.caption?.nl
          return (
            <figure
              key={image.src + i}
              className={
                fullBleed
                  ? 'flex flex-col overflow-hidden'
                  : 'flex flex-col overflow-hidden rounded-panel border border-lijn'
              }
            >
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
                  sizes={
                    fullBleed
                      ? '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw'
                      : '(max-width: 640px) 50vw, 33vw'
                  }
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
