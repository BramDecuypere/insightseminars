import type { Pathname } from '@/i18n/routing'

/**
 * Static (non-dynamic) pathnames only. Dynamic routes like `/seminars/[slug]`
 * need a params object and can't be passed to <Link> as a bare string, so we
 * exclude them from the nav href type.
 */
type StaticPathname = Exclude<Pathname, `${string}[${string}]${string}`>

type NavHref = StaticPathname | { pathname: StaticPathname; query?: Record<string, string>; hash?: string }

export type NavSubItem = { key: string; href: NavHref }

/** Header/footer navigation (brief §4, §7). Items with `children` render as a
 *  dropdown on desktop (NavigationMenu) and an accordion group on mobile.
 *  "Seminars" additionally gets the live program list, built from
 *  `getPrograms()` where this config is consumed (site-header.tsx), since
 *  program slugs aren't known statically. */
export const mainNav: {
  key: 'about' | 'seminars' | 'teens' | 'agenda' | 'community' | 'contact'
  href: StaticPathname
  children?: NavSubItem[]
}[] = [
  {
    key: 'about',
    href: '/about',
    children: [
      { key: 'aboutMissie', href: { pathname: '/about', hash: 'missie' } },
      { key: 'aboutStory', href: { pathname: '/about', hash: 'verhaal' } },
      { key: 'aboutTeam', href: { pathname: '/about', hash: 'team' } },
      { key: 'aboutFacilitators', href: { pathname: '/about', hash: 'facilitators' } },
      { key: 'aboutSteun', href: { pathname: '/about', hash: 'steun' } },
    ],
  },
  { key: 'seminars', href: '/seminars' },
  { key: 'teens', href: '/teens' },
  {
    key: 'agenda',
    href: '/agenda',
    children: [
      { key: 'agendaSeminars', href: { pathname: '/agenda', query: { type: 'seminars' } } },
      { key: 'agendaTeens', href: { pathname: '/agenda', query: { type: 'teens' } } },
      { key: 'agendaInfo', href: { pathname: '/agenda', query: { type: 'infoSessions' } } },
      { key: 'agendaWorkshops', href: { pathname: '/agenda', query: { type: 'workshops' } } },
      { key: 'agendaEvents', href: { pathname: '/agenda', query: { type: 'events' } } },
    ],
  },
  { key: 'community', href: '/community' },
  { key: 'contact', href: '/contact' },
]
