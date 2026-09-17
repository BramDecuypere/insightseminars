import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

/** A Sanity image reference or asset object accepted by the URL builder. */
type ImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>['image']>[0]

const builder = createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset })

/** Build a Sanity CDN image URL, respecting hotspot/crop (brief §8.1). */
export function urlForImage(source: ImageSource) {
  return builder.image(source).auto('format').fit('max')
}

/** Resolve a plain URL string at a target width, or '' when there's no asset. */
export function imageUrl(source: ImageSource | undefined, width = 1200): string {
  if (!source) return ''
  return urlForImage(source).width(width).url()
}
