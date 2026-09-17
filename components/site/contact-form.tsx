'use client'

import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { track } from '@vercel/analytics'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { contactSchema, CONTACT_SUBJECTS, type ContactInput } from '@/lib/forms/contact'
import { submitContact } from '@/app/[locale]/contact/actions'

/**
 * Contact form (brief §7.4). Emails the office via the submitContact server
 * action and shows a success message; nothing is stored. Includes a honeypot,
 * a 3s time trap, autocomplete attributes and an error summary.
 */
export function ContactForm() {
  const t = useTranslations('contactForm')
  const tf = useTranslations('form.fields')
  const te = useTranslations('form.errors')
  const ids = useId()
  const [banner, setBanner] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema) as never,
    defaultValues: {
      website: '',
      formLoadedAt: 0,
      name: '',
      email: '',
      subject: 'general',
      message: '',
    },
  })

  // Stamp the load time after mount (time trap, brief §7.4); Date.now() must
  // not run during render.
  useEffect(() => {
    setValue('formLoadedAt', Date.now())
  }, [setValue])

  const errorFor = (name: keyof ContactInput) => {
    const code = errors[name]?.message
    if (!code || code === 'honeypot') return undefined
    try {
      return te(code as never)
    } catch {
      return te('required')
    }
  }

  async function onSubmit(values: ContactInput) {
    setBanner(null)
    track('contact_submit', { subject: values.subject })
    const res = await submitContact({ data: values })
    if (res.ok) {
      setDone(true)
      return
    }
    setBanner(te('generic', { email: 'info@insightseminars.be' }))
  }

  const fieldClass = 'mt-1.5 block text-base font-semibold text-inkt'
  const controlClass =
    'mt-1.5 h-12 w-full rounded-md border border-lijn bg-mist px-3.5 text-base text-inkt outline-none focus-visible:ring-3 focus-visible:ring-accent-4 focus-visible:ring-offset-2'

  if (done) {
    return (
      <p
        role="status"
        className="rounded-panel border border-lijn bg-mist px-5 py-4 text-lg text-inkt"
      >
        {t('success')}
      </p>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {banner && (
        <div
          role="alert"
          className="rounded-md border border-accent-1/40 bg-accent-1/10 px-4 py-3 text-sm font-medium text-inkt"
        >
          {banner}
        </div>
      )}

      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div>
        <label htmlFor={`${ids}-name`} className={fieldClass}>
          {t('name')}
        </label>
        <Input id={`${ids}-name`} autoComplete="name" {...register('name')} />
        {errorFor('name') && <p className="mt-1.5 text-sm font-medium text-accent-1">{errorFor('name')}</p>}
      </div>

      <div>
        <label htmlFor={`${ids}-email`} className={fieldClass}>
          {tf('email')}
        </label>
        <Input id={`${ids}-email`} type="email" inputMode="email" autoComplete="email" {...register('email')} />
        {errorFor('email') && <p className="mt-1.5 text-sm font-medium text-accent-1">{errorFor('email')}</p>}
      </div>

      <div>
        <label htmlFor={`${ids}-subject`} className={fieldClass}>
          {t('subject')}
        </label>
        <select id={`${ids}-subject`} className={controlClass} {...register('subject')}>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {t(`subjects.${s}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${ids}-message`} className={fieldClass}>
          {t('message')}
        </label>
        <textarea
          id={`${ids}-message`}
          rows={6}
          className="w-full rounded-md border border-lijn bg-mist px-3.5 py-2.5 text-base text-inkt outline-none focus-visible:ring-3 focus-visible:ring-accent-4 focus-visible:ring-offset-2"
          {...register('message')}
        />
        {errorFor('message') && <p className="mt-1.5 text-sm font-medium text-accent-1">{errorFor('message')}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
        {t('submit')}
      </Button>
    </form>
  )
}
