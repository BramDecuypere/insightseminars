'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { ImageAsset, Locale, VideoClip as Clip } from '@/lib/content/types'

/**
 * Click-to-load video (brief §5.2, §9.4). No YouTube or media request happens
 * before the visitor clicks. Captions are on by default. When no clip exists
 * yet, a still poster is shown with no play button (never a fake control).
 */
export function VideoClip({
  clip,
  poster,
  caption,
  playLabel,
  locale,
}: {
  clip?: Clip
  poster?: ImageAsset
  caption?: string
  playLabel: string
  locale: Locale
}) {
  const [playing, setPlaying] = useState(false)

  const posterAsset = clip?.poster ?? poster
  const posterAlt =
    (locale === 'en' ? posterAsset?.alt?.en : posterAsset?.alt?.nl) ||
    posterAsset?.alt?.nl ||
    ''
  const clipTitle = clip?.title
  const captionText =
    caption ?? (clipTitle ? (locale === 'en' ? clipTitle.en : clipTitle.nl) : undefined)

  // No clip: static poster figure, no play affordance.
  if (!clip) {
    if (!posterAsset) return null
    return (
      <figure className="overflow-hidden rounded-panel border border-lijn">
        <div className="relative aspect-video">
          <Image src={posterAsset.src} alt={posterAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        {captionText ? (
          <figcaption className="bg-mist px-4 py-3 text-base text-leisteen">
            {captionText}
          </figcaption>
        ) : null}
      </figure>
    )
  }

  const vtt = clip.captions ? (locale === 'en' ? clip.captions.en : clip.captions.nl) : undefined

  return (
    <figure className="overflow-hidden rounded-panel border border-lijn">
      <div className="relative aspect-video bg-avondblauw">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
          >
            {posterAsset ? (
              <Image src={posterAsset.src} alt={posterAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : null}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-papier/95 shadow-sm transition-transform group-hover:scale-105">
                <Play className="ml-1 size-7 text-avondblauw" />
              </span>
            </span>
            <span className="sr-only">{playLabel}</span>
          </button>
        ) : clip.source === 'youtube' && clip.youtubeUrl ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={toNoCookieEmbed(clip.youtubeUrl)}
            title={captionText ?? 'video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : clip.file ? (
          <video className="absolute inset-0 h-full w-full" controls autoPlay preload="none" poster={posterAsset?.src}>
            <source src={clip.file} type="video/mp4" />
            {vtt ? <track kind="captions" src={vtt} srcLang={locale} default /> : null}
          </video>
        ) : null}
      </div>
      {captionText ? (
        <figcaption className="bg-mist px-4 py-3 text-base text-leisteen">
          {captionText}
        </figcaption>
      ) : null}
    </figure>
  )
}

function toNoCookieEmbed(url: string): string {
  const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1]
  return `https://www.youtube-nocookie.com/embed/${id ?? ''}?autoplay=1&cc_load_policy=1`
}
