'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/next'

/**
 * Single analytics component (brief §8.5). Query strings are stripped from URLs
 * so no personal data (e.g. ?ref=) ever reaches analytics. Keeping this in one
 * place lets a consent gate be added later without refactoring.
 */
export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={(event) => {
        const url = event.url.split('?')[0]
        return { ...event, url }
      }}
    />
  )
}
