'use client'

import { useFormContext } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/lib/content/types'
import { computeAmounts } from '@/lib/domain/money'
import { formatEuro } from '@/lib/format'
import { CheckboxField, RadioField, TextField, useFlow } from './fields'

/** Step "Betaling en facturatie" (brief §6.12–6.13, §7.1). */
export function BillingStep() {
  const t = useTranslations('form.payment')
  const ti = useTranslations('form.invoice')
  const tf = useTranslations('form.fields')
  const locale = useLocale() as Locale
  const flow = useFlow()
  const { watch } = useFormContext()

  const chosen = flow.options.find((o) => o.id === watch('priceOptionId'))
  const price = chosen?.amount ?? flow.fromPrice ?? 0
  const payChoice = (watch('payChoice') as 'volledig' | 'voorschot') || 'volledig'
  const earlierDeposit = watch('earlierDeposit') === 'ja'
  const sponsoring = watch('sponsoring') === 'ja'
  const invoiceNeeded = watch('invoiceNeeded') === 'ja'
  const sameAddress = watch('invoiceSameAddress') !== false
  const num = (v: string) => Number((v || '').replace(',', '.')) || 0

  const amounts = computeAmounts({
    price,
    payChoice,
    depositAmount: flow.depositAmount,
    earlierDeposit: earlierDeposit ? num(watch('earlierDepositAmount')) : 0,
    sponsoring: sponsoring ? num(watch('sponsoringAmount')) : 0,
  })

  const yesNo = [
    { value: 'nee', label: tf('no') },
    { value: 'ja', label: tf('yes') },
  ]

  return (
    <div className="space-y-7">
      <RadioField
        name="payChoice"
        label={t('payChoice')}
        options={[
          { value: 'volledig', label: t('payFull', { amount: formatEuro(price, locale) }) },
          ...(flow.hasDeposit && flow.depositAmount
            ? [{ value: 'voorschot', label: t('payDeposit', { amount: formatEuro(flow.depositAmount, locale) }) }]
            : []),
        ]}
      />

      <div className="space-y-4">
        <RadioField name="earlierDeposit" label={t('earlierDeposit')} options={yesNo} />
        {earlierDeposit && (
          <TextField name="earlierDepositAmount" label={t('earlierDepositAmount')} inputMode="numeric" />
        )}
      </div>

      <div className="space-y-4">
        <RadioField name="sponsoring" label={t('sponsoring')} options={yesNo} />
        {sponsoring && (
          <>
            <TextField name="sponsoringAmount" label={t('sponsoringAmount')} inputMode="numeric" />
            <TextField name="sponsor" label={t('sponsor')} optional />
          </>
        )}
      </div>

      <div className="space-y-4">
        <RadioField name="invoiceNeeded" label={ti('needed')} options={yesNo} />
        {invoiceNeeded && (
          <div className="space-y-4 rounded-lg border border-lijn bg-mist/60 p-4">
            <TextField name="invoiceCompany" label={ti('company')} autoComplete="organization" />
            <TextField name="invoiceVat" label={ti('vat')} hint={ti('vatHint')} />
            <CheckboxField name="invoiceSameAddress">{ti('sameAddress')}</CheckboxField>
            {!sameAddress && <TextField name="invoiceAddress" label={ti('address')} />}
            <TextField name="invoiceEmail" label={ti('email')} type="email" inputMode="email" />
            <RadioField
              name="peppol"
              label={ti('peppol')}
              options={[
                { value: 'ja', label: tf('yes') },
                { value: 'nee', label: tf('no') },
                { value: 'unknown', label: ti('peppolUnknown') },
              ]}
            />
            {watch('peppol') === 'ja' && <TextField name="peppolId" label={ti('peppolId')} optional />}
          </div>
        )}
      </div>

      {/* Live "Nu te betalen" line (brief §6.12). */}
      <div className="rounded-lg bg-avondblauw px-5 py-4 text-papier" aria-live="polite">
        {amounts.declaredCredit ? (
          <p className="text-base">{t('checkFirst')}</p>
        ) : (
          <>
            <p className="text-lg font-bold">{t('payNow', { amount: formatEuro(amounts.payNow, locale) })}</p>
            {amounts.outstanding > 0 && (
              <p className="mt-1 text-sm text-papier/80">
                {t('remaining', { amount: formatEuro(amounts.outstanding, locale) })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
