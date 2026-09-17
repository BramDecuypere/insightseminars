import type { MetadataRoute } from 'next'
import { getPathname } from '@/i18n/navigation'
import { getPrograms } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'
import type { Pathname } from '@/i18n/routing'

/**
 * Public routes, programs and upcoming events with nl/en language alternates
 * (brief §10). Noindex routes (confirmation, pay, newsletter-confirmed) are
 * left out and disallowed in robots.ts.
 */
// Non-dynamic pathnames only; dynamic routes are added explicitly with params.
type StaticPathname = Exclude<Pathname, `${string}[${string}]${string}`>

const STATIC_ROUTES: StaticPathname[] = [
  '/',
  '/about',
  '/seminars',
  '/teens',
  '/agenda',
  '/faq',
  '/contact',
  '/links',
  '/privacy',
  '/terms',
  '/safeguarding',
]

function entry(href: Parameters<typeof getPathname>[0]['href']): MetadataRoute.Sitemap[number] {
  const nl = absoluteUrl(getPathname({ locale: 'nl', href }))
  const en = absoluteUrl(getPathname({ locale: 'en', href }))
  return {
    url: nl,
    alternates: { languages: { nl, en } },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const programs = await getPrograms()

  return [
    ...STATIC_ROUTES.map((pathname) => entry(pathname)),
    ...programs.map((p) =>
      entry({ pathname: '/seminars/[slug]', params: { slug: p.slug } }),
    ),
  ]
}
