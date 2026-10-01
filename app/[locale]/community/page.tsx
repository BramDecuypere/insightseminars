import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { getSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import type { Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const t = await getTranslations({ locale, namespace: 'communityPage' })
  return buildMetadata({
    title: t('title'),
    description: t('lead'),
    href: '/community',
    locale: l,
  })
}

const linkItemClass =
  'flex items-center justify-between gap-4 rounded-panel border border-lijn bg-papier px-5 py-4 text-lg font-semibold text-inkt transition-colors hover:bg-mist'

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav, settings] = await Promise.all([
    getTranslations('communityPage'),
    getTranslations('nav'),
    getSettings(),
  ])

  return (
    <>
      <header className="bg-mist text-inkt">
        <div className="container-site section-y">
          <h1 className="type-h1 text-inkt text-balance">{t('title')}</h1>
          <p className="type-lead mt-5 max-w-2xl text-leisteen">{t('lead')}</p>
        </div>
      </header>

      {/* Belgium (local) */}
      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{t('belgiumHeading')}</h2>
            <p className="type-body mt-5 text-inkt">{t('belgiumBody')}</p>

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
        </div>
      </section>

      {/* International */}
      <section className="bg-mist">
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{t('internationalHeading')}</h2>
            <p className="type-body mt-5 text-inkt">{t('internationalBody')}</p>

            {settings.internationalCalendarUrl ? (
              <a
                href={settings.internationalCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: 'primary' }), 'mt-8 inline-flex')}
              >
                {t('internationalCalendarCta')}
              </a>
            ) : null}

            <ul className="mt-8 flex flex-col gap-3">
              {settings.internationalLinks.map((l, i) =>
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
          </div>
        </div>
      </section>
    </>
  )
}
