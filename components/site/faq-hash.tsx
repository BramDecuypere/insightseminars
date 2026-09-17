'use client'

import { useEffect } from 'react'

/**
 * Opens and scrolls to the FAQ item whose id matches the URL hash (brief §13.6
 * deep links). The list itself is native <details>, so it stays fully usable
 * without JavaScript; this only adds the deep-link affordance.
 */
export function FaqHash() {
  useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!id) return
      const el = document.getElementById(id)
      if (el instanceof HTMLDetailsElement) {
        el.open = true
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  return null
}
