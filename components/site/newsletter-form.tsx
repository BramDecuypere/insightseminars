'use client'

import { useId, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { subscribeNewsletter } from '@/app/actions/newsletter'

/**
 * Newsletter double opt-in form (brief §7.5), reused by the home band and the
 * footer. On success it shows the "check your inbox" copy and fires the
 * `newsletter_signup` analytics event (no personal data). The honeypot and a 3s
 * time trap guard against bots.
 */
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('newsletter')
  const locale = useLocale() as 'nl' | 'en'
  const id = useId()
  const loadedAt = useRef(Date.now())
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const website = (form.elements.namedItem('website') as HTMLInputElement).value
    setStatus('submitting')
    const res = await subscribeNewsletter({ email, website, formLoadedAt: loadedAt.current, locale })
    if (res.ok) {
      track('newsletter_signup', { locale })
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p
        role="status"
        className="rounded-panel border border-white/20 bg-white/10 px-5 py-4 text-papier"
      >
        {t('success')}
      </p>
    )
  }

  return (
    <form
      className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-3 sm:flex-row sm:items-end'}
      onSubmit={onSubmit}
      noValidate
    >
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex-1">
        <Label htmlFor={`${id}-email`} className="mb-1.5 block text-papier">
          {t('label')}
        </Label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border-transparent bg-papier text-inkt"
        />
      </div>
      <Button type="submit" variant="primary" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
        {t('submit')}
      </Button>

      {status === 'error' && (
        <p role="alert" className="basis-full text-sm font-medium text-papier">
          {t('error')}
        </p>
      )}
    </form>
  )
}
