'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, FormProvider, useWatch, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/content/types'
import { makeRegistrationSchema, type RegistrationInput } from '@/lib/registration/schema'
import type { FlowContext } from '@/lib/registration/flow'
import { stepsFor } from '@/lib/registration/flow'
import { submitRegistration } from '@/app/[locale]/register/actions'
import { FlowProvider, Honeypot, useFieldError } from './fields'
import {
  AgreementsStep,
  ConsentStep,
  DateStep,
  GuardianStep,
  TeenStep,
  YouStep,
} from './steps'
import { BillingStep } from './billing-step'
import { ConsentFileContext } from './consent-fields'
import { SummaryPanel, type RegistrationSummary } from './summary-panel'

const STEP_FIELDS: Record<string, (keyof RegistrationInput | string)[]> = {
  date: ['priceOptionId', 'auditHistory'],
  you: ['firstName', 'lastName', 'email', 'phone', 'street', 'postalCode', 'city', 'country', 'isAdult'],
  agreements: ['emergencyName', 'emergencyPhone', 'photoConsent', 'whatsapp'],
  teen: ['teenFirstName', 'teenLastName', 'birthDay', 'birthMonth', 'birthYear', 'teenEmail'],
  guardian: ['guardianFirstName', 'guardianLastName', 'guardianEmail', 'guardianPhone', 'relationship', 'street', 'postalCode', 'city', 'country'],
  consent: ['consentMethod', 'consentAccepted', 'consentTypedName', 'consentSignature', 'consentUploadName'],
  billing: ['payChoice', 'earlierDepositAmount', 'sponsoringAmount', 'invoiceCompany', 'invoiceVat', 'invoiceAddress', 'invoiceEmail', 'peppol'],
  review: ['terms'],
}

function defaultValues(): RegistrationInput {
  return {
    website: '',
    formLoadedAt: Date.now(),
    priceOptionId: '',
    auditHistory: '',
    prerequisiteHistory: {},
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'België',
    isAdult: '',
    teenFirstName: '',
    teenLastName: '',
    teenEmail: '',
    birthDay: 0,
    birthMonth: 0,
    birthYear: 0,
    guardianFirstName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhone: '',
    relationship: '',
    consentMethod: '',
    consentTypedName: '',
    consentAccepted: false,
    consentSignature: '',
    consentUploadName: '',
    emergencyName: '',
    emergencyPhone: '',
    photoConsent: '',
    whatsapp: '',
    intention: '',
    referral: '',
    payChoice: 'volledig',
    earlierDeposit: 'nee',
    earlierDepositAmount: '',
    sponsoring: 'nee',
    sponsoringAmount: '',
    sponsor: '',
    invoiceNeeded: 'nee',
    invoiceCompany: '',
    invoiceVat: '',
    invoiceAddress: '',
    invoiceSameAddress: true,
    invoiceEmail: '',
    peppol: '',
    peppolId: '',
    terms: false,
  }
}

export function RegistrationForm({
  flow,
  summary,
  paymentMode,
}: {
  flow: FlowContext
  summary: RegistrationSummary
  paymentMode: 'mollie' | 'bank_transfer'
}) {
  const t = useTranslations('form')
  const te = useTranslations('form.errors')
  const locale = useLocale() as Locale
  const steps = useMemo(() => stepsFor(flow), [flow])
  const [options, setOptions] = useState(flow.options)
  const activeFlow = useMemo<FlowContext>(() => ({ ...flow, options }), [flow, options])

  const methods = useForm<RegistrationInput>({
    resolver: zodResolver(makeRegistrationSchema(flow)) as never,
    defaultValues: defaultValues(),
    mode: 'onTouched',
  })

  const [step, setStep] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  // The uploaded consent form (teen flow) is sent as a File, not base64 JSON.
  const consentFileRef = useRef<File | null>(null)
  const stepKey = steps[step]

  useEffect(() => {
    headingRef.current?.focus()
    if (step === 0) track('register_start', { event: flow.eventSlug })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  async function goNext() {
    const fields = STEP_FIELDS[stepKey] ?? []
    const valid = await methods.trigger(fields as never, { shouldFocus: true })
    if (!valid) {
      setBanner(te('summary'))
      return
    }
    setBanner(null)
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function goBack() {
    setBanner(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(values: RegistrationInput) {
    setSubmitting(true)
    setBanner(null)
    track('register_submit', { event: flow.eventSlug })
    try {
      const res = await submitRegistration({
        locale,
        eventSlug: flow.eventSlug,
        data: values,
        consentFile: consentFileRef.current ?? undefined,
      })
      if (res.ok) {
        track('payment_redirect', { event: flow.eventSlug })
        window.location.assign(res.redirect)
        return
      }
      if (!('error' in res)) {
        for (const [name, code] of Object.entries(res.fieldErrors)) {
          methods.setError(name as never, { message: code })
        }
        setBanner(te('summary'))
        return
      }
      if (res.error === 'priceExpired') {
        setOptions(res.options)
        setStep(0)
        setBanner(te('priceExpired'))
        return
      }
      setBanner(te(res.error))
    } finally {
      setSubmitting(false)
    }
  }

  const isLast = step === steps.length - 1

  return (
    <FlowProvider value={activeFlow}>
      <FormProvider {...methods}>
       <ConsentFileContext.Provider value={consentFileRef}>
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <form onSubmit={methods.handleSubmit(onSubmit)} noValidate className="relative">
            <Honeypot />
            <p className="text-sm font-semibold text-leisteen">
              {t('stepOf', { current: step + 1, total: steps.length })}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-1 type-h2 text-balance outline-none"
            >
              {t(`steps.${stepKey}`)}
            </h2>

            {banner && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-accent-1/40 bg-accent-1/10 px-4 py-3 text-sm font-medium text-inkt"
              >
                {banner}
              </div>
            )}

            <div className="mt-6">
              <StepContent stepKey={stepKey} />
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={goBack}>
                  {t('previous')}
                </Button>
              ) : (
                <span />
              )}
              {isLast ? (
                <SubmitButton flow={flow} paymentMode={paymentMode} submitting={submitting} />
              ) : (
                <Button type="button" onClick={goNext}>
                  {t('next')}
                </Button>
              )}
            </div>
          </form>

          <SummaryPanel summary={summary} />
        </div>
       </ConsentFileContext.Provider>
      </FormProvider>
    </FlowProvider>
  )
}

function StepContent({ stepKey }: { stepKey: string }) {
  switch (stepKey) {
    case 'date':
      return <DateStep />
    case 'you':
      return <YouStep />
    case 'agreements':
      return <AgreementsStep />
    case 'teen':
      return <TeenStep />
    case 'guardian':
      return <GuardianStep />
    case 'consent':
      return <ConsentStep />
    case 'billing':
      return <BillingStep />
    case 'review':
      return <ReviewStep />
    default:
      return null
  }
}

function ReviewStep() {
  const t = useTranslations('form')
  const termsError = useFieldError('terms')
  const { register } = useFormContext<RegistrationInput>()

  return (
    <div className="space-y-6">
      <label className="flex items-start gap-3 text-base text-inkt">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-avondblauw" {...register('terms')} />
        <span>
          {t.rich('fields.terms', {
            link: (chunks) => (
              <a href="../terms" className="font-semibold text-avondblauw underline">
                {chunks}
              </a>
            ),
          })}
        </span>
      </label>
      {termsError && (
        <p className="text-sm font-medium text-accent-1" role="alert">
          {termsError}
        </p>
      )}

      <p className="text-sm text-leisteen">
        {t.rich('fields.privacy', {
          link: (chunks) => (
            <a href="../privacy" className="font-semibold text-avondblauw underline">
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  )
}

function SubmitButton({
  flow,
  paymentMode,
  submitting,
}: {
  flow: FlowContext
  paymentMode: 'mollie' | 'bank_transfer'
  submitting: boolean
}) {
  const tp = useTranslations('form.payment')
  const { control } = useFormContext<RegistrationInput>()
  const earlier = useWatch({ control, name: 'earlierDeposit' })
  const sponsoring = useWatch({ control, name: 'sponsoring' })

  let label = tp('submitOnline')
  if (flow.waitlist) label = tp('submitWaitlist')
  else if (flow.free) label = tp('submitFree')
  else if (earlier === 'ja' || sponsoring === 'ja') label = tp('submitCheck')
  else if (paymentMode === 'bank_transfer') label = tp('submitTransfer')

  return (
    <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
      {label}
    </Button>
  )
}
