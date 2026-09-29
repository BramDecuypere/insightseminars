'use client'

import { ChevronDown, Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'
import { mainNav } from './nav-config'
import type { SeminarNavLink } from './main-nav'

/** Mobile navigation as a sheet from the right (brief §4, §9.4). The two CTAs
 *  stay visible above the menu items. "About", "Seminars" and "Agenda"
 *  expand into their sub-links via native <details>, keeping large tap
 *  targets and no extra JS for the disclosure. */
export function MobileNav({ seminarPrograms }: { seminarPrograms: SeminarNavLink[] }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          'inline-flex size-11 items-center justify-center rounded-md text-inkt hover:bg-mist md:hidden',
        )}
        aria-label={t('menu')}
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="on-avondblauw w-4/5 max-w-sm overflow-y-auto border-l-0 bg-avondblauw text-papier"
      >
        <SheetHeader>
          <SheetTitle className="text-papier">{t('menu')}</SheetTitle>
        </SheetHeader>

        <div className="px-4">
          <LanguageSwitcher variant="full" />
        </div>

        <div className="flex flex-col gap-3 px-4">
          <Link
            href={{ pathname: '/agenda', query: { type: 'infoSessions' } }}
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'onDark' }), 'w-full')}
          >
            {t('infoSession')}
          </Link>
          <Link
            href={{ pathname: '/agenda', query: { type: 'seminars' } }}
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'onDarkPrimary' }), 'w-full')}
          >
            {t('cta')}
          </Link>
        </div>

        <nav className="mt-2 flex flex-col px-2" aria-label={t('menu')}>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const isSeminars = item.key === 'seminars'
            const hasChildren = isSeminars || (item.children && item.children.length > 0)

            if (!hasChildren) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-2 py-3 text-lg font-semibold text-papier hover:bg-white/10',
                    isActive && 'bg-white/10 underline underline-offset-4 decoration-2',
                  )}
                >
                  {t(item.key)}
                </Link>
              )
            }

            return (
              <details key={item.key} className="group" open={isActive}>
                <summary
                  className={cn(
                    'flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-3 text-lg font-semibold text-papier hover:bg-white/10',
                    isActive && 'bg-white/10',
                  )}
                >
                  {t(item.key)}
                  <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="flex flex-col pb-1 pl-4">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-base font-semibold text-papier/90 hover:bg-white/10"
                  >
                    {isSeminars ? t('seminarsAll') : t(item.key)}
                  </Link>
                  {isSeminars
                    ? seminarPrograms.map((program) => (
                        <Link
                          key={program.slug}
                          href={{ pathname: '/seminars/[slug]', params: { slug: program.slug } }}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-2 py-2 text-base text-papier/80 hover:bg-white/10"
                        >
                          {program.title}
                        </Link>
                      ))
                    : item.children?.map((child) => (
                        <Link
                          key={child.key}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-2 py-2 text-base text-papier/80 hover:bg-white/10"
                        >
                          {t(child.key)}
                        </Link>
                      ))}
                </div>
              </details>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
