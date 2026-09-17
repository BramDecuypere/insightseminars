import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getSettings } from '@/lib/content'
import { NewsletterForm } from '@/components/site/newsletter-form'
import { LanguageSwitcher } from './language-switcher'
import { mainNav } from './nav-config'

/** Footer on a light mist background with an avondblauw top border (brief §4).
 *  Legal-entity line stays hidden until the settings fields are filled. */
export async function SiteFooter() {
  const [t, settings, locale] = await Promise.all([
    getTranslations(),
    getSettings(),
    getLocale(),
  ])

  const legalEntity = [
    settings.legalName,
    settings.legalForm,
    settings.registeredOffice,
    settings.enterpriseNumber,
    settings.rprCourt ? `RPR ${settings.rprCourt}` : undefined,
  ].filter(Boolean)

  return (
    <footer className="border-t border-avondblauw bg-papier text-inkt">
      {/* <div className="border-b border-lijn">
        <div className="container-site grid gap-6 py-12 md:grid-cols-2 md:items-center">
          <div className="max-w-md">
            <h2 className="type-h3 text-inkt text-balance">{t('newsletter.title')}</h2>
            <p className="mt-2 type-small text-leisteen">{t('newsletter.body')}</p>
          </div>
          <NewsletterForm compact />
        </div>
      </div> */}
      <div className="container-site grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Image
            src="/brand/insight-logo-on-white.png"
            alt="Insight Seminars"
            width={114}
            height={56}
            className="h-14 w-auto"
          />
          <p className="mt-4 type-small text-leisteen">{settings.orgName}</p>
          <a
            href={`mailto:${settings.email}`}
            className="mt-2 inline-block text-inkt/90 underline underline-offset-4 hover:text-inkt"
          >
            {settings.email}
          </a>
        </div>

        <nav aria-label={t('nav.menu')} className="flex flex-col gap-2">
          {mainNav.map((item) => (
            <Link key={item.key} href={item.href} className="text-leisteen hover:text-inkt">
              {t(`nav.${item.key}`)}
            </Link>
          ))}
          <Link href="/faq" className="text-leisteen hover:text-inkt">
            {t('nav.faq')}
          </Link>
          <Link href="/links" className="text-leisteen hover:text-inkt">
            {t('nav.links')}
          </Link>
        </nav>

        <div className="flex flex-col gap-2">
          <h2 className="type-small font-bold text-inkt">{t('footer.world')}</h2>
          {settings.internationalLinks.map((l) =>
            l.url ? (
              <a
                key={l.label}
                href={l.url}
                className="text-leisteen hover:text-inkt"
                target="_blank"
                rel="noreferrer"
              >
                {l.label}
              </a>
            ) : (
              <span key={l.label} className="text-leisteen/70">
                {l.label}
              </span>
            ),
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="type-small font-bold text-inkt">{t('footer.follow')}</h2>
          {settings.socials.map((s) => (
            <a
              key={s.platform}
              href={s.url}
              className="text-leisteen hover:text-inkt"
              target="_blank"
              rel="noreferrer"
            >
              {s.platform}
            </a>
          ))}
          <LanguageSwitcher className="mt-2" onLight />
        </div>
      </div>

      <div className="border-t border-lijn">
        <div className="container-site flex flex-col gap-3 py-6 text-leisteen md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 type-small">
            <Link href="/privacy" className="hover:text-inkt">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-inkt">
              {t('footer.terms')}
            </Link>
            <Link href="/safeguarding" className="hover:text-inkt">
              {t('footer.safeguarding')}
            </Link>
          </div>
          {legalEntity.length > 0 && (
            <p className="type-small text-leisteen/70">{legalEntity.join(' \u00b7 ')}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
