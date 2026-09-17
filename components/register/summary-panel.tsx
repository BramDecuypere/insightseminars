'use client'

import { useFormContext } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/lib/content/types'
import { formatEuro } from '@/lib/format'
import { useFlow } from './fields'

export interface RegistrationSummary {
  eventTitle: string
  dates: string
  place: string
}

/**
 * Sticky order summary (brief §7.1): event, dates, place and the selected
 * price. Collapses into a bar on mobile. Reads the chosen option live.
 */
export function SummaryPanel({ summary }: { summary: RegistrationSummary }) {
  const t = useTranslations('form.payment')
  const tc = useTranslations('common')
  const locale = useLocale() as Locale
  const flow = useFlow()
  const { watch } = useFormContext()
  const chosen = flow.options.find((o) => o.id === watch('priceOptionId'))
  const priceLabel = chosen
    ? chosen.amount > 0
      ? formatEuro(chosen.amount, locale)
      : tc('free')
    : flow.fromPrice
      ? tc('priceFrom', { price: formatEuro(flow.fromPrice, locale) })
      : tc('free')

  return (
    <aside
      aria-label={t('summary')}
      className="rounded-xl border border-lijn bg-mist p-5 lg:sticky lg:top-24"
    >
      <h2 className="text-sm font-bold text-leisteen">{t('summary')}</h2>
      <p className="mt-3 text-lg font-bold text-inkt text-balance">{summary.eventTitle}</p>
      <dl className="mt-4 space-y-2.5 text-base">
        <div className="flex justify-between gap-4">
          <dt className="text-leisteen">{tc('dates')}</dt>
          <dd className="text-right font-semibold text-inkt">{summary.dates}</dd>
        </div>
        {summary.place && (
          <div className="flex justify-between gap-4">
            <dt className="text-leisteen">{tc('location')}</dt>
            <dd className="text-right font-semibold text-inkt">{summary.place}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-lijn pt-2.5">
          <dt className="text-leisteen">{tc('price')}</dt>
          <dd className="text-right font-bold text-inkt">{priceLabel}</dd>
        </div>
      </dl>
    </aside>
  )
}
