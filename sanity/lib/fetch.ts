import type { QueryParams } from 'next-sanity'

import { client } from './client'
import { readToken } from '@/sanity/env'

/**
 * Tagged fetch (brief §8.1). Every read is cached for a long time and tagged
 * `sanity:<type>`; the revalidate webhook busts a tag on publish/delete so
 * volunteers see changes on the next page load. No defineLive/SanityLive.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string
  params?: QueryParams
  tags: string[]
}): Promise<T> {
  return client.fetch<T>(query, params, {
    // Server-only token is used once the dataset is private (§5.2 note).
    ...(readToken ? { token: readToken } : {}),
    perspective: 'published',
    useCdn: !readToken,
    next: {
      revalidate: readToken ? 0 : 3600,
      tags,
    },
  })
}
