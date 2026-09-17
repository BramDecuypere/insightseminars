'use client'

import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
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

/** Mobile navigation as a sheet from the right (brief §4, §9.4). The two CTAs
 *  stay visible above the menu items. Large tap targets. */
export function MobileNav() {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          'inline-flex size-11 items-center justify-center rounded-md text-papier hover:bg-white/10 md:hidden',
        )}
        aria-label={t('menu')}
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="on-avondblauw w-4/5 max-w-sm border-l-0 bg-avondblauw text-papier"
      >
        <SheetHeader>
          <SheetTitle className="text-papier">{t('menu')}</SheetTitle>
        </SheetHeader>

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
            className={cn(buttonVariants({ variant: 'primary' }), 'w-full')}
          >
            {t('cta')}
          </Link>
        </div>

        <nav className="mt-2 flex flex-col px-2" aria-label={t('menu')}>
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-lg font-semibold text-papier hover:bg-white/10"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-4 pb-2">
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  )
}
