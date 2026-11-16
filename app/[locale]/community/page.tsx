import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { PhotoGrid } from '@/components/site/photo-grid'
import { TestimonialGrid } from '@/components/site/testimonial-grid'
import { getCommunityPage, getInternationalLinks, getSettings, pick } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import type { CommunityBlock, Continent, InternationalLink, Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const page = await getCommunityPage()
  return buildMetadata({
    title: pick(page.seo.title, l) || pick(page.hero.title, l),
    description: pick(page.seo.description, l) || pick(page.hero.lead, l),
    href: '/community',
    locale: l,
  })
}

const linkItemClass =
  'flex items-center justify-between gap-4 rounded-panel border border-lijn bg-papier px-5 py-4 text-lg font-semibold text-inkt transition-colors hover:bg-mist'

const CONTINENT_ORDER: Continent[] = ['europe', 'northAmerica', 'latinAmerica', 'oceania', 'asia', 'africa']

function InternationalLinkList({ links }: { links: InternationalLink[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {links.map((l, i) =>
        l.url ? (
          <li key={`${l.label}-${i}`}>
            <a href={l.url} target="_blank" rel="noreferrer" className={linkItemClass}>
              <span>{l.label}</span>
              <ArrowUpRight className="size-5 shrink-0" aria-hidden />
            </a>
          </li>
        ) : (
          <li
            key={`${l.label}-${i}`}
            className="flex items-center gap-4 rounded-panel border border-lijn px-5 py-4 text-lg font-semibold text-leisteen"
          >
            {l.label}
          </li>
        ),
      )}
    </ul>
  )
}

/** Photos and testimonials under a community section; renders nothing while both are empty. */
async function CommunityMedia({ block, max, locale }: { block: CommunityBlock; max: number; locale: Locale }) {
  const photos = block.photos.slice(0, max)
  const testimonials = block.testimonials.slice(0, max)
  if (photos.length === 0 && testimonials.length === 0) return null

  const [t, tc] = await Promise.all([getTranslations('communityPage'), getTranslations('common')])
  return (
    <div className="mt-16 space-y-12">
      {photos.length > 0 ? (
        <PhotoGrid
          images={photos}
          locale={locale}
          openLabel={tc('openImage')}
          prevLabel={tc('prevImage')}
          nextLabel={tc('nextImage')}
        />
      ) : null}
      {testimonials.length > 0 ? (
        <div>
          <h3 className="type-h3 text-inkt text-balance">{t('testimonialsHeading')}</h3>
          <TestimonialGrid
            testimonials={testimonials}
            locale={locale}
            playLabel={tc('playVideo', { duration: '1 min' })}
            max={max}
            className="mt-6"
          />
        </div>
      ) : null}
    </div>
  )
}

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const [t, tNav, settings, page, worldLinks] = await Promise.all([
    getTranslations('communityPage'),
    getTranslations('nav'),
    getSettings(),
    getCommunityPage(),
    getInternationalLinks(),
  ])

  // Links without a continent (e.g. the international organisation) come first, ungrouped.
  const ungrouped = worldLinks.filter((link) => !link.continent)
  const groups = CONTINENT_ORDER.map((continent) => ({
    continent,
    links: worldLinks.filter((link) => link.continent === continent),
  })).filter((g) => g.links.length > 0)

  return (
    <>
      <header className="bg-mist text-inkt">
        <div
          className={cn(
            'container-site section-y',
            page.image && 'grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16',
          )}
        >
          <div>
            <h1 className="type-h1 text-inkt text-balance">{pick(page.hero.title, l)}</h1>
            <p className="type-lead mt-5 max-w-2xl text-leisteen">{pick(page.hero.lead, l)}</p>
          </div>
          {page.image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-panel">
              <Image
                src={page.image.src}
                alt={pick(page.image.alt, l)}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </header>

      {/* Belgium (local) */}
      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.belgium.heading, l)}</h2>
            <p className="type-body mt-5 text-inkt">{pick(page.belgium.body, l)}</p>

            <ul className="mt-8 flex flex-col gap-3">
              <li>
                <Link
                  href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
                  className={linkItemClass}
                >
                  <span>{tNav('infoSession')}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkItemClass}>
                  <span>{tNav('contact')}</span>
                </Link>
              </li>
              {settings.socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className={linkItemClass}
                  >
                    <span>{s.platform}</span>
                    <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <CommunityMedia block={page.belgium} max={5} locale={l} />
        </div>
      </section>

      {/* International */}
      <section className="bg-mist">
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.international.heading, l)}</h2>
            <p className="type-body mt-5 text-inkt">{pick(page.international.body, l)}</p>

            {settings.internationalCalendarUrl ? (
              <a
                href={settings.internationalCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: 'primary' }), 'mt-8 inline-flex')}
              >
                {pick(page.international.calendarCta, l)}
              </a>
            ) : null}

            {ungrouped.length > 0 ? (
              <div className="mt-8">
                <InternationalLinkList links={ungrouped} />
              </div>
            ) : null}

            {groups.map((g) => (
              <div key={g.continent} className="mt-10">
                <h3 className="type-h3 text-inkt">{t(`continents.${g.continent}`)}</h3>
                <div className="mt-4">
                  <InternationalLinkList links={g.links} />
                </div>
              </div>
            ))}
          </div>

          <CommunityMedia block={page.international} max={3} locale={l} />
        </div>
      </section>
    </>
  )
}
