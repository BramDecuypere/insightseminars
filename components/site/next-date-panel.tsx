import { CalendarDays, Languages, MapPin, Tag, UserRound } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/lib/content/types'
import { formatDate } from '@/lib/domain/dates'
import { formatEuro } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EventView } from '@/lib/content/view'
import { KeyFacts, type Fact } from './key-facts'
import { StatusBadge } from './status-badge'

/**
 * White next-date panel (brief §9.4): the soonest run of a program with its key
 * facts, status badge and register button. Shown on Home and program pages.
 */
export async function NextDatePanel({
  view,
  heading,
  locale,
}: {
  view: EventView
  heading?: string
  locale: Locale
}) {
  const t = await getTranslations('common')
  const tl = await getTranslations('languages')

  const facts: Fact[] = [
    { icon: CalendarDays, label: t('dates'), value: view.dateRange },
  ]
  if (view.online) {
    facts.push({ icon: MapPin, label: t('location'), value: t('online') })
  } else if (view.venueName) {
    facts.push({
      icon: MapPin,
      label: t('location'),
      value: view.city ? `${view.venueName}, ${view.city}` : view.venueName,
    })
  }
  if (view.facilitators) {
    facts.push({ icon: UserRound, label: t('facilitator'), value: view.facilitators })
  }
  facts.push({ icon: Languages, label: t('language'), value: tl(view.language) })
  facts.push({
    icon: Tag,
    label: t('price'),
    value: view.free
      ? t('free')
      : view.fromPrice != null
        ? t('priceFrom', { price: formatEuro(view.fromPrice, locale) })
        : '',
  })

  return (
    <div className="rounded-panel bg-papier p-6 text-inkt">
      <div className="flex items-center justify-between gap-3">
        {heading ? <h3 className="text-lg font-bold text-inkt">{heading}</h3> : null}
        <StatusBadge status={view.status} regState={view.regState} />
      </div>
      <div className="mt-4">
        <KeyFacts facts={facts} />
      </div>
      {view.earlyBirdUntil ? (
        <p className="type-small mt-4 text-leisteen">
          {t('earlyBirdUntil', { date: formatDate(view.earlyBirdUntil, locale) })}
        </p>
      ) : null}
      {view.regState !== 'closed' ? (
        <Link
          href={{ pathname: '/register/[event]', params: { event: view.slug } }}
          className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 w-full')}
        >
          {view.regState === 'waitlist'
            ? t('joinWaitlist')
            : view.type === 'infoSession'
              ? t('registerInfoSession')
              : t('register')}
        </Link>
      ) : null}
    </div>
  )
}
