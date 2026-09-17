'use client'

import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/**
 * Plain NL / EN text switch, no flags (brief §4). Keeps the visitor on the
 * equivalent page by re-localizing the current internal pathname and params.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav')
  const active = useLocale()
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(locale: string) {
    if (locale === active) return
    startTransition(() => {
      // @ts-expect-error -- params shape is route-specific but valid at runtime
      router.replace({ pathname, params }, { locale })
    })
  }

  return (
    <div
      className={cn('flex items-center gap-1 text-sm', className)}
      role="group"
      aria-label={t('language')}
    >
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span className="text-papier/40" aria-hidden="true">/</span>}
          <button
            type="button"
            onClick={() => switchTo(locale)}
            disabled={isPending}
            aria-current={locale === active ? 'true' : undefined}
            className={cn(
              'rounded-sm px-1 font-semibold uppercase transition-colors',
              locale === active
                ? 'text-papier underline underline-offset-4 decoration-2'
                : 'text-papier/70 hover:text-papier',
            )}
          >
            {locale}
          </button>
        </span>
      ))}
    </div>
  )
}
