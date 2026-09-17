'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * One-time notice for visitors redirected from insightseminars.nl (?from=nl,
 * brief §12). No cookie or storage: the parameter is stripped from the address
 * bar with history.replaceState on mount, and closing simply hides the banner.
 */
export function FromNlNotice() {
  const t = useTranslations('fromNl')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') !== 'nl') return
    setVisible(true)
    params.delete('from')
    const query = params.toString()
    const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash
    window.history.replaceState(null, '', url)
  }, [])

  if (!visible) return null

  return (
    <div className="border-b border-lijn bg-mist">
      <div className="container-site flex items-start gap-4 py-3">
        <p className="type-small flex-1 text-inkt">{t('text')}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="-mr-1 rounded-md p-1 text-leisteen hover:text-inkt"
        >
          <X className="size-5" aria-hidden />
          <span className="sr-only">{t('close')}</span>
        </button>
      </div>
    </div>
  )
}
