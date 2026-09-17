import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'
import { MobileNav } from './mobile-nav'
import { mainNav } from './nav-config'
import { SpectrumStrip } from './spectrum-strip'

/**
 * Header on avondblauw (brief §4, §9.1): logo left, short nav, NL/EN text
 * switch, a "Gratis infosessie" secondary button and the "Inschrijven"
 * primary button. Spectrum strip sits directly beneath.
 */
export async function SiteHeader() {
  const t = await getTranslations('nav')

  return (
    <header className="on-avondblauw sticky top-0 z-40 bg-avondblauw text-papier">
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Insight Seminars">
          <Image
            src="/brand/insight-logo.png"
            alt="Insight Seminars"
            width={89}
            height={44}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t('menu')}>
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-md px-3 py-2 text-base font-semibold text-papier/90 transition-colors hover:bg-white/10 hover:text-papier"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
            className={cn(buttonVariants({ variant: 'onDark', size: 'sm' }))}
          >
            {t('infoSession')}
          </Link>
          <Link
            href={{ pathname: '/agenda', query: { type: 'seminars' } }}
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}
          >
            {t('cta')}
          </Link>
        </div>

        <MobileNav />
      </div>
      <SpectrumStrip />
    </header>
  )
}
