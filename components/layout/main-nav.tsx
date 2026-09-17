'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { mainNav } from './nav-config'

/** Desktop nav links with an active-page indicator (underline, matching the
 *  language switcher's current-locale style) instead of only a hover state. */
export function MainNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label={t('menu')}>
      {mainNav.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-2 text-base font-semibold underline-offset-4 transition-colors hover:bg-mist hover:text-inkt',
              isActive ? 'text-inkt underline decoration-2' : 'text-inkt/90 no-underline',
            )}
          >
            {t(item.key)}
          </Link>
        )
      })}
    </nav>
  )
}
