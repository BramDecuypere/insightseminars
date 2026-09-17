'use client'

import { useFormContext } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/lib/content/types'
import { formatDate } from '@/lib/domain/dates'
import { formatEuro } from '@/lib/format'
import {
  CheckboxField,
  RadioField,
  SelectField,
  TextAreaField,
  TextField,
  useFlow,
} from './fields'
import { ConsentFields } from './consent-fields'

const REFERRALS = ['friends', 'social', 'insight', 'flyer', 'other'] as const

/** Step 1 — date & price options, plus audit/prerequisite questions. */
export function DateStep() {
  const t = useTranslations('form.fields')
  const tc = useTranslations('common')
  const locale = useLocale() as Locale
  const flow = useFlow()
  const { watch } = useFormContext()
  const chosenId = watch('priceOptionId')
  const chosen = flow.options.find((o) => o.id === chosenId)

  return (
    <div className="space-y-6">
      {flow.options.length > 0 && (
        <RadioField
          name="priceOptionId"
          label={t('priceOption')}
          options={flow.options.map((o) => ({
            value: o.id,
            label: o.amount > 0 ? `${o.label} — ${formatEuro(o.amount, locale)}` : `${o.label} — ${tc('free')}`,
          }))}
        />
      )}
      {chosen?.requiresGraduate && <TextField name="auditHistory" label={t('auditHistory')} />}
      {flow.prerequisites.map((slug) => (
        <TextField
          key={slug}
          name={`prerequisiteHistory.${slug}`}
          label={t('prerequisiteHistory', { program: flow.prerequisiteLabels[slug] ?? slug })}
        />
      ))}
    </div>
  )
}

/** Step 2 — the participant's own details (adult flow). */
export function YouStep({ minimal = false }: { minimal?: boolean }) {
  const t = useTranslations('form.fields')
  const locale = useLocale() as Locale
  const flow = useFlow()
  const startDate = formatDate(flow.startDate, locale)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label={t('firstName')} autoComplete="given-name" />
        <TextField name="lastName" label={t('lastName')} autoComplete="family-name" />
      </div>
      <TextField name="email" label={t('email')} type="email" autoComplete="email" inputMode="email" />
      {!minimal && (
        <>
          <TextField
            name="phone"
            label={t('phone')}
            hint={t('phoneHint')}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
          />
          <TextField name="street" label={t('street')} autoComplete="street-address" />
          <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
            <TextField name="postalCode" label={t('postalCode')} autoComplete="postal-code" inputMode="numeric" />
            <TextField name="city" label={t('city')} autoComplete="address-level2" />
          </div>
          <TextField name="country" label={t('country')} autoComplete="country-name" />
          {flow.asksAdultQuestion && (
            <RadioField
              name="isAdult"
              label={t('isAdult', { date: startDate })}
              options={[
                { value: 'ja', label: t('yes') },
                { value: 'nee', label: t('no') },
              ]}
            />
          )}
        </>
      )}
    </div>
  )
}

/** Step 3 — emergency contact and agreements (adult flow). */
export function AgreementsStep() {
  const t = useTranslations('form.fields')
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="emergencyName" label={t('emergencyName')} autoComplete="name" />
        <TextField name="emergencyPhone" label={t('emergencyPhone')} type="tel" inputMode="tel" />
      </div>
      <RadioField
        name="photoConsent"
        label={t('photoConsent')}
        options={[
          { value: 'ja', label: t('yes') },
          { value: 'nee', label: t('no') },
        ]}
      />
      <RadioField
        name="whatsapp"
        label={t('whatsapp')}
        options={[
          { value: 'ja', label: t('yes') },
          { value: 'nee', label: t('no') },
        ]}
      />
      <TextAreaField name="intention" label={t('intention')} optional />
      <SelectField
        name="referral"
        label={t('referral')}
        options={[
          { value: '', label: '—' },
          ...REFERRALS.map((r) => ({ value: r, label: t(`referralOptions.${r}`) })),
        ]}
      />
    </div>
  )
}

/** Teen step — the teen's details and date of birth. */
export function TeenStep() {
  const t = useTranslations('form.fields')
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="teenFirstName" label={t('teenFirstName')} autoComplete="given-name" />
        <TextField name="teenLastName" label={t('teenLastName')} autoComplete="family-name" />
      </div>
      <fieldset>
        <legend className="block text-base font-semibold text-inkt">{t('birthDate')}</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-3">
          <TextField name="birthDay" label={t('day')} inputMode="numeric" />
          <TextField name="birthMonth" label={t('month')} inputMode="numeric" />
          <TextField name="birthYear" label={t('year')} inputMode="numeric" />
        </div>
      </fieldset>
      <TextField name="teenEmail" label={t('teenEmail')} type="email" inputMode="email" optional />
    </div>
  )
}

/** Guardian step — the parent/guardian's details and address. */
export function GuardianStep() {
  const t = useTranslations('form.fields')
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="guardianFirstName" label={t('guardianFirstName')} autoComplete="given-name" />
        <TextField name="guardianLastName" label={t('guardianLastName')} autoComplete="family-name" />
      </div>
      <TextField name="guardianEmail" label={t('guardianEmail')} type="email" autoComplete="email" inputMode="email" />
      <TextField name="guardianPhone" label={t('guardianPhone')} type="tel" autoComplete="tel" inputMode="tel" />
      <RadioField
        name="relationship"
        label={t('relationship')}
        options={[
          { value: 'parent', label: t('parent') },
          { value: 'guardian', label: t('guardian') },
        ]}
      />
      <TextField name="street" label={t('street')} autoComplete="street-address" />
      <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
        <TextField name="postalCode" label={t('postalCode')} autoComplete="postal-code" inputMode="numeric" />
        <TextField name="city" label={t('city')} autoComplete="address-level2" />
      </div>
      <TextField name="country" label={t('country')} autoComplete="country-name" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="emergencyName" label={t('emergencyName')} optional />
        <TextField name="emergencyPhone" label={t('emergencyPhone')} type="tel" inputMode="tel" optional />
      </div>
    </div>
  )
}

/** Consent step — placeholder until Prompt 6 wires signature_pad + PDF. */
export function ConsentStep() {
  const t = useTranslations('form.consent')
  const ts = useTranslations('form.steps')
  const flow = useFlow()
  const { watch } = useFormContext()
  const teenName = watch('teenFirstName') || ''
  const method = watch('consentMethod')
  return (
    <div className="space-y-6">
      <p className="type-body text-leisteen">{t('intro', { name: teenName })}</p>
      <RadioField
        name="consentMethod"
        label={ts('consent')}
        options={[
          { value: 'sign', label: t('methodSign') },
          { value: 'upload', label: t('methodUpload') },
        ]}
      />
      <ConsentFields />
      {method === 'sign' && (
        <TextField name="consentTypedName" label={t('typedName')} autoComplete="name" />
      )}
      <CheckboxField name="consentAccepted">
        {t('checkbox', { name: teenName, event: flow.eventTitle })}
      </CheckboxField>
    </div>
  )
}
