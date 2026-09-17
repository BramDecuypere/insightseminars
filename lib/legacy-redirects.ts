/**
 * Legacy redirects from the old WordPress site on insightseminars.nl to the new
 * insightseminars.be site (brief §12).
 *
 * This module is imported by `next.config.ts` (to emit host-based redirect
 * rules) and by a unit test. It must stay dependency-free — no `server-only`,
 * no env module — so it can be loaded in the Next config's plain Node context.
 */

/** A single old-path → new-destination mapping. Paths carry no trailing slash. */
export interface LegacyRoute {
  /** Old path on .nl, without locale prefix or trailing slash (root is '/'). */
  from: string
  /** Destination path on the .be site for Dutch visitors (locale-prefixed). */
  nl: string
  /** Destination path for English visitors (old path requested under /en/…). */
  en: string
}

/**
 * The §12 path map. The English column applies to the same slug under `/en/…`.
 * Destinations are site-relative paths on insightseminars.be; the builder makes
 * them absolute and appends `?from=nl`.
 */
export const LEGACY_ROUTES: LegacyRoute[] = [
  { from: '/', nl: '/nl', en: '/en' },
  { from: '/de-seminars', nl: '/nl/seminars', en: '/en/seminars' },
  { from: '/insight-1', nl: '/nl/seminars/insight-1', en: '/en/seminars/insight-1' },
  { from: '/insight-2', nl: '/nl/seminars/insight-2', en: '/en/seminars/insight-2' },
  { from: '/insight-3', nl: '/nl/seminars/insight-3', en: '/en/seminars/insight-3' },
  { from: '/teens', nl: '/nl/tieners', en: '/en/teens' },
  { from: '/aanmelden-teens', nl: '/nl/tieners', en: '/en/teens' },
  { from: '/over-insight', nl: '/nl/over-insight', en: '/en/about-insight' },
  { from: '/team-nederland', nl: '/nl/over-insight#team', en: '/en/about-insight#team' },
  { from: '/team-belgie', nl: '/nl/over-insight#team', en: '/en/about-insight#team' },
  { from: '/veelgestelde-vragen', nl: '/nl/veelgestelde-vragen', en: '/en/faq' },
  { from: '/aanmelden', nl: '/nl/agenda', en: '/en/calendar' },
  { from: '/aanmelden-belgie-2', nl: '/nl/agenda', en: '/en/calendar' },
  { from: '/workshop', nl: '/nl/agenda', en: '/en/calendar' },
  { from: '/contact', nl: '/nl/contact', en: '/en/contact' },
  { from: '/donate', nl: '/nl/over-insight#steun', en: '/en/about-insight#support' },
  // Blog index and the three known posts all fold back to the home page.
  { from: '/blog', nl: '/nl', en: '/en' },
  {
    from: '/hoe-ontsnap-je-uit-de-valkuil-van-ik-heb-nog-te-veel-te-doen',
    nl: '/nl',
    en: '/en',
  },
  {
    from: '/waarom-succes-en-geluk-zo-afhankelijk-zijn-van-elkaar',
    nl: '/nl',
    en: '/en',
  },
  { from: '/new-post', nl: '/nl', en: '/en' },
]

/** Old PDF uploads that map to the current legal pages (Dutch only). */
export const LEGACY_PDF_ROUTES = [
  { match: 'Voorwaarden', destination: '/nl/algemene-voorwaarden' },
  { match: 'Privacyverklaring', destination: '/nl/privacy' },
] as const

/** Insert `?from=nl` before any hash fragment in a site-relative path. */
function withFromNl(path: string): string {
  const hashIndex = path.indexOf('#')
  if (hashIndex === -1) return `${path}?from=nl`
  return `${path.slice(0, hashIndex)}?from=nl${path.slice(hashIndex)}`
}

/** Strip a single trailing slash, but keep the root '/'. */
function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '')
  return pathname
}

/**
 * Resolve an old .nl request path to its new site-relative destination,
 * including `?from=nl`. Trailing slashes are tolerated and the `/en/…` prefix
 * selects the English column. Unknown paths fall back to the home page.
 *
 * This is the single source of truth the unit test exercises; the Next config
 * builder produces static rules that mirror the same decisions.
 */
export function resolveLegacyPath(pathname: string): string {
  const path = normalize(pathname)
  const isEnglish = path === '/en' || path.startsWith('/en/')
  const lang: keyof Pick<LegacyRoute, 'nl' | 'en'> = isEnglish ? 'en' : 'nl'

  // The old path without its /en prefix (English home becomes '/').
  const oldPath = isEnglish ? path.slice(3) || '/' : path

  // PDF uploads → legal pages (Dutch destinations only, per §12).
  if (oldPath.startsWith('/wp-content/')) {
    for (const pdf of LEGACY_PDF_ROUTES) {
      if (oldPath.includes(pdf.match) && oldPath.toLowerCase().endsWith('.pdf')) {
        return withFromNl(pdf.destination)
      }
    }
  }

  const route = LEGACY_ROUTES.find((r) => r.from === oldPath)
  if (route) return withFromNl(route[lang])

  // Catch-all: home page in the requested language.
  return withFromNl(isEnglish ? '/en' : '/nl')
}

/** A Next.js redirect rule (the subset we emit). */
export interface NextRedirect {
  source: string
  has: { type: 'host'; value: string }[]
  destination: string
  statusCode: 301
}

const NL_HOST = { type: 'host' as const, value: '(?:www\\.)?insightseminars\\.nl' }

/** Add both the bare and trailing-slash variants of a source path. */
function sourceVariants(path: string): string[] {
  if (path === '/') return ['/']
  return [path, `${path}/`]
}

/**
 * Build the host-based 301 rules for `next.config.ts` (brief §12). Every rule is
 * constrained to the .nl host, produces an absolute destination on
 * `siteUrl` with `?from=nl`, tolerates a trailing slash, and the two catch-alls
 * are emitted last so exact matches always win.
 */
export function buildLegacyRedirects(siteUrl: string): NextRedirect[] {
  const base = siteUrl.replace(/\/$/, '')
  const abs = (dest: string) => `${base}${dest}`
  const rules: NextRedirect[] = []

  const add = (source: string, destination: string) => {
    rules.push({ source, has: [NL_HOST], destination, statusCode: 301 })
  }

  for (const route of LEGACY_ROUTES) {
    // Dutch column: the bare old path.
    for (const source of sourceVariants(route.from)) {
      add(source, abs(withFromNl(route.nl)))
    }
    // English column: the same old path under /en/… (skip the root, handled by
    // the '/en' catch-all form below via the '/' entry).
    const enSource = route.from === '/' ? '/en' : `/en${route.from}`
    for (const source of sourceVariants(enSource)) {
      add(source, abs(withFromNl(route.en)))
    }
  }

  // Old PDF uploads → legal pages.
  for (const pdf of LEGACY_PDF_ROUTES) {
    add(`/wp-content/:path(.*${pdf.match}.*\\.pdf)`, abs(withFromNl(pdf.destination)))
  }

  // Catch-alls last: English first (more specific), then everything else.
  add('/en/:path*', abs(withFromNl('/en')))
  add('/:path*', abs(withFromNl('/nl')))

  return rules
}
