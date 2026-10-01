import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

/** A Sanity image reference or asset object accepted by the URL builder. */
type ImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>['image']>[0]

const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset })

/** Build a Sanity CDN image URL, respecting hotspot/crop (brief §8.1). */
export function urlForImage(source: ImageSource) {
  return builder.image(source).auto('format').fit('max').quality(80)
}

/**
 * Resolve a plain URL string at a target width, or '' when there's no asset.
 *
 * This is the *master* fed into next/image (see next.config.ts), not the
 * final delivered size — Next derives its own responsive srcset (and
 * AVIF/WebP) from whatever width we request here, so it should be large
 * enough for the biggest layout the image can appear at (full-bleed/hero),
 * not the smallest (e.g. an avatar). Pass an explicit, smaller width for
 * assets that are always rendered small (avatars, thumbnails, OG images) so
 * Sanity's CDN doesn't ship more pixels than Next will ever need to resize.
 */
export function imageUrl(source: ImageSource | undefined, width = 2000): string {
  if (!source) return ''
  return urlForImage(source).width(width).url()
}
