import type { QueryParams } from 'next-sanity'

import { client } from './client'
import { readToken } from '@/sanity/env'

/**
 * Tagged fetch (brief §8.1). Every read is tagged `sanity:<type>` and the
 * revalidate webhook busts a tag on publish/delete for near-instant updates.
 * The short time-based revalidate is a safety net: even if the webhook is
 * misconfigured (e.g. pointing at the wrong host), content still propagates
 * within ~1 minute instead of being stuck in the persisted Vercel Data Cache.
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
      revalidate: readToken ? 0 : 60,
      tags,
    },
  })
}
