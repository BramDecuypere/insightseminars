import { defineCliConfig } from 'sanity/cli'

import { dataset, projectId } from './sanity/env'

/**
 * Sanity CLI config (brief §8.1). Drives `sanity typegen` and dataset tooling.
 * The Studio is served by Next.js at /studio, so autoUpdates is off.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: false,
  studioHost: undefined,
})
