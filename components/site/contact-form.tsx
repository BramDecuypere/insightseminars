'use client'

import { useId } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/**
 * Contact form UI (brief §13.7). Presentation only — the server action and
 * email delivery are wired in Prompt 7. Submitting is prevented so the page
 * never navigates before that logic exists.
 */
export function ContactForm() {
  const t = useTranslations('contactForm')
  const tf = useTranslations('form.fields')
  const ids = useId()

  const subjects = ['general', 'registration', 'teens', 'volunteer', 'other'] as const
  const fieldClass = 'mt-1.5 block text-base font-semibold text-inkt'

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor={`${ids}-name`} className={fieldClass}>
          {t('name')}
        </label>
        <Input id={`${ids}-name`} name="name" autoComplete="name" required />
      </div>

      <div>
        <label htmlFor={`${ids}-email`} className={fieldClass}>
          {tf('email')}
        </label>
        <Input id={`${ids}-email`} name="email" type="email" autoComplete="email" required />
      </div>

      <div>
        <label htmlFor={`${ids}-subject`} className={fieldClass}>
          {t('subject')}
        </label>
        <select
          id={`${ids}-subject`}
          name="subject"
          defaultValue="general"
          className="mt-0 h-12 w-full rounded-md border border-lijn bg-mist px-3.5 text-base text-inkt outline-none"
        >
          {subjects.map((s) => (
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
          name="message"
          rows={6}
          required
          className="w-full rounded-md border border-lijn bg-mist px-3.5 py-2.5 text-base text-inkt outline-none"
        />
      </div>

      <Button type="submit" size="lg">
        {t('submit')}
      </Button>
    </form>
  )
}
