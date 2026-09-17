/**
 * Sanity environment (brief §8.1, §8.6). The public marketing site runs on the
 * mock seed until NEXT_PUBLIC_SANITY_PROJECT_ID is set, so nothing here may
 * throw at import time — that keeps the v0 preview working without Sanity.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

/** True once a real project is connected; getters branch on this (§8.1). */
export const hasSanity = projectId.length > 0

/** Studio lives at /studio (embedded). */
export const studioUrl = '/studio'

/** Server-only read token, needed once the dataset is private (§5.2 note). */
export const readToken = process.env.SANITY_API_READ_TOKEN || ''
