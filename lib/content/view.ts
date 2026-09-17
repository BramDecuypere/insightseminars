import { formatDateRange } from '@/lib/domain/dates'
import {
  registrationState,
  type RegistrationState,
} from '@/lib/domain/events'
import { activeEarlyBird, isFree, lowestPrice } from '@/lib/domain/pricing'
import { getFacilitators, getPrograms, getVenues, pick } from '.'
import type {
  Accent,
  EventLanguage,
  EventType,
  InsightEvent,
  Locale,
  RegistrationStatus,
} from './types'

/**
 * A fully-resolved, locale-aware event ready to render as an agenda row or a
 * next-date panel (brief §9.4). All CMS lookups and domain rules are applied
 * here so the presentational components stay simple.
 */
export interface EventView {
  id: string
  slug: string
  type: EventType
  accent: Accent
  numeral: string
  programSlug?: string
  title: string
  subtitle: string
  officialName?: string
  dateRange: string
  hasDate: boolean
  venueName: string
  city: string
  online: boolean
  facilitators: string
  language: EventLanguage
  scheduleNote: string
  fromPrice: number | null
  free: boolean
  earlyBirdUntil?: string
  status: RegistrationStatus
  regState: RegistrationState
}

export interface EventViewContext {
  programs: Awaited<ReturnType<typeof getPrograms>>
  venues: Awaited<ReturnType<typeof getVenues>>
  facilitators: Awaited<ReturnType<typeof getFacilitators>>
}

export async function loadEventViewContext(): Promise<EventViewContext> {
  const [programs, venues, facilitators] = await Promise.all([
    getPrograms(),
    getVenues(),
    getFacilitators(),
  ])
  return { programs, venues, facilitators }
}

export function toEventView(
  event: InsightEvent,
  ctx: EventViewContext,
  locale: Locale,
  now: Date,
): EventView {
  const program = ctx.programs.find((p) => p.slug === event.programSlug)
  const venue = ctx.venues.find((v) => v._id === event.venueId)
  const facs = (event.facilitatorIds ?? [])
    .map((id) => ctx.facilitators.find((f) => f._id === id)?.name)
    .filter((n): n is string => Boolean(n))

  const early = activeEarlyBird(event.priceOptions, now)

  return {
    id: event._id,
    slug: event.slug,
    type: event.type,
    accent: program?.accent ?? 'accent1',
    numeral: program?.numeral ?? '',
    programSlug: event.programSlug,
    title: event.title ? pick(event.title, locale) : pick(program?.title, locale),
    subtitle: pick(program?.subtitle, locale),
    officialName: program?.officialName,
    dateRange: formatDateRange(event.start, event.end, locale),
    hasDate: Boolean(event.start),
    venueName: venue?.name ?? '',
    city: venue?.city ?? '',
    online: Boolean(event.online),
    facilitators: facs.join(locale === 'nl' ? ' en ' : ' & '),
    language: event.language,
    scheduleNote: pick(event.scheduleNote, locale),
    fromPrice: lowestPrice(event.priceOptions, now),
    free: isFree(event.priceOptions),
    earlyBirdUntil: early?.validUntil,
    status: event.registrationStatus,
    regState: registrationState(event, now),
  }
}

export async function buildEventViews(
  events: InsightEvent[],
  locale: Locale,
  now: Date = new Date(),
): Promise<EventView[]> {
  const ctx = await loadEventViewContext()
  return events.map((e) => toEventView(e, ctx, locale, now))
}
