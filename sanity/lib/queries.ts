import { defineQuery } from 'next-sanity'

/**
 * GROQ queries (brief §8.1). Written with defineQuery so Sanity TypeGen can
 * generate types. Localized fields are projected as {nl, en} objects because
 * the app renders both languages (the "vertaald uit het Nederlands" notice,
 * the lang="en" official name); the app's pick() helper does the Dutch
 * fallback that coalesce(field[$locale], field.nl) would do in a query.
 *
 * meetingUrl is PRIVATE (§5.2) and never appears in any projection here — it
 * is read only by the confirmation-email server action.
 */

// A short clip: file/caption assets resolved to URLs; poster stays an image.
const VIDEO = /* groq */ `{
  source,
  "file": file.asset->url,
  youtubeUrl,
  poster,
  "captions": { "nl": captionsNl.asset->url, "en": captionsEn.asset->url },
  title,
  speaker,
  consentConfirmed
}`

const PROGRAM = /* groq */ `{
  _id, title, subtitle, officialName, "slug": slug.current, track, order, numeral, accent,
  lead, outcomes, howItWorks, forWhom, durationLabel, hoursLabel, groupSize,
  expectations[]{ title, text },
  ageMin, ageMax, nextDateNote, heroImage,
  videoClip ${VIDEO},
  "prerequisites": prerequisites[]->slug.current,
  "testimonials": testimonials[]->_id,
  "faqs": faqs[]->_id,
  seo
}`

// No meetingUrl (§5.2).
const EVENT = /* groq */ `{
  _id, type, "programSlug": program->slug.current, title, "slug": slug.current,
  start, end, scheduleNote, "venueId": venue->_id, online,
  "facilitatorIds": facilitators[]->_id, language,
  priceOptions[]{ kind, label, amount, "validUntil": validUntil, requiresGraduate },
  registrationStatus, waitlistEnabled, depositAmount,
  registrationDeadline, paymentTiming, paymentDueDate,
  image, notes, emailInfo
}`

const TESTIMONIAL = /* groq */ `{
  _id, quote, situation, name, context, photo,
  videoClip ${VIDEO},
  "programSlug": program->slug.current, audience, featured, consentConfirmed
}`

const FACILITATOR = /* groq */ `{ _id, name, "slug": slug.current, role, bio, photo, website }`
const TEAM = /* groq */ `{ _id, name, role, bio, photo, order }`
const VENUE = /* groq */ `{ _id, name, street, postalCode, city, country, mapsUrl, accessibility, image }`
const FAQ = /* groq */ `{ _id, question, answer, category, order }`
const INTERNATIONAL = /* groq */ `{ _id, "programSlug": program->slug.current, country, city, start, end, language, url }`

const SITUATIONS = /* groq */ `situations[]{
  label, target,
  "programSlug": program->slug.current,
  "testimonialId": testimonial->_id
}`

// --- Documents & singletons -------------------------------------------------

export const settingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  orgName, legalName, legalForm, registeredOffice, enterpriseNumber, rprCourt,
  email, phone, iban, bic, accountHolder, allowBankTransfer, invoiceEmail, transferDueDays,
  consentText, consentVersion,
  socials, internationalLinks, internationalCalendarUrl,
  linksPage[]{ label, url, highlight },
  announcement{ active, text, link },
  defaultSeo{ title, description, ogImage }
}`)

export const homePageQuery = defineQuery(`*[_type == "homePage"][0]{
  hero{ title, lead, primaryCta, secondaryCta, image },
  recognise{ intro, ${SITUATIONS}, fallback },
  whatIsInsight{ heading, body },
  howItWorks{ heading, points[]{ title, text } },
  benefits{ heading, items },
  forWho{ heading, body, trustLine },
  path{ heading, intro, nextInsight1Heading, infoSessionLine, teenLine },
  upcomingHeading,
  testimonialsHeading,
  "testimonialIds": testimonials[]->_id,
  videoClip ${VIDEO},
  videoPoster,
  seo
}`)

export const aboutPageQuery = defineQuery(`*[_type == "aboutPage"][0]{
  hero{ title, lead },
  sections[]{ heading, short, more },
  benefits{ heading, items },
  forWho{ heading, body },
  story{ heading, paragraphs },
  teamIntro, facilitatorsIntro,
  support{ heading, body },
  closing{ heading },
  videoClip ${VIDEO},
  seo
}`)

export const teensPageQuery = defineQuery(`*[_type == "teensPage"][0]{
  hero{ title, lead, points },
  media{ image, videoClip ${VIDEO} },
  parents{ heading, lead, blocks[]{ title, text } },
  seo
}`)

export const contactPageQuery = defineQuery(`*[_type == "contactPage"][0]{
  hero{ title, lead },
  sections{ direct, venue, follow },
  seo
}`)

export const programsQuery = defineQuery(
  `*[_type == "program"] | order(track asc, order asc) ${PROGRAM}`,
)
export const programBySlugQuery = defineQuery(
  `*[_type == "program" && slug.current == $slug][0] ${PROGRAM}`,
)

export const upcomingEventsQuery = defineQuery(
  `*[_type == "event" && end >= $now] | order(start asc) ${EVENT}`,
)
export const eventBySlugQuery = defineQuery(
  `*[_type == "event" && slug.current == $slug][0] ${EVENT}`,
)

export const faqsQuery = defineQuery(`*[_type == "faq"] | order(order asc) ${FAQ}`)
export const teamQuery = defineQuery(`*[_type == "teamMember"] | order(order asc) ${TEAM}`)
export const facilitatorsQuery = defineQuery(`*[_type == "facilitator"] | order(name asc) ${FACILITATOR}`)
export const venuesQuery = defineQuery(`*[_type == "venue"] | order(name asc) ${VENUE}`)
export const testimonialsQuery = defineQuery(
  `*[_type == "testimonial" && consentConfirmed == true] ${TESTIMONIAL}`,
)
export const internationalEventsQuery = defineQuery(
  `*[_type == "internationalEvent" && end >= $now] | order(start asc) ${INTERNATIONAL}`,
)
export const legalPageQuery = defineQuery(
  `*[_type == "legalPage" && kind == $kind][0]{ kind, title, body, version, updatedAt }`,
)
