'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ImageAsset, Locale } from '@/lib/content/types'

/**
 * Full-image viewer for `PhotoGrid` (brief §4). Built on shadcn `Dialog`, so
 * Escape/overlay close and focus trapping come from Radix/base-ui for free.
 * Prev/Next wrap around the set; also reachable via ArrowLeft/ArrowRight.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  locale,
  prevLabel,
  nextLabel,
}: {
  images: ImageAsset[]
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: Locale
  prevLabel: string
  nextLabel: string
}) {
  const image = images[index]
  if (!image) return null

  const alt = (locale === 'en' ? image.alt?.en : image.alt?.nl) || image.alt?.nl || ''
  const caption = (locale === 'en' ? image.caption?.en : image.caption?.nl) || image.caption?.nl

  const goPrev = () => onIndexChange((index - 1 + images.length) % images.length)
  const goNext = () => onIndexChange((index + 1) % images.length)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-panel border border-lijn bg-inkt p-0 sm:max-w-3xl"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') goPrev()
          if (event.key === 'ArrowRight') goNext()
        }}
      >
        <DialogTitle className="sr-only">{caption ?? alt}</DialogTitle>
        <figure className="flex flex-col">
          <div className="relative aspect-[4/3] w-full bg-inkt sm:aspect-video">
            <Image
              src={image.src}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={goPrev}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-papier/90 hover:bg-papier"
                >
                  <ChevronLeft className="size-5" />
                  <span className="sr-only">{prevLabel}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={goNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-papier/90 hover:bg-papier"
                >
                  <ChevronRight className="size-5" />
                  <span className="sr-only">{nextLabel}</span>
                </Button>
              </>
            ) : null}
          </div>
          {caption ? (
            <figcaption className="bg-mist px-4 py-3 text-base text-leisteen">{caption}</figcaption>
          ) : null}
        </figure>
      </DialogContent>
    </Dialog>
  )
}
