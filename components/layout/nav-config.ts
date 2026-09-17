import type { Pathname } from '@/i18n/routing'

/**
 * Static (non-dynamic) pathnames only. Dynamic routes like `/seminars/[slug]`
 * need a params object and can't be passed to <Link> as a bare string, so we
 * exclude them from the nav href type.
 */
type StaticPathname = Exclude<Pathname, `${string}[${string}]${string}`>

/** Header/footer navigation (brief §4, changed in 1.1): general info first, teens own item. */
export const mainNav: { key: 'about' | 'seminars' | 'teens' | 'agenda' | 'contact'; href: StaticPathname }[] = [
  { key: 'about', href: '/about' },
  { key: 'seminars', href: '/seminars' },
  { key: 'teens', href: '/teens' },
  { key: 'agenda', href: '/agenda' },
  { key: 'contact', href: '/contact' },
]
