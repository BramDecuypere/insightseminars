import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { SpectrumStrip } from './spectrum-strip'

/**
 * Header on papier (brief §4, §9.1): logo left, short nav, NL/EN text
 * switch, a "Gratis infosessie" secondary button and the "Inschrijven"
 * primary button. Spectrum strip sits directly beneath.
 */
export async function SiteHeader() {
  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-40 border-b border-lijn bg-papier text-inkt">
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Insight Seminars">
          <Image
            src="/brand/insight-logo-on-white.png"
            alt="Insight Seminars"
            width={107}
            height={53}
            priority
            className="h-20 w-auto"
          />
        </Link>

        <MainNav />

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher onLight />
          <Link
            href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
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
