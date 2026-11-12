import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CaptionedPhotos } from '@/components/site/captioned-photos'
import { CheckList } from '@/components/site/check-list'
import { CollapsibleSection } from '@/components/site/collapsible-section'
import { CopyButton } from '@/components/site/copy-button'
import { JsonLd } from '@/components/site/json-ld'
import { PersonCard } from '@/components/site/person-card'
import { PhotoGrid } from '@/components/site/photo-grid'
import { ReadMore } from '@/components/site/read-more'
import { TestimonialBand } from '@/components/site/testimonial-band'
import { TestimonialCard } from '@/components/site/testimonial-card'
import { TestimonialGrid } from '@/components/site/testimonial-grid'
import { VideoClip } from '@/components/site/video-clip'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getAboutPage, getFacilitators, getSettings, getTeam, pick, pickRich } from '@/lib/content'
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
  const [page, settings, team, facilitators] = await Promise.all([
    getAboutPage(),
    getSettings(),
    getTeam(),
    getFacilitators(),
  ])
  const testimonials = page.testimonials
  const playLabel = tc('playVideo', { duration: '1 min' })
  const teamPhotos = page.teamPhotos ?? []
  const facilitatorVideos = page.facilitatorVideos ?? []
  const featured = page.featuredFacilitators ?? []
  const shownFacilitators = featured.length > 0 ? featured.slice(0, 6) : facilitators

  const supportBody = pick(page.support.body, l)
    .replace('{iban}', settings.iban ?? '')
    .replace('{accountHolder}', settings.accountHolder ?? '')

  const renderedSections = [
    'journey',
    ...(testimonials.length > 0 ? ['testimonials'] : []),
    'benefits',
    'story',
    ...(page.gallery && page.gallery.length > 0 ? ['gallery'] : []),
    'team',
    'facilitators',
    'support',
  ]
  const tone = (key: string) =>
    renderedSections.indexOf(key) % 2 === 0 ? 'bg-papier' : 'bg-mist'

  return (
    <>
      {page.videoClip ? <JsonLd data={videoJsonLd(page.videoClip, l)} /> : null}

      {/* Hero */}
      <header id="missie" className="scroll-mt-24 bg-mist text-inkt">
        <div className="container-site section-y">
          <h1 className="type-h1 text-inkt text-balance">{pick(page.hero.title, l)}</h1>
          <p className="type-lead mt-5 max-w-2xl text-leisteen">{pick(page.hero.lead, l)}</p>
        </div>
      </header>

      {/* Journey sections with Lees meer */}
      <section className={tone('journey')}>
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

      {/* Testimonials: just above "Wat kan het je brengen?" */}
      {testimonials.length > 0 ? (
        <section className={tone('testimonials')}>
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">
              {pick(page.testimonialsHeading, l) || t('testimonialsHeading')}
            </h2>
            {page.videoClip ? (
              <div className="mt-8 max-w-3xl">
                <VideoClip clip={page.videoClip} locale={l} playLabel={playLabel} />
              </div>
            ) : null}
            <div className="mt-8">
              {page.testimonialsLayout === 'band' ? (
                <TestimonialBand
                  label={pick(page.testimonialsHeading, l) || t('testimonialsHeading')}
                  pauseLabel={tc('pauseScroll')}
                  resumeLabel={tc('resumeScroll')}
                  items={testimonials.map((tst) => ({
                    key: tst._id,
                    node: <TestimonialCard testimonial={tst} locale={l} playLabel={playLabel} />,
                  }))}
                />
              ) : (
                <TestimonialGrid testimonials={testimonials} locale={l} playLabel={playLabel} />
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Benefits + Voor wie */}
      <section className={tone('benefits')}>
        <div className="container-site section-y">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="type-h2 text-inkt text-balance">{pick(page.benefits.heading, l)}</h2>
              <div className="mt-6">
                <CheckList items={page.benefits.items.map((item) => pick(item, l))} />
              </div>
            </div>
            <div>
              <h2 className="type-h2 text-inkt text-balance">{pick(page.forWho.heading, l)}</h2>
              <p className="type-body mt-6 text-inkt">{pick(page.forWho.body, l)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ons verhaal */}
      <section id="verhaal" className={cn('scroll-mt-24', tone('story'))}>
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.story.heading, l)}</h2>
            <div className="mt-6 space-y-4">
              {page.story.paragraphs.length > 0 ? (
                <p className="type-body text-inkt">{pick(page.story.paragraphs[0], l)}</p>
              ) : null}
              {page.story.paragraphs.length > 1 ? (
                <CollapsibleSection label={t('storyMore')}>
                  {page.story.paragraphs.slice(1).map((p, i) => (
                    <p key={i} className="type-body text-inkt">
                      {pick(p, l)}
                    </p>
                  ))}
                </CollapsibleSection>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Sfeerbeelden */}
      {page.gallery && page.gallery.length > 0 ? (
        <section className={tone('gallery')}>
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">
              {tc('galleryHeading')}
            </h2>
            <div className="mt-8">
              <PhotoGrid
                images={page.gallery}
                locale={l}
                openLabel={tc('openImage')}
                prevLabel={tc('prevImage')}
                nextLabel={tc('nextImage')}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Team */}
      <section id="team" className={cn('scroll-mt-24', tone('team'))}>
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt text-balance">{t('teamHeading')}</h2>
          <p className="type-body mt-5 max-w-2xl text-inkt">{pick(page.teamIntro, l)}</p>
          <CaptionedPhotos photos={teamPhotos.slice(0, 2)} locale={l} className="mt-10" />
          {team.length > 0 ? (
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => (
                <PersonCard
                  key={m._id}
                  photo={m.photo}
                  name={m.name}
                  role={pick(m.role, l)}
                  bio={pickRich(m.bio, l)}
                  locale={l}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Facilitators */}
      <section id="facilitators" className={cn('scroll-mt-24', tone('facilitators'))}>
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt text-balance">{t('facilitatorsHeading')}</h2>
          <p className="type-body mt-5 max-w-2xl text-inkt">{pick(page.facilitatorsIntro, l)}</p>
          {facilitatorVideos.length > 0 ? (
            <ul className={cn('mt-10 grid gap-8', facilitatorVideos.length > 1 ? 'md:grid-cols-2' : 'max-w-3xl')}>
              {facilitatorVideos.slice(0, 2).map((clip, i) => (
                <li key={i}>
                  <VideoClip clip={clip} locale={l} playLabel={playLabel} />
                </li>
              ))}
            </ul>
          ) : null}
          {shownFacilitators.length > 0 ? (
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {shownFacilitators.map((f) => (
                <PersonCard
                  key={f._id}
                  photo={f.photo}
                  name={f.name}
                  role={pick(f.role, l)}
                  bio={f.shortBio ? [pick(f.shortBio, l)] : pickRich(f.bio, l)}
                  locale={l}
                  photoSize="portrait"
                />
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Steun Insight */}
      <section id="steun" className={cn('scroll-mt-24', tone('support'))}>
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.support.heading, l)}</h2>
            <p className="type-body mt-5 text-inkt">{supportBody}</p>

            {settings.iban ? (
              <div className="mt-6">
                <CollapsibleSection label={t('supportMore')}>
                  <dl className="space-y-3">
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
                </CollapsibleSection>
              </div>
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
