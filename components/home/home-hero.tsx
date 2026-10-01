import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { pick } from '@/lib/content'
import type { HomePage, Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

/** Hero on avondblauw (brief §9.5): title, one-sentence lead, a primary link
 * to the seminars overview and a secondary link to the free info sessions in
 * the agenda, with the group photo as a full-bleed background behind the
 * text. A navy scrim keeps the text readable regardless of the photo. */
export function HomeHero({ home, locale }: { home: HomePage; locale: Locale }) {
  const image = home.hero.image

  return (
    <section className="on-avondblauw relative isolate overflow-hidden bg-avondblauw text-papier">
      {image ? (
        <>
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, color-mix(in srgb, var(--avondblauw) 94%, transparent) 0%, color-mix(in srgb, var(--avondblauw) 80%, transparent) 45%, color-mix(in srgb, var(--avondblauw) 40%, transparent) 75%, color-mix(in srgb, var(--avondblauw) 18%, transparent) 100%)',
            }}
          />
        </>
      ) : null}

      <div className="container-site section-y relative">
        <div className="max-w-xl">
          <h1 className="type-h1 text-balance">{pick(home.hero.title, locale)}</h1>
          <p className="type-lead mt-6 text-papier/90">{pick(home.hero.lead, locale)}</p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/seminars"
              className={cn(buttonVariants({ variant: 'onDarkPrimary', size: 'lg' }))}
            >
              {pick(home.hero.primaryCta, locale)}
            </Link>
            <Link
              href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
              className="text-lg font-semibold text-papier underline underline-offset-4 hover:decoration-2"
            >
              {pick(home.hero.secondaryCta, locale)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
