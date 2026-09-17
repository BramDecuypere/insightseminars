'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

/** Copy-to-clipboard button for IBAN and account holder on "Steun Insight" (§13.5). */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useTranslations('common')
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context); the value stays visible to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${t('copy')}: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-lijn bg-papier px-2.5 py-1.5 text-sm font-semibold text-inkt hover:bg-mist"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? t('copied') : t('copy')}
    </button>
  )
}
