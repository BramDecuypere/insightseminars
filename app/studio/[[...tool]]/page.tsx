import { NextStudio } from 'next-sanity/studio'

import config from '@/sanity.config'

/**
 * Embedded Studio at /studio (brief §8.1). Statically rendered shell; the
 * Studio itself is a client app that talks to Sanity directly.
 */
export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
