import { getTranslations } from 'next-intl/server'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/lib/content/types'
import { formatDate } from '@/lib/domain/dates'
import { formatEuro } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventView } from '@/lib/content/view'
import { accentVar } from './accent'
import { StatusBadge } from './status-badge'

/**
 * Agenda row (brief §9.4): a list item, not a card, with a 4px left marker in
 * the program colour. Details stack on their own lines; meta is never joined
 * with dots. Columns stack on mobile.
 */
export async function EventRow({
  view,
  locale,
}: {
  view: EventView
  locale: Locale
}) {
  const t = await getTranslations('common')
  const tl = await getTranslations('languages')

  const registerHref = { pathname: '/register/[event]' as const, params: { event: view.slug } }

  const buttonLabel =
    view.regState === 'waitlist'
      ? t('joinWaitlist')
      : view.type === 'infoSession'
        ? t('registerInfoSession')
        : t('register')

  return (
    <li
      className="relative overflow-hidden rounded-panel border border-lijn bg-papier"
      style={{ borderLeft: `4px solid ${accentVar[view.accent]}` }}
    >
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:gap-6">
        {/* Date block */}
        <div className="lg:w-44 lg:shrink-0">
          <p className="type-h3 font-extrabold text-inkt">{view.dateRange}</p>
          {view.scheduleNote ? (
            <p className="type-small mt-1 text-leisteen">{view.scheduleNote}</p>
          ) : null}
        </div>

        {/* Title + details */}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-inkt">
            {view.title}
            {view.subtitle ? (
              <span className="block text-base font-normal text-leisteen">
                {view.subtitle}
              </span>
            ) : null}
          </h3>
          <dl className="mt-3 space-y-1 text-base text-leisteen">
            {view.online ? (
              <div>
                <dt className="sr-only">{t('location')}</dt>
                <dd>{t('online')}</dd>
              </div>
            ) : view.venueName ? (
              <div>
                <dt className="sr-only">{t('location')}</dt>
                <dd>
                  {view.venueName}
                  {view.city ? `, ${view.city}` : ''}
                </dd>
              </div>
            ) : null}
            {view.facilitators ? (
              <div>
                <dt className="sr-only">{t('facilitator')}</dt>
                <dd>{view.facilitators}</dd>
              </div>
            ) : null}
            <div>
              <dt className="sr-only">{t('language')}</dt>
              <dd>{tl(view.language)}</dd>
            </div>
          </dl>
        </div>

        {/* Price */}
        <div className="lg:w-40 lg:shrink-0">
          {view.free ? (
            <p className="text-lg font-semibold text-inkt">{t('free')}</p>
          ) : view.fromPrice != null ? (
            <>
              <p className="text-lg font-semibold text-inkt">
                {t('priceFrom', { price: formatEuro(view.fromPrice, locale) })}
              </p>
              {view.earlyBirdUntil ? (
                <p className="type-small mt-1 text-leisteen">
                  {t('earlyBirdUntil', {
                    date: formatDate(view.earlyBirdUntil, locale),
                  })}
                </p>
              ) : null}
            </>
          ) : null}
        </div>

        {/* Status + action */}
        <div className="flex flex-col items-start gap-3 lg:w-48 lg:shrink-0 lg:items-end">
          <StatusBadge status={view.status} regState={view.regState} />
          {view.regState !== 'closed' ? (
            <Link
              href={registerHref}
              className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}
            >
              {buttonLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  )
}
