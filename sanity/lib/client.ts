import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * Read client (brief §8.1): published perspective, CDN on, pinned apiVersion.
 * We deliberately do NOT use defineLive/SanityLive — plain fetches with
 * tag-based revalidation instead (§2, §8.1).
 */
export const client = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
