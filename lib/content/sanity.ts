import { sanityFetch } from '@/sanity/lib/fetch'
import { imageUrl } from '@/sanity/lib/image'
import * as q from '@/sanity/lib/queries'
import type {
  AboutPage,
  ContactPage,
  Facilitator,
  Faq,
  HomePage,
  ImageAsset,
  InsightEvent,
  InternationalEvent,
  LegalKind,
  LegalPage,
  LocaleRichText,
  Program,
  SiteSettings,
  TeamMember,
  TeensPage,
  Testimonial,
  Venue,
  VideoClip,
} from './types'

/**
 * Sanity-backed content getters (brief §8.1). They return exactly the app
 * types from ./types, so pages don't know whether the data came from Sanity or
 * the mock seed. index.ts picks between the two based on NEXT_PUBLIC_SANITY_PROJECT_ID.
 *
 * Every read is tagged `sanity:<type>` so the revalidate webhook busts it.
 */

// --- Normalisers ------------------------------------------------------------

/** Sanity image (asset + hotspot + alt) -> {src, alt}, respecting hotspot. */
function img(value: unknown): ImageAsset | undefined {
  const v = value as { asset?: unknown; alt?: ImageAsset['alt'] } | undefined
  if (!v || !v.asset) return undefined
  return { src: imageUrl(v as never), alt: v.alt ?? { nl: '' } }
}

/** Portable Text blocks -> plain-text paragraphs (one string per block). */
function blocks(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((b) => b && (b as { _type?: string })._type === 'block')
    .map((b) =>
      ((b as { children?: { text?: string }[] }).children ?? [])
        .map((c) => c.text ?? '')
        .join(''),
    )
    .filter((s) => s.trim().length > 0)
}

function rich(value: unknown): LocaleRichText | undefined {
  const v = value as { nl?: unknown; en?: unknown } | undefined
  if (!v) return undefined
  const nl = blocks(v.nl)
  const en = v.en ? blocks(v.en) : undefined
  return { nl, ...(en && en.length ? { en } : {}) }
}

function video(value: unknown): VideoClip | undefined {
  const v = value as (VideoClip & { poster?: unknown }) | undefined
  if (!v) return undefined
  return { ...v, poster: img(v.poster) as ImageAsset }
}

// Deep-map the well-known localeRichText / image / video fields per type.
function mapProgram<T extends Record<string, any>>(p: T | null): T | null {
  if (!p) return p
  return {
    ...p,
    heroImage: img(p.heroImage),
    howItWorks: rich(p.howItWorks),
    forWhom: rich(p.forWhom),
    videoClip: video(p.videoClip),
  }
}

function mapEvent<T extends Record<string, any>>(e: T | null): T | null {
  if (!e) return e
  return {
    ...e,
    image: img(e.image),
    notes: rich(e.notes),
    emailInfo: rich(e.emailInfo),
  }
}

function mapTestimonial<T extends Record<string, any>>(t: T): T {
  return { ...t, photo: img(t.photo), videoClip: video(t.videoClip) }
}

function mapFaq<T extends Record<string, any>>(f: T): T {
  return { ...f, answer: rich(f.answer) }
}

/** Team member: bio is a plain localeText ({nl, en} strings) — leave it as-is. */
function mapTeamMember<T extends Record<string, any>>(x: T): T {
  return { ...x, photo: img(x.photo) }
}

/** Facilitator: bio is localeRichText (Portable Text) — normalise to paragraphs. */
function mapFacilitator<T extends Record<string, any>>(x: T): T {
  return { ...x, photo: img(x.photo), ...(x.bio ? { bio: rich(x.bio) } : {}) }
}

function mapVenue<T extends Record<string, any>>(v: T): T {
  return { ...v, image: img(v.image) }
}

// --- Getters ----------------------------------------------------------------

export async function getSettings(): Promise<SiteSettings | null> {
  const s = await sanityFetch<any>({ query: q.settingsQuery, tags: ['sanity:siteSettings'] })
  if (!s) return null
  return {
    ...s,
    defaultSeo: s.defaultSeo
      ? { ...s.defaultSeo, ogImage: s.defaultSeo.ogImage ? imageUrl(s.defaultSeo.ogImage) : undefined }
      : undefined,
  } as SiteSettings
}

export async function getHomePage(): Promise<HomePage | null> {
  const h = await sanityFetch<any>({ query: q.homePageQuery, tags: ['sanity:homePage'] })
  if (!h) return null
  return {
    ...h,
    hero: h.hero ? { ...h.hero, image: img(h.hero.image) } : h.hero,
    videoClip: video(h.videoClip),
    videoPoster: img(h.videoPoster),
  } as HomePage
}

export async function getAboutPage(): Promise<AboutPage | null> {
  const a = await sanityFetch<any>({ query: q.aboutPageQuery, tags: ['sanity:aboutPage'] })
  if (!a) return null
  return { ...a, videoClip: video(a.videoClip) } as AboutPage
}

export async function getTeensPage(): Promise<TeensPage | null> {
  const t = await sanityFetch<any>({ query: q.teensPageQuery, tags: ['sanity:teensPage'] })
  if (!t) return null
  return {
    ...t,
    media: t.media ? { image: img(t.media.image), videoClip: video(t.media.videoClip) } : undefined,
  } as TeensPage
}

export async function getContactPage(): Promise<ContactPage | null> {
  return (await sanityFetch<any>({ query: q.contactPageQuery, tags: ['sanity:contactPage'] })) as
    | ContactPage
    | null
}

export async function getPrograms(): Promise<Program[]> {
  const list = await sanityFetch<any[]>({ query: q.programsQuery, tags: ['sanity:program'] })
  return (list ?? []).map((p) => mapProgram(p)) as Program[]
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const p = await sanityFetch<any>({
    query: q.programBySlugQuery,
    params: { slug },
    tags: ['sanity:program'],
  })
  return mapProgram(p) as Program | null
}

export async function getUpcomingEvents(now: Date = new Date()): Promise<InsightEvent[]> {
  const list = await sanityFetch<any[]>({
    query: q.upcomingEventsQuery,
    params: { now: now.toISOString() },
    tags: ['sanity:event'],
  })
  return (list ?? []).map((e) => mapEvent(e)) as InsightEvent[]
}

export async function getEventBySlug(slug: string): Promise<InsightEvent | null> {
  const e = await sanityFetch<any>({
    query: q.eventBySlugQuery,
    params: { slug },
    tags: ['sanity:event'],
  })
  return mapEvent(e) as InsightEvent | null
}

export async function getEventsForProgram(slug: string, now: Date = new Date()): Promise<InsightEvent[]> {
  const events = await getUpcomingEvents(now)
  return events.filter((e) => e.programSlug === slug)
}

export async function getFaqs(): Promise<Faq[]> {
  const list = await sanityFetch<any[]>({ query: q.faqsQuery, tags: ['sanity:faq'] })
  return (list ?? []).map((f) => mapFaq(f)) as Faq[]
}

export async function getTeam(): Promise<TeamMember[]> {
  const list = await sanityFetch<any[]>({ query: q.teamQuery, tags: ['sanity:teamMember'] })
  return (list ?? []).map((m) => mapTeamMember(m)) as TeamMember[]
}

export async function getFacilitators(): Promise<Facilitator[]> {
  const list = await sanityFetch<any[]>({ query: q.facilitatorsQuery, tags: ['sanity:facilitator'] })
  return (list ?? []).map((f) => mapFacilitator(f)) as Facilitator[]
}

export async function getFacilitatorById(id: string): Promise<Facilitator | null> {
  const all = await getFacilitators()
  return all.find((f) => f._id === id) ?? null
}

export async function getVenues(): Promise<Venue[]> {
  const list = await sanityFetch<any[]>({ query: q.venuesQuery, tags: ['sanity:venue'] })
  return (list ?? []).map((v) => mapVenue(v)) as Venue[]
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const all = await getVenues()
  return all.find((v) => v._id === id) ?? null
}

export async function getLegalPage(kind: LegalKind): Promise<LegalPage | null> {
  const l = await sanityFetch<any>({
    query: q.legalPageQuery,
    params: { kind },
    tags: ['sanity:legalPage'],
  })
  if (!l) return null
  return { ...l, body: rich(l.body) } as LegalPage
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const list = await sanityFetch<any[]>({ query: q.testimonialsQuery, tags: ['sanity:testimonial'] })
  return (list ?? []).map((t) => mapTestimonial(t)) as Testimonial[]
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const all = await getTestimonials()
  return all.filter((t) => t.featured)
}

export async function getInternationalEvents(now: Date = new Date()): Promise<InternationalEvent[]> {
  const list = await sanityFetch<any[]>({
    query: q.internationalEventsQuery,
    params: { now: now.toISOString().slice(0, 10) },
    tags: ['sanity:internationalEvent'],
  })
  return (list ?? []) as InternationalEvent[]
}
