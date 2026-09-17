/* eslint-disable no-console */
/**
 * Seed script (brief Prompt 4, §13). Run with `pnpm seed`.
 *
 * - createOrReplace with deterministic IDs (re-running is safe and idempotent).
 * - Content comes from lib/content/mock.ts.
 * - The info session is seeded as a draft (drafts.* id).
 * - "[TE BEVESTIGEN]" placeholder values are seeded as empty fields.
 * - Media (images, video, VTT captions) is NOT seeded; editors add it in Studio.
 *
 * Needs SANITY_API_WRITE_TOKEN (never set this on Vercel) plus the public
 * project id/dataset env vars.
 */
import { createClient } from 'next-sanity'

import * as mock from '../lib/content/mock'
import type {
  InsightEvent,
  LocaleRichText,
  Program,
  Testimonial,
  InternationalEvent,
} from '../lib/content/types'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID ontbreekt.')
if (!token) throw new Error('SANITY_API_WRITE_TOKEN ontbreekt (alleen lokaal instellen).')

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-10-01',
  useCdn: false,
})

const PLACEHOLDER = '[TE BEVESTIGEN]'

// --- Helpers ----------------------------------------------------------------

let keyCounter = 0
const key = () => `k${(keyCounter++).toString(36)}`
const withKeys = <T>(arr: T[]): T[] =>
  arr.map((item) =>
    item && typeof item === 'object' ? ({ _key: key(), ...(item as object) } as T) : item,
  )

function ref(id: string) {
  return { _type: 'reference', _ref: id }
}

function slug(current: string) {
  return { _type: 'slug', current }
}

/** LocaleRichText ({nl: string[]}) -> Portable Text blocks per language. */
function toBlocks(rt: LocaleRichText | undefined) {
  if (!rt) return undefined
  const paras = (arr?: string[]) =>
    (arr ?? []).map((text) => ({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text, marks: [] }],
    }))
  const out: { nl: unknown[]; en?: unknown[] } = { nl: paras(rt.nl) }
  if (rt.en?.length) out.en = paras(rt.en)
  return out
}

/** Drop any locale value equal to the "[TE BEVESTIGEN]" placeholder (§13). */
function stripPlaceholders<T>(value: T): T {
  if (typeof value === 'string') {
    return (value === PLACEHOLDER ? undefined : value) as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripPlaceholders(v)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = stripPlaceholders(v)
      if (cleaned !== undefined) out[k] = cleaned
    }
    return out as unknown as T
  }
  return value
}

// Map mock program slugs to their document ids for references.
const programIdBySlug = new Map<string, string>(mock.programs.map((p) => [p.slug, p._id]))

// --- Document builders ------------------------------------------------------

function programDoc(p: Program) {
  return stripPlaceholders({
    _id: p._id,
    _type: 'program',
    title: p.title,
    subtitle: p.subtitle,
    officialName: p.officialName,
    slug: slug(p.slug),
    track: p.track,
    order: p.order,
    numeral: p.numeral,
    accent: p.accent,
    lead: p.lead,
    outcomes: p.outcomes,
    howItWorks: toBlocks(p.howItWorks),
    forWhom: toBlocks(p.forWhom),
    durationLabel: p.durationLabel,
    hoursLabel: p.hoursLabel,
    groupSize: p.groupSize,
    expectations: p.expectations ? withKeys(p.expectations) : undefined,
    ageMin: p.ageMin,
    ageMax: p.ageMax,
    nextDateNote: p.nextDateNote,
    prerequisites: p.prerequisites
      ?.map((s) => programIdBySlug.get(s))
      .filter((id): id is string => Boolean(id))
      .map((id) => ({ _key: key(), ...ref(id) })),
    testimonials: p.testimonials?.map((id) => ({ _key: key(), ...ref(id) })),
    faqs: p.faqs?.map((id) => ({ _key: key(), ...ref(id) })),
    seo: p.seo,
  })
}

function eventDoc(e: InsightEvent) {
  const isDraft = e.type === 'infoSession'
  const programId = e.programSlug ? programIdBySlug.get(e.programSlug) : undefined
  return stripPlaceholders({
    // Info session is seeded as a draft (§13).
    _id: isDraft ? `drafts.${e._id}` : e._id,
    _type: 'event',
    type: e.type,
    program: programId ? ref(programId) : undefined,
    title: e.title,
    slug: slug(e.slug),
    start: e.start,
    end: e.end,
    scheduleNote: e.scheduleNote,
    venue: e.venueId ? ref(e.venueId) : undefined,
    online: e.online,
    // meetingUrl intentionally not seeded here.
    facilitators: e.facilitatorIds?.map((id) => ({ _key: key(), ...ref(id) })),
    language: e.language,
    priceOptions: e.priceOptions ? withKeys(e.priceOptions) : [],
    registrationStatus: e.registrationStatus,
    waitlistEnabled: e.waitlistEnabled,
    depositAmount: e.depositAmount,
    registrationDeadline: e.registrationDeadline,
    paymentTiming: e.paymentTiming,
    paymentDueDate: e.paymentDueDate,
    notes: toBlocks(e.notes),
    emailInfo: toBlocks(e.emailInfo),
  })
}

function testimonialDoc(t: Testimonial) {
  const programId = t.programSlug ? programIdBySlug.get(t.programSlug) : undefined
  return stripPlaceholders({
    _id: t._id,
    _type: 'testimonial',
    quote: t.quote,
    situation: t.situation,
    name: t.name,
    context: t.context,
    program: programId ? ref(programId) : undefined,
    audience: t.audience,
    featured: t.featured,
    consentConfirmed: t.consentConfirmed,
  })
}

function internationalDoc(e: InternationalEvent) {
  const programId = programIdBySlug.get(e.programSlug)
  return stripPlaceholders({
    _id: e._id,
    _type: 'internationalEvent',
    program: programId ? ref(programId) : undefined,
    country: e.country,
    city: e.city,
    start: e.start,
    end: e.end,
    language: e.language,
    url: e.url,
  })
}

function settingsDoc() {
  return stripPlaceholders({
    _id: 'siteSettings',
    _type: 'siteSettings',
    ...mock.settings,
    socials: withKeys(mock.settings.socials ?? []),
    internationalLinks: withKeys(mock.settings.internationalLinks ?? []),
    linksPage: withKeys(mock.settings.linksPage ?? []),
    consentText: mock.settings.consentText,
  })
}

// --- Run --------------------------------------------------------------------

async function run() {
  const docs: Record<string, unknown>[] = []

  docs.push(settingsDoc())

  for (const v of mock.venues) docs.push(stripPlaceholders({ ...v, _type: 'venue' }))
  for (const f of mock.facilitators)
    docs.push(
      stripPlaceholders({
        _id: f._id,
        _type: 'facilitator',
        name: f.name,
        slug: slug(f.slug),
        role: f.role,
        bio: toBlocks(f.bio),
        website: f.website,
      }),
    )
  for (const m of mock.team) docs.push(stripPlaceholders({ ...m, _type: 'teamMember' }))
  for (const f of mock.faqs)
    docs.push(
      stripPlaceholders({
        _id: f._id,
        _type: 'faq',
        question: f.question,
        answer: toBlocks(f.answer),
        category: f.category,
        order: f.order,
      }),
    )
  for (const p of mock.programs) docs.push(programDoc(p))
  for (const e of mock.events) docs.push(eventDoc(e))
  for (const t of mock.testimonials) docs.push(testimonialDoc(t))
  for (const e of mock.internationalEvents) docs.push(internationalDoc(e))
  for (const l of mock.legalPages)
    docs.push(
      stripPlaceholders({
        _id: `legal-${l.kind}`,
        _type: 'legalPage',
        kind: l.kind,
        title: l.title,
        body: toBlocks(l.body),
        version: l.version,
        updatedAt: l.updatedAt,
      }),
    )

  console.log(`Seeding ${docs.length} documenten naar ${projectId}/${dataset} ...`)

  let tx = client.transaction()
  for (const doc of docs) tx = tx.createOrReplace(doc as never)
  await tx.commit()

  console.log('Klaar. Media (afbeeldingen, video, ondertiteling) voeg je toe in de Studio.')
}

run().catch((err) => {
  console.error('Seed mislukt:', err)
  process.exit(1)
})
