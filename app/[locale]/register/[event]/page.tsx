import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { InfoSessionForm } from '@/components/register/info-session-form'
import { RegistrationForm } from '@/components/register/registration-form'
import type { RegistrationSummary } from '@/components/register/summary-panel'
import {
  getEventBySlug,
  getProgramBySlug,
  getSettings,
  getUpcomingEvents,
  getVenueById,
  pick,
} from '@/lib/content'
import type { Locale } from '@/lib/content/types'
import { formatDateRange } from '@/lib/domain/dates'
import { registrationState } from '@/lib/domain/events'
import { resolveFlow } from '@/lib/registration/flow'
import { paymentMode } from '@/lib/env'

type Props = { params: Promise<{ locale: string; event: string }> }

// The registration form itself is not useful in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } }

async function place(event: Awaited<ReturnType<typeof getEventBySlug>>, locale: Locale, online: string) {
  if (!event) return ''
  if (event.online) return online
  if (event.venueId) {
    const venue = await getVenueById(event.venueId)
    return venue?.city ?? venue?.name ?? ''
  }
  return ''
}

export default async function RegisterPage({ params }: Props) {
  const { locale, event: eventSlug } = await params
  setRequestLocale(locale)
  const loc = locale as Locale
  const t = await getTranslations('form')
  const tc = await getTranslations('common')

  const event = await getEventBySlug(eventSlug)
  if (!event) notFound()

  const settings = await getSettings()

  // Program powers prerequisites, age range and the event title fallback.
  const program = event.programSlug ? await getProgramBySlug(event.programSlug) : null
  const eventTitle = event.title ? pick(event.title, loc) : program ? pick(program.title, loc) : event.slug
  const dates = formatDateRange(event.start, event.end, loc)
  const summary: RegistrationSummary = {
    eventTitle,
    dates,
    place: await place(event, loc, tc('online')),
  }

  // Info sessions & workshops use the single-step free form (§7.3).
  const isInfo = event.type === 'infoSession' || event.type === 'workshop'
  if (isInfo) {
    return (
      <div className="container-site section-y">
        <h1 className="type-h1 text-balance">{eventTitle}</h1>
        <p className="type-lead mt-4 max-w-2xl text-leisteen">{dates}</p>
        <div className="mt-8">
          <InfoSessionForm eventSlug={event.slug} />
        </div>
      </div>
    )
  }

  const state = registrationState(event, new Date())
  if (state === 'closed') {
    return (
      <div className="container-site section-y">
        <h1 className="type-h1 text-balance">{eventTitle}</h1>
        <p className="type-lead mt-4 max-w-2xl text-leisteen">{t('errors.closed')}</p>
        <Link href={`/${locale}/agenda`} className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}>
          {tc('viewAgenda')}
        </Link>
      </div>
    )
  }

  // Prerequisite display names.
  const prerequisiteLabels: Record<string, string> = {}
  for (const slug of program?.prerequisites ?? []) {
    const p = await getProgramBySlug(slug)
    if (p) prerequisiteLabels[slug] = pick(p.title, loc)
  }

  const flow = resolveFlow({
    event,
    eventTitle,
    locale: loc,
    prerequisites: program?.prerequisites ?? [],
    prerequisiteLabels,
    ageMin: program?.ageMin,
    ageMax: program?.ageMax,
    allowBankTransfer: settings.allowBankTransfer,
  })

  // A gratis infosessie to link to from the intro ("Eerst vragen?").
  const upcoming = await getUpcomingEvents()
  const infoSession = upcoming.find((e) => e.type === 'infoSession')

  return (
    <div className="container-site section-y">
      <h1 className="type-h1 text-balance">{tc('register')}</h1>
      <p className="type-lead mt-4 max-w-2xl text-pretty text-leisteen">
        {t('intro', { event: eventTitle })}
      </p>
      {infoSession && (
        <Link
          href={`/${locale}/register/${infoSession.slug}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-5')}
        >
          {t('questionsFirst')}
        </Link>
      )}
      <div className="mt-10">
        <RegistrationForm flow={flow} summary={summary} paymentMode={paymentMode} />
      </div>
    </div>
  )
}
