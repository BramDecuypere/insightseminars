import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { HomeHero } from '@/components/home/home-hero'
import {
  RecogniseChooser,
  type ChooserSituation,
} from '@/components/home/recognise-chooser'
import { NewsletterBand } from '@/components/site/newsletter-band'
import { NextDatePanel } from '@/components/site/next-date-panel'
import { PathBlock } from '@/components/site/path-block'
import { Reveal } from '@/components/site/reveal'
import { TestimonialCard } from '@/components/site/testimonial-card'
import { VideoClip } from '@/components/site/video-clip'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import {
  getFeaturedTestimonials,
  getHomePage,
  getPrograms,
  getTestimonials,
  getUpcomingEvents,
  pick,
} from '@/lib/content'
import { buildEventViews } from '@/lib/content/view'
import { buildMetadata } from '@/lib/seo'
import type { Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

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
  const [home, programs, upcoming, testimonials, featured] = await Promise.all([
    getHomePage(),
    getPrograms(),
    getUpcomingEvents(now),
    getTestimonials(),
    getFeaturedTestimonials(),
  ])

  const adultPrograms = programs.filter((p) => p.track === 'adults')
  const eventViews = await buildEventViews(upcoming, l, now)
  const nextInsight1 = eventViews.find((v) => v.programSlug === 'insight-1')
  const nextInfo = eventViews.find((v) => v.type === 'infoSession')

  const situations: ChooserSituation[] = home.recognise.situations.map((s, i) => {
    const tst = s.testimonialId
      ? testimonials.find((x) => x._id === s.testimonialId)
      : undefined
    const prog = s.programSlug ? programs.find((p) => p.slug === s.programSlug) : undefined
    return {
      id: String(i),
      label: pick(s.label, l),
      target: s.target,
      programSlug: s.programSlug,
      programTitle: prog ? pick(prog.title, l) : undefined,
      testimonial: tst
        ? {
            situation: pick(tst.situation, l),
            quote: pick(tst.quote, l),
            name: tst.name,
            context: pick(tst.context, l),
          }
        : undefined,
    }
  })

  const featuredCards = featured.slice(0, 3)
  const showTestimonials = featuredCards.length > 0

  return (
    <>
      <HomeHero home={home} locale={l} />

      {/* Missie */}
      <section className="bg-mist">
        <Reveal className="container-site section-y max-w-3xl">
          <h2 className="type-h2 text-inkt text-balance">{pick(home.mission.heading, l)}</h2>
          <p className="type-lead mt-5 text-inkt">{pick(home.mission.body, l)}</p>
        </Reveal>
      </section>

      {/* Vertrouwen: getuigenissen */}
      {showTestimonials ? (
        <section className="bg-papier">
          <Reveal className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">
              {pick(home.testimonialsHeading, l)}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {featuredCards.map((tst) => (
                <li key={tst._id}>
                  <TestimonialCard
                    testimonial={tst}
                    locale={l}
                    playLabel={t('playVideo', { duration: '1 min' })}
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {/* 1. Herkenning */}
      {/* <section className="bg-papier">
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt text-balance">{t('recognise')}</h2>
          <div className="mt-8 max-w-3xl">
            <RecogniseChooser
              intro={pick(home.recognise.intro, l)}
              situations={situations}
              fallback={pick(home.recognise.fallback, l)}
            />
          </div>
        </div>
      </section> */}

      {/* 2. Begrip */}
      <section className={showTestimonials ? 'bg-mist' : 'bg-papier'}>
        <Reveal className="container-site section-y">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="type-h2 text-inkt text-balance">
                {pick(home.whatIsInsight.heading, l)}
              </h2>
              <p className="type-body mt-5 text-inkt">{pick(home.whatIsInsight.body, l)}</p>
            </div>
            <VideoClip
              clip={home.videoClip}
              poster={home.videoPoster}
              playLabel={t('playVideo', { duration: '1 min' })}
              locale={l}
            />
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="type-h2 text-inkt text-balance">
                {pick(home.howItWorks.heading, l)}
              </h2>
              <ul className="mt-6 space-y-6">
                {home.howItWorks.points.map((p) => (
                  <li key={p.title.nl}>
                    <h3 className="text-xl font-bold text-inkt">{pick(p.title, l)}</h3>
                    <p className="mt-1.5 text-base text-leisteen">{pick(p.text, l)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="type-h2 text-inkt text-balance">
                {pick(home.benefits.heading, l)}
              </h2>
              <ul className="mt-6 space-y-3">
                {home.benefits.items.map((item) => (
                  <li key={item.nl} className="flex items-start gap-3 text-lg text-inkt">
                    <span
                      aria-hidden
                      className="mt-2.5 size-2 shrink-0 rounded-full bg-[var(--accent-3)]"
                    />
                    {pick(item, l)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. Voor wie */}
      <section className={showTestimonials ? 'bg-papier' : 'bg-mist'}>
        <Reveal className="container-site section-y">
          <div className="max-w-3xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(home.forWho.heading, l)}</h2>
            <p className="type-body mt-5 text-inkt">{pick(home.forWho.body, l)}</p>
            <p className="mt-6 text-base text-leisteen">{pick(home.forWho.trustLine, l)}</p>
          </div>
        </Reveal>
      </section>

      {/* 4. Uitnodiging */}
      <section className="on-avondblauw bg-mist">
        <Reveal className="container-site section-y">
          <h2 className="type-h2 text-balance">{pick(home.path.heading, l)}</h2>
          <p className="type-lead mt-4 max-w-2xl">{pick(home.path.intro, l)}</p>

          <div className="mt-12">
            <PathBlock programs={adultPrograms} locale={l} />
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {nextInsight1 ? (
              <NextDatePanel
                view={nextInsight1}
                heading={pick(home.path.nextInsight1Heading, l)}
                locale={l}
              />
            ) : null}

            <div className="rounded-panel bg-papier p-6 text-inkt">
              {nextInfo ? (
                <NextDatePanel view={nextInfo} locale={l} />
              ) : (
                <>
                  <h3 className="text-lg font-bold text-inkt">
                    {pick(home.path.infoSessionLine, l)}
                  </h3>
                  <p className="mt-2 text-base text-leisteen">
                    {pick(home.hero.lead, l)}
                  </p>
                  <Link
                    href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
                    className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 w-full')}
                  >
                    {pick(home.hero.primaryCta, l)}
                  </Link>
                </>
              )}
            </div>
          </div>

          <p className="mt-10 text-lg text-inkt/85">
            {pick(home.path.teenLine, l)}{' '}
            <Link href="/teens" className="font-semibold underline underline-offset-4 hover:decoration-2">
              {pick({ nl: 'Naar de pagina voor tieners en ouders', en: 'Go to the page for teens and parents' }, l)}
            </Link>
          </p>
        </Reveal>
      </section>

      <NewsletterBand />
    </>
  )
}
