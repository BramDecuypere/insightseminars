import { hasSanity } from '@/sanity/env'
import { sortByStart } from '@/lib/domain/events'
import * as mock from './mock'
import * as sanity from './sanity'
import type {
  Locale,
  LocaleRichText,
  LocaleString,
  LegalKind,
} from './types'

/**
 * Content getters (brief Prompt 1 §5, §8.1). Pages may only read content
 * through these. They serve Sanity when NEXT_PUBLIC_SANITY_PROJECT_ID is set
 * and fall back to the mock seed otherwise, so the v0 preview works before
 * Sanity is connected. Signatures never change, so pages don't care which.
 *
 * Singletons fall back to the mock when Sanity has nothing yet (fresh project),
 * which keeps pages rendering during the initial content migration.
 */

/** Resolve a localized field, always falling back to Dutch (§5.1). */
export function pick(field: LocaleString | undefined, locale: Locale): string {
  if (!field) return ''
  return (locale === 'en' ? field.en : field.nl) || field.nl || ''
}

/** Resolve localized rich text (paragraph array) with Dutch fallback. */
export function pickRich(field: LocaleRichText | undefined, locale: Locale): string[] {
  if (!field) return []
  return (locale === 'en' ? field.en : field.nl) || field.nl || []
}

export async function getSettings() {
  if (hasSanity) return (await sanity.getSettings()) ?? mock.settings
  return mock.settings
}

export async function getHomePage() {
  if (hasSanity) {
    const page = await sanity.getHomePage()
    if (!page) return mock.homePage
    return { ...page, seo: page.seo ?? mock.homePage.seo }
  }
  return mock.homePage
}

export async function getAboutPage() {
  if (hasSanity) return (await sanity.getAboutPage()) ?? mock.aboutPage
  return mock.aboutPage
}

export async function getTeensPage() {
  if (hasSanity) return (await sanity.getTeensPage()) ?? mock.teensPage
  return mock.teensPage
}

export async function getContactPage() {
  if (hasSanity) return (await sanity.getContactPage()) ?? mock.contactPage
  return mock.contactPage
}

export async function getPrograms() {
  if (hasSanity) return sanity.getPrograms()
  return [...mock.programs].sort((a, b) => {
    if (a.track !== b.track) return a.track === 'adults' ? -1 : 1
    return a.order - b.order
  })
}

export async function getProgramBySlug(slug: string) {
  if (hasSanity) return sanity.getProgramBySlug(slug)
  return mock.programs.find((p) => p.slug === slug) ?? null
}

/** Visible (future/ongoing) events, sorted by start (§6.1). */
export async function getUpcomingEvents(now: Date = new Date()) {
  if (hasSanity) return sanity.getUpcomingEvents(now)
  const visible = mock.events.filter((e) => new Date(e.end).getTime() >= now.getTime())
  return sortByStart(visible)
}

export async function getEventBySlug(slug: string) {
  if (hasSanity) return sanity.getEventBySlug(slug)
  return mock.events.find((e) => e.slug === slug) ?? null
}

/** Upcoming events for a single program, sorted by start. */
export async function getEventsForProgram(slug: string, now: Date = new Date()) {
  const events = await getUpcomingEvents(now)
  return events.filter((e) => e.programSlug === slug)
}

export async function getFaqs() {
  if (hasSanity) return sanity.getFaqs()
  return [...mock.faqs].sort((a, b) => a.order - b.order)
}

export async function getTeam() {
  if (hasSanity) return sanity.getTeam()
  return [...mock.team].sort((a, b) => a.order - b.order)
}

export async function getFacilitators() {
  if (hasSanity) return sanity.getFacilitators()
  return mock.facilitators
}

export async function getLegalPage(kind: LegalKind) {
  if (hasSanity) return (await sanity.getLegalPage(kind)) ?? mock.legalPages.find((l) => l.kind === kind) ?? null
  return mock.legalPages.find((l) => l.kind === kind) ?? null
}

export async function getTestimonials() {
  if (hasSanity) return sanity.getTestimonials()
  return mock.testimonials.filter((t) => t.consentConfirmed)
}

export async function getFeaturedTestimonials() {
  if (hasSanity) return sanity.getFeaturedTestimonials()
  return mock.testimonials.filter((t) => t.consentConfirmed && t.featured)
}

/** Visible international events, sorted by start (past ones drop off, §5.2). */
export async function getInternationalEvents(now: Date = new Date()) {
  if (hasSanity) return sanity.getInternationalEvents(now)
  const visible = mock.internationalEvents.filter(
    (e) => new Date(e.end).getTime() >= now.getTime(),
  )
  return sortByStart(visible)
}

export async function getVenues() {
  if (hasSanity) return sanity.getVenues()
  return mock.venues
}

export async function getVenueById(id: string) {
  if (hasSanity) return sanity.getVenueById(id)
  return mock.venues.find((v) => v._id === id) ?? null
}

export async function getFacilitatorById(id: string) {
  if (hasSanity) return sanity.getFacilitatorById(id)
  return mock.facilitators.find((f) => f._id === id) ?? null
}
