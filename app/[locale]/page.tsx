import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { HomeHero } from '@/components/home/home-hero'
import { EventRow } from '@/components/site/event-row'
import { NewsletterForm } from '@/components/site/newsletter-form'
import { NextDatePanel } from '@/components/site/next-date-panel'
import { PathBlock } from '@/components/site/path-block'
import { Reveal } from '@/components/site/reveal'
import { TestimonialCard } from '@/components/site/testimonial-card'
import { Link } from '@/i18n/navigation'
import {
  getFeaturedTestimonials,
  getHomePage,
  getPrograms,
  getUpcomingEvents,
  pick,
} from '@/lib/content'
import { buildEventViews } from '@/lib/content/view'
import { buildMetadata } from '@/lib/seo'
import type { Locale } from '@/lib/content/types'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const home = await getHomePage()
  const l = locale as Locale
  return buildMetadata({
    title: { absolute: pick(home.seo.title, l) },
    description: pick(home.seo.description, l),
    href: '/',
    locale: l,
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const now = new Date()

  const t = await getTranslations('common')
  const [home, programs, upcoming, featured] = await Promise.all([
    getHomePage(),
    getPrograms(),
    getUpcomingEvents(now),
    getFeaturedTestimonials(),
  ])

  const adultPrograms = programs.filter((p) => p.track === 'adults')
  const eventViews = await buildEventViews(upcoming, l, now)
  const nextFour = eventViews.slice(0, 4)
  const nextFreeSession = eventViews.find((v) => v.free && v.regState !== 'closed')
  const testimonial = featured[0]

  return (
    <>
      <HomeHero home={home} locale={l} />

      {/* Herken je dit? */}
      <section className="bg-mist">
        <Reveal className="container-site section-y max-w-3xl">
          <h2 className="type-h2 text-inkt text-balance">{t('recognise')}</h2>
          <p className="type-body mt-4 text-inkt">{pick(home.recognise.intro, l)}</p>
          <ul className="mt-8 space-y-4">
            {home.recognise.situations.map((s, i) => (
              <li key={i} className="flex gap-3 text-lg text-inkt">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent-3" aria-hidden="true" />
                <span>{pick(s.label, l)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Hoe het werkt */}
      <section className="bg-papier">
        <Reveal className="container-site section-y">
          <h2 className="type-h2 text-inkt text-balance">{pick(home.howItWorks.heading, l)}</h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {home.howItWorks.points.map((p) => (
              <li key={p.title.nl}>
                <h3 className="text-xl font-bold text-inkt">{pick(p.title, l)}</h3>
                <p className="mt-1.5 text-base text-leisteen">{pick(p.text, l)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Het pad */}
      <section className="on-avondblauw bg-avondblauw">
        <Reveal className="container-site section-y">
          <h2 className="type-h2 text-papier text-balance">{pick(home.path.heading, l)}</h2>
          <p className="type-lead mt-4 max-w-2xl text-papier/85">{pick(home.path.intro, l)}</p>

          <div className="mt-12">
            <PathBlock programs={adultPrograms} locale={l} />
          </div>

          <p className="mt-10 text-lg text-papier/85">
            {pick(home.path.teenLine, l)}{' '}
            <Link href="/teens" className="font-semibold underline underline-offset-4 hover:decoration-2">
              {pick({ nl: 'Naar de pagina voor tieners en ouders', en: 'Go to the page for teens and parents' }, l)}
            </Link>
          </p>
        </Reveal>
      </section>

      {/* Binnenkort */}
      {nextFour.length > 0 ? (
        <section className="bg-mist">
          <Reveal className="container-site section-y">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="type-h2 text-inkt text-balance">{t('upcomingHeading')}</h2>
              <Link
                href="/agenda"
                className="font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
              >
                {t('viewAgenda')}
              </Link>
            </div>
            <ul className="mt-8 space-y-4">
              {nextFour.map((view) => (
                <EventRow key={view.slug} view={view} locale={l} />
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {/* Een getuigenis */}
      {testimonial ? (
        <section className="bg-papier">
          <Reveal className="container-site py-14 max-w-2xl md:py-16">
            <h2 className="type-h2 text-inkt text-balance">{pick(home.testimonialsHeading, l)}</h2>
            <div className="mt-8">
              <TestimonialCard
                testimonial={testimonial}
                locale={l}
                playLabel={t('playVideo', { duration: '1 min' })}
              />
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* Eerst kennismaken? */}
      <section id="nieuwsbrief" className="on-avondblauw bg-avondblauw">
        <Reveal className="container-site py-14 text-center md:py-16">
          <div className="mx-auto max-w-xl">
            <h2 className="type-h2 text-papier text-balance">{t('meetFirstHeading')}</h2>
            {nextFreeSession ? (
              <div className="mt-8 text-left">
                <NextDatePanel view={nextFreeSession} locale={l} />
              </div>
            ) : (
              <>
                <p className="type-lead mt-4 text-papier/80">{t('notifyNewInfoSession')}</p>
                <div className="mt-6 text-left">
                  <NewsletterForm />
                </div>
              </>
            )}
          </div>
        </Reveal>
      </section>
    </>
  )
}
