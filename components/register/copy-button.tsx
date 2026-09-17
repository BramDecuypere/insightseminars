'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check } from 'lucide-react'

/** Inline "copy this value" control used on the transfer confirmation (brief §7.1). */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useTranslations('common')
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be unavailable (insecure context); the value stays visible to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border border-lijn bg-mist px-2.5 py-1.5 text-sm font-medium text-inkt transition-colors hover:bg-lijn/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-4 focus-visible:ring-offset-2"
      aria-label={`${label}: ${copied ? t('copied') : t('copy')}`}
    >
      {copied ? <Check className="size-4 text-avondblauw" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span>{copied ? t('copied') : t('copy')}</span>
    </button>
  )
}
