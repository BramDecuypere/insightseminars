'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface ChooserTestimonial {
  situation: string
  quote: string
  name: string
  context: string
}

export interface ChooserSituation {
  id: string
  label: string
  target: 'infoSession' | 'program' | 'about' | 'teens'
  programSlug?: string
  programTitle?: string
  testimonial?: ChooserTestimonial
}

/**
 * "Herken je dit?" chooser (brief §9.4): the one interactive moment. A radio
 * group of situations in the visitor's own words; choosing one reveals, in a
 * live region, a matching testimonial (or a fallback) and one next step.
 * Keyboard operable; motion only in response to the click.
 */
export function RecogniseChooser({
  intro,
  situations,
  fallback,
}: {
  intro: string
  situations: ChooserSituation[]
  fallback: string
}) {
  const t = useTranslations('chooser')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = situations.find((s) => s.id === selectedId) ?? null

  return (
    <div>
      <fieldset>
        <legend className="type-lead text-inkt">{intro}</legend>
        <div
          role="radiogroup"
          className="mt-6 flex flex-col gap-3"
          aria-label={intro}
        >
          {situations.map((s) => {
            const checked = s.id === selectedId
            return (
              <label
                key={s.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-panel border p-4 text-lg transition-colors',
                  checked
                    ? 'border-avondblauw bg-mist font-semibold text-inkt'
                    : 'border-lijn bg-papier text-inkt hover:bg-mist',
                )}
              >
                <input
                  type="radio"
                  name="recognise"
                  value={s.id}
                  checked={checked}
                  onChange={() => setSelectedId(s.id)}
                  className="size-5 accent-[var(--accent-4)]"
                />
                <span>{s.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-6">
        {selected ? (
          <div className="rounded-panel border border-lijn bg-mist p-6">
            {selected.testimonial ? (
              <figure>
                <p className="text-base text-leisteen">{selected.testimonial.situation}</p>
                <blockquote className="type-lead mt-2 text-inkt">
                  {selected.testimonial.quote}
                </blockquote>
                <figcaption className="mt-3 text-base text-leisteen">
                  {selected.testimonial.name}
                  {selected.testimonial.context ? `, ${selected.testimonial.context}` : ''}
                </figcaption>
              </figure>
            ) : (
              <p className="type-body text-inkt">{fallback}</p>
            )}

            <div className="mt-5">
              <p className="text-sm font-semibold text-leisteen">{t('nextStep')}</p>
              <div className="mt-2">
                <NextStep situation={selected} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function NextStep({ situation }: { situation: ChooserSituation }) {
  const t = useTranslations('chooser')
  const cls = cn(buttonVariants({ variant: 'outline' }))

  if (situation.target === 'program' && situation.programSlug) {
    return (
      <Link
        href={{ pathname: '/seminars/[slug]', params: { slug: situation.programSlug } }}
        className={cls}
      >
        {t('program', { program: situation.programTitle ?? '' })}
      </Link>
    )
  }
  if (situation.target === 'teens') {
    return (
      <Link href="/teens" className={cls}>
        {t('teens')}
      </Link>
    )
  }
  if (situation.target === 'about') {
    return (
      <Link href="/about" className={cls}>
        {t('about')}
      </Link>
    )
  }
  return (
    <Link href={{ pathname: '/agenda', query: { type: 'infoSessions' } }} className={cls}>
      {t('info')}
    </Link>
  )
}
