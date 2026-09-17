import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CopyButton } from '@/components/site/copy-button'
import { JsonLd } from '@/components/site/json-ld'
import { PersonCard } from '@/components/site/person-card'
import { ReadMore } from '@/components/site/read-more'
import { TestimonialCard } from '@/components/site/testimonial-card'
import { VideoClip } from '@/components/site/video-clip'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import {
  getAboutPage,
  getFacilitators,
  getSettings,
  getTeam,
  getTestimonials,
  pick,
  pickRich,
} from '@/lib/content'
import { buildMetadata, videoJsonLd } from '@/lib/seo'
import type { Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const page = await getAboutPage()
  return buildMetadata({
    title: pick(page.seo.title, l),
    description: pick(page.seo.description, l),
    href: '/about',
    locale: l,
  })
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const t = await getTranslations('aboutPage')
  const tc = await getTranslations('common')
  const [page, settings, team, facilitators, testimonials] = await Promise.all([
    getAboutPage(),
    getSettings(),
    getTeam(),
    getFacilitators(),
    getTestimonials(),
  ])

  const supportBody = pick(page.support.body, l)
    .replace('{iban}', settings.iban ?? '')
    .replace('{accountHolder}', settings.accountHolder ?? '')

  return (
    <>
      {page.videoClip ? <JsonLd data={videoJsonLd(page.videoClip, l)} /> : null}

      {/* Hero */}
      <header className="on-avondblauw bg-avondblauw text-papier">
        <div className="container-site section-y">
          <h1 className="type-h1 text-papier text-balance">{pick(page.hero.title, l)}</h1>
          <p className="type-lead mt-5 max-w-2xl text-papier/85">{pick(page.hero.lead, l)}</p>
        </div>
      </header>

      {/* Journey sections with Lees meer */}
      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
            {page.sections.map((s) => (
              <div key={s.heading.nl}>
                <h2 className="type-h3 text-inkt text-balance">{pick(s.heading, l)}</h2>
                <div className="mt-3">
                  <ReadMore
                    short={pick(s.short, l)}
                    more={s.more ? pick(s.more, l) : undefined}
                    moreLabel={tc('moreText')}
                    lessLabel={tc('lessText')}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Voor wie */}
      <section className="bg-mist">
        <div className="container-site section-y">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="type-h2 text-inkt text-balance">{pick(page.benefits.heading, l)}</h2>
              <ul className="mt-6 space-y-3">
                {page.benefits.items.map((item) => (
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
            <div>
              <h2 className="type-h2 text-inkt text-balance">{pick(page.forWho.heading, l)}</h2>
              <p className="type-body mt-6 text-inkt">{pick(page.forWho.body, l)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="bg-papier">
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">{t('testimonialsHeading')}</h2>
            {page.videoClip ? (
              <div className="mt-8 max-w-3xl">
                <VideoClip clip={page.videoClip} locale={l} playLabel={tc('playVideo', { duration: '1 min' })} />
              </div>
            ) : null}
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((tst) => (
                <li key={tst._id}>
                  <TestimonialCard
                    testimonial={tst}
                    locale={l}
                    playLabel={tc('playVideo', { duration: '1 min' })}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Ons verhaal */}
      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.story.heading, l)}</h2>
            <div className="mt-6 space-y-4">
              {page.story.paragraphs.map((p, i) => (
                <p key={i} className="type-body text-inkt">
                  {pick(p, l)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-24 bg-mist">
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt text-balance">{t('teamHeading')}</h2>
          <p className="type-body mt-5 max-w-2xl text-inkt">{pick(page.teamIntro, l)}</p>
          {team.length > 0 ? (
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <PersonCard
                  key={m._id}
                  photo={m.photo}
                  name={m.name}
                  role={pick(m.role, l)}
                  bio={m.bio ? [pick(m.bio, l)] : undefined}
                  locale={l}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Facilitators */}
      <section id="facilitators" className="scroll-mt-24 bg-papier">
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt text-balance">{t('facilitatorsHeading')}</h2>
          <p className="type-body mt-5 max-w-2xl text-inkt">{pick(page.facilitatorsIntro, l)}</p>
          {facilitators.length > 0 ? (
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {facilitators.map((f) => (
                <PersonCard
                  key={f._id}
                  photo={f.photo}
                  name={f.name}
                  role={pick(f.role, l)}
                  bio={pickRich(f.bio, l)}
                  locale={l}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Steun Insight */}
      <section id="steun" className="scroll-mt-24 bg-mist">
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.support.heading, l)}</h2>
            <p className="type-body mt-5 text-inkt">{supportBody}</p>

            {settings.iban ? (
              <dl className="mt-6 space-y-3 rounded-panel border border-lijn bg-mist p-6">
                <div>
                  <dt className="text-sm text-leisteen">{t('supportIban')}</dt>
                  <dd className="mt-1 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-lg font-semibold text-inkt">{settings.iban}</span>
                    <CopyButton value={settings.iban} label={t('supportIban')} />
                  </dd>
                </div>
                {settings.accountHolder ? (
                  <div className="border-t border-lijn pt-3">
                    <dt className="text-sm text-leisteen">{t('supportHolder')}</dt>
                    <dd className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-lg font-semibold text-inkt">{settings.accountHolder}</span>
                      <CopyButton value={settings.accountHolder} label={t('supportHolder')} />
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      {/* Closing invitation */}
      <section className="on-avondblauw bg-avondblauw text-papier">
        <div className="container-site section-y text-center">
          <h2 className="type-h2 text-papier text-balance">{pick(page.closing.heading, l)}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
              className={cn(buttonVariants({ variant: 'primary' }), 'w-full sm:w-auto')}
            >
              {t('infoCta')}
            </Link>
            <Link
              href="/seminars"
              className={cn(buttonVariants({ variant: 'onDark' }), 'w-full sm:w-auto')}
            >
              {t('seminarsCta')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
