'use client'

import { Globe } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Suspense } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Variant = 'compact' | 'full' | 'footer'

type SwitcherProps = {
  className?: string
  /** Use dark-on-light colors, for placement on a papier surface (e.g. the header, footer). */
  onLight?: boolean
  /** compact = "NL | EN" (header), full = "Nederlands | English" (mobile sheet), footer = full without the globe icon. */
  variant?: Variant
}

const localeLabels: Record<string, { short: string; full: string }> = {
  nl: { short: 'NL', full: 'Nederlands' },
  en: { short: 'EN', full: 'English' },
}

/**
 * Plain NL / EN text switch, no flags (brief §4). Renders real localized
 * links (works without JS, keeps the query string) instead of a JS-only
 * router.replace. useSearchParams requires a Suspense boundary, so the
 * outer component wraps this with a query-less fallback.
 */
function LanguageSwitcherLinks({
  className,
  onLight,
  variant = 'compact',
  query,
}: SwitcherProps & { query: Record<string, string> }) {
  const t = useTranslations('nav')
  const active = useLocale()
  const pathname = usePathname()
  const params = useParams()

  return (
    <div
      className={cn('flex items-center gap-2 text-sm', className)}
      role="group"
      aria-label={t('language')}
    >
      {variant !== 'footer' && (
        <Globe
          className={cn('size-4 shrink-0', onLight ? 'text-leisteen' : 'text-papier/70')}
          aria-hidden="true"
        />
      )}
      {routing.locales.map((locale, i) => {
        const isActive = locale === active
        const label = localeLabels[locale]

        return (
          <span key={locale} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className={onLight ? 'text-leisteen/50' : 'text-papier/40'}
                aria-hidden="true"
              >
                |
              </span>
            )}
            <Link
              // @ts-expect-error -- params shape is route-specific but valid at runtime
              href={{ pathname, params, query }}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-label={label.full}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex min-h-11 items-center rounded-sm px-1.5 font-semibold transition-colors',
                isActive
                  ? onLight
                    ? 'text-inkt'
                    : 'text-papier'
                  : onLight
                    ? 'text-leisteen hover:text-inkt'
                    : 'text-papier/70 hover:text-papier',
              )}
            >
              {variant === 'compact' ? label.short : label.full}
            </Link>
          </span>
        )
      })}
    </div>
  )
}

function LanguageSwitcherWithQuery(props: SwitcherProps) {
  const searchParams = useSearchParams()
  return <LanguageSwitcherLinks {...props} query={Object.fromEntries(searchParams.entries())} />
}

export function LanguageSwitcher(props: SwitcherProps) {
  return (
    <Suspense fallback={<LanguageSwitcherLinks {...props} query={{}} />}>
      <LanguageSwitcherWithQuery {...props} />
    </Suspense>
  )
}
