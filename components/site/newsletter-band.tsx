'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Newsletter sign-up band (brief Prompt 2: UI only). The double opt-in wiring
 * to Brevo arrives in a later prompt; for now a valid submit shows the pending
 * confirmation copy without any network request.
 */
export function NewsletterBand({ id = 'nieuwsbrief' }: { id?: string }) {
  const t = useTranslations('newsletter')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id={id} className="on-avondblauw bg-avondblauw text-papier">
      <div className="container-site section-y">
        <div className="max-w-2xl">
          <h2 className="type-h2 text-papier text-balance">{t('title')}</h2>
          <p className="type-lead mt-4 text-papier/80">{t('body')}</p>

          {submitted ? (
            <p
              role="status"
              className="mt-6 rounded-panel border border-white/20 bg-white/10 px-5 py-4 text-lg text-papier"
            >
              {t('success')}
            </p>
          ) : (
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <div className="flex-1">
                <Label htmlFor="newsletter-email" className="mb-1.5 block text-papier">
                  {t('label')}
                </Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="border-transparent bg-papier text-inkt"
                />
              </div>
              <Button type="submit" variant="primary">
                {t('submit')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
