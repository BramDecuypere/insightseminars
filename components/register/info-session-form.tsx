'use client'

import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/content/types'
import { infoSessionSchema, type InfoSessionInput } from '@/lib/registration/schema'
import { submitInfoSession } from '@/app/[locale]/register/actions'

const REFERRALS = ['friends', 'social', 'insight', 'flyer', 'other'] as const

/** Single-step info-session / workshop signup (brief §7.3). */
export function InfoSessionForm({ eventSlug }: { eventSlug: string }) {
  const t = useTranslations('form.fields')
  const te = useTranslations('form.errors')
  const tc = useTranslations('common')
  const tn = useTranslations('newsletter')
  const locale = useLocale() as Locale
  const ids = useId()
  const [banner, setBanner] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InfoSessionInput>({
    resolver: zodResolver(infoSessionSchema) as never,
    defaultValues: { website: '', formLoadedAt: 0, firstName: '', email: '', referral: '', newsletter: false },
  })

  // Stamp the load time after mount (time trap, brief §7.3); Date.now() must
  // not run during render.
  useEffect(() => {
    setValue('formLoadedAt', Date.now())
  }, [setValue])

  const errorFor = (name: keyof InfoSessionInput) => {
    const code = errors[name]?.message
    if (!code || code === 'honeypot') return undefined
    try {
      return te(code as never)
    } catch {
      return te('required')
    }
  }

  async function onSubmit(values: InfoSessionInput) {
    setBanner(null)
    track('infosession_signup', { event: eventSlug })
    const res = await submitInfoSession({ locale, eventSlug, data: values })
    if (res.ok) {
      window.location.assign(res.redirect)
      return
    }
    setBanner(te('generic', { email: 'info@insightseminars.be' }))
  }

  const label = 'block text-base font-semibold text-inkt'
  const input =
    'mt-1.5 h-12 w-full rounded-md border border-lijn bg-mist px-3.5 text-base text-inkt outline-none focus-visible:ring-3 focus-visible:ring-accent-4 focus-visible:ring-offset-2'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-5">
      {banner && (
        <div role="alert" className="rounded-md border border-accent-1/40 bg-accent-1/10 px-4 py-3 text-sm font-medium text-inkt">
          {banner}
        </div>
      )}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div>
        <label htmlFor={`${ids}-first`} className={label}>
          {t('firstName')}
        </label>
        <input id={`${ids}-first`} autoComplete="given-name" className={input} {...register('firstName')} />
        {errorFor('firstName') && <p className="mt-1.5 text-sm font-medium text-accent-1">{errorFor('firstName')}</p>}
      </div>

      <div>
        <label htmlFor={`${ids}-email`} className={label}>
          {t('email')}
        </label>
        <input id={`${ids}-email`} type="email" inputMode="email" autoComplete="email" className={input} {...register('email')} />
        {errorFor('email') && <p className="mt-1.5 text-sm font-medium text-accent-1">{errorFor('email')}</p>}
      </div>

      <div>
        <label htmlFor={`${ids}-referral`} className={label}>
          {t('referral')} <span className="font-normal text-leisteen">({t('optional')})</span>
        </label>
        <select id={`${ids}-referral`} className={input} {...register('referral')}>
          <option value="">—</option>
          {REFERRALS.map((r) => (
            <option key={r} value={r}>
              {t(`referralOptions.${r}`)}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3 text-base text-inkt">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-avondblauw" {...register('newsletter')} />
        <span>{tn('title')}</span>
      </label>

      <Button type="submit" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
        {tc('registerInfoSession')}
      </Button>
    </form>
  )
}
