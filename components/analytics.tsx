'use client'

import { useEffect, useState } from 'react'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { CONSENT_CHANGE_EVENT, readClientConsentCookie } from '@/lib/consent/types'

/**
 * Single analytics component (brief §8.5). Query strings are stripped from URLs
 * so no personal data (e.g. ?ref=) ever reaches analytics. The consent gate
 * lives here (not at the `<Analytics />` call site in the layout) so loading
 * the script never requires a server round-trip: it mounts once the saved
 * cookie says `analytics: true`, and un/mounts live on CONSENT_CHANGE_EVENT
 * when the visitor changes their choice in the cookie banner.
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const sync = () => setEnabled(readClientConsentCookie()?.analytics === true)
    sync()
    window.addEventListener(CONSENT_CHANGE_EVENT, sync)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync)
  }, [])

  if (!enabled) return null

  return (
    <VercelAnalytics
      beforeSend={(event) => {
        const url = event.url.split('?')[0]
        return { ...event, url }
      }}
    />
  )
}
