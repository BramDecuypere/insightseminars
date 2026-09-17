'use client'

import { useTranslations } from 'next-intl'
import { NewsletterForm } from './newsletter-form'

/**
 * Newsletter sign-up band (brief §7.5). Wraps the shared NewsletterForm, which
 * handles the Brevo double opt-in and the success/error states.
 */
export function NewsletterBand({ id = 'nieuwsbrief' }: { id?: string }) {
  const t = useTranslations('newsletter')

  return (
    <section id={id} className="on-avondblauw bg-avondblauw text-papier">
      <div className="container-site section-y">
        <div className="max-w-2xl">
          <h2 className="type-h2 text-papier text-balance">{t('title')}</h2>
          <p className="type-lead mt-4 text-papier/80">{t('body')}</p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  )
}
