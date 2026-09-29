'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { mainNav } from './nav-config'

export type SeminarNavLink = { slug: string; title: string }

/** Desktop nav with an active-page indicator (underline, matching the
 *  language switcher's current-locale style) instead of only a hover state.
 *  "About" and "Agenda" open a dropdown to their sub-sections; "Seminars"
 *  opens a dropdown listing the live program list (§4, §7). */
export function MainNav({ seminarPrograms }: { seminarPrograms: SeminarNavLink[] }) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden xl:flex" aria-label={t('menu')}>
      <NavigationMenuList className="gap-1">
        {mainNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isSeminars = item.key === 'seminars'
          const hasDropdown = isSeminars || (item.children && item.children.length > 0)

          if (!hasDropdown) {
            return (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink
                  active={isActive}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        'rounded-md px-3 py-2 text-base font-semibold underline-offset-4 transition-colors hover:bg-mist hover:text-inkt',
                        isActive ? 'text-inkt underline decoration-2' : 'text-inkt/90 no-underline',
                      )}
                    />
                  }
                >
                  {t(item.key)}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={item.key}>
              <NavigationMenuTrigger
                className={cn(
                  'bg-transparent px-3 py-2 text-base font-semibold text-inkt/90 hover:bg-mist hover:text-inkt',
                  isActive && 'text-inkt underline decoration-2 underline-offset-4',
                )}
              >
                {t(item.key)}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-56 gap-0.5 p-2">
                <NavigationMenuLink
                  render={
                    <Link href={item.href} className="rounded-md px-3 py-2 text-sm font-semibold text-inkt hover:bg-mist" />
                  }
                >
                  {isSeminars ? t('seminarsAll') : t(item.key)}
                </NavigationMenuLink>
                {isSeminars
                  ? seminarPrograms.map((p) => (
                      <NavigationMenuLink
                        key={p.slug}
                        render={
                          <Link
                            href={{ pathname: '/seminars/[slug]', params: { slug: p.slug } }}
                            className="rounded-md px-3 py-2 text-sm text-inkt hover:bg-mist"
                          />
                        }
                      >
                        {p.title}
                      </NavigationMenuLink>
                    ))
                  : item.children?.map((child) => (
                      <NavigationMenuLink
                        key={child.key}
                        render={<Link href={child.href} className="rounded-md px-3 py-2 text-sm text-inkt hover:bg-mist" />}
                      >
                        {t(child.key)}
                      </NavigationMenuLink>
                    ))}
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
