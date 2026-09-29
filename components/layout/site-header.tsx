import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { getPrograms, pick } from '@/lib/content'
import { cn } from '@/lib/utils'
import { HeaderFrame } from './header-frame'
import { LanguageSwitcher } from './language-switcher'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { SpectrumStrip } from './spectrum-strip'

/**
 * Header on papier (brief §4, §9.1): logo left, short nav, NL/EN text
 * switch, a "Gratis infosessie" secondary button and the "Inschrijven"
 * primary button. Spectrum strip sits directly beneath. The border only
 * settles in once scrolled (HeaderFrame), a quiet cue that the page moved.
 */
export async function SiteHeader() {
  const [t, locale, programs] = await Promise.all([getTranslations('nav'), getLocale(), getPrograms()])
  const seminarPrograms = programs
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((program) => ({ slug: program.slug, title: pick(program.title, locale) }))

  return (
    <HeaderFrame>
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

        <MainNav seminarPrograms={seminarPrograms} />

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher onLight variant="compact" />
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

        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher onLight variant="compact" />
          <MobileNav seminarPrograms={seminarPrograms} />
        </div>
      </div>
      <SpectrumStrip />
    </HeaderFrame>
  )
}
