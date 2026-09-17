import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { pick } from '@/lib/content'
import type { HomePage, Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

/** Hero on avondblauw (brief §9.5): question headline, one-sentence lead, a
 * primary info-session button and a secondary link to the seminars, with a
 * real 4:5 group photo alongside. */
export function HomeHero({ home, locale }: { home: HomePage; locale: Locale }) {
  const image = home.hero.image
  const alt = image ? (locale === 'en' ? image.alt.en : image.alt.nl) || image.alt.nl : ''

  return (
    <section className="">
      <div className="container-site section-y text-avondblauw">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
          <div>
            <h1 className="type-h1 text-balance">{pick(home.hero.title, locale)}</h1>
            <p className="type-lead mt-6 max-w-xl">{pick(home.hero.lead, locale)}</p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
                className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
              >
                {pick(home.hero.primaryCta, locale)}
              </Link>
              <Link
                href="/seminars"
                className="text-lg font-semibold underline underline-offset-4 hover:decoration-2"
              >
                {pick(home.hero.secondaryCta, locale)}
              </Link>
            </div>
          </div>

          {image ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-panel lg:mx-0">
              <Image
                src={image.src}
                alt={alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 26rem"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
