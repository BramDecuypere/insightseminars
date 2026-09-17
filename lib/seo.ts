import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import type {
  Facilitator,
  InsightEvent,
  Locale,
  Program,
  SiteSettings,
  Venue,
  VideoClip,
} from '@/lib/content/types'

/**
 * SEO helpers (brief §10). Canonicals always use the production origin, every
 * page ships nl / en / x-default alternates, and structured data follows the
 * schema.org shapes the brief lists. Localized URLs are derived from the
 * next-intl routing table so they never drift from the real paths.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insightseminars.be'
export const DEFAULT_OG_IMAGE = '/images/home-hero.png'

type Href = Parameters<typeof getPathname>[0]['href']

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

/** { canonical, languages } for a route, in the current locale (§10). */
export function alternatesFor(href: Href, locale: Locale): NonNullable<Metadata['alternates']> {
  const nl = absoluteUrl(getPathname({ locale: 'nl', href }))
  const en = absoluteUrl(getPathname({ locale: 'en', href }))
  return {
    canonical: locale === 'en' ? en : nl,
    languages: { nl, en, 'x-default': nl },
  }
}

/** Build a page's Metadata with canonical, hreflang and a default OG image. */
export function buildMetadata(opts: {
  title: string | { absolute: string }
  description?: string
  href: Href
  locale: Locale
  image?: string
  robots?: Metadata['robots']
}): Metadata {
  const alternates = alternatesFor(opts.href, opts.locale)
  const ogTitle = typeof opts.title === 'string' ? opts.title : opts.title.absolute
  return {
    title: opts.title,
    description: opts.description,
    alternates,
    robots: opts.robots,
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url: alternates.canonical as string,
      siteName: 'Insight Seminars België',
      locale: opts.locale === 'nl' ? 'nl_BE' : 'en_GB',
      type: 'website',
      images: [{ url: opts.image ?? DEFAULT_OG_IMAGE }],
    },
  }
}

function langOf(eventLanguage: string): string {
  // 'en-nl'/'nl-en' collapse to the language actually spoken first.
  return eventLanguage.startsWith('en') ? 'en' : 'nl'
}

export function organizationJsonLd(settings: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Insight Seminars België',
    url: SITE_URL,
    logo: absoluteUrl('/brand/insight-logo.png'),
    email: settings.email,
    sameAs: settings.socials.map((s) => s.url),
  }
}

export function eventJsonLd(opts: {
  event: InsightEvent
  program?: Program | null
  venue?: Venue | null
  facilitators: Facilitator[]
  locale: Locale
}) {
  const { event, program, venue, facilitators, locale } = opts
  const name =
    (program ? pickPlain(program.title, locale) : undefined) ??
    pickPlain(event.title, locale) ??
    'Insight'
  const image = event.image?.src ?? program?.heroImage?.src
  const soldOut = event.registrationStatus === 'full' || event.registrationStatus === 'closed'
  const registrationUrl = absoluteUrl(
    getPathname({ locale, href: { pathname: '/register/[event]', params: { event: event.slug } } }),
  )

  const offers = event.priceOptions.map((p) => ({
    '@type': 'Offer',
    name: pickPlain(p.label, locale),
    price: p.amount.toFixed(2),
    priceCurrency: 'EUR',
    availability: soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    ...(p.validUntil ? { validThrough: `${p.validUntil}T23:59:59+01:00` } : {}),
    url: registrationUrl,
  }))

  const online = Boolean(event.online) || event.type === 'infoSession'

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    startDate: event.start,
    endDate: event.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: online
      ? { '@type': 'VirtualLocation', url: registrationUrl }
      : venue
        ? {
            '@type': 'Place',
            name: venue.name,
            address: {
              '@type': 'PostalAddress',
              streetAddress: venue.street,
              postalCode: venue.postalCode,
              addressLocality: venue.city,
              addressCountry: venue.country,
            },
          }
        : undefined,
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    organizer: { '@type': 'Organization', name: 'Insight Seminars België', url: SITE_URL },
    ...(facilitators.length > 0
      ? { performer: facilitators.map((f) => ({ '@type': 'Person', name: f.name })) }
      : {}),
    inLanguage: langOf(event.language),
    ...(offers.length > 0 ? { offers } : {}),
  }
}

export function videoJsonLd(clip: VideoClip, locale: Locale, uploadDate?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: pickPlain(clip.title, locale) ?? 'Insight',
    description: pickPlain(clip.title, locale) ?? 'Insight',
    ...(clip.poster ? { thumbnailUrl: [absoluteUrl(clip.poster.src)] } : {}),
    ...(uploadDate ? { uploadDate } : {}),
    ...(clip.youtubeUrl ? { contentUrl: clip.youtubeUrl } : {}),
  }
}

function pickPlain(field: { nl: string; en?: string } | undefined, locale: Locale): string | undefined {
  if (!field) return undefined
  return (locale === 'en' ? field.en : field.nl) || field.nl || undefined
}
