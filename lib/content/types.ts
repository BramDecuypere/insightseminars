/**
 * Content model (brief §5.2). One document holds both languages side by side.
 * These are the shapes the app renders; Prompt 4 maps them onto Sanity and
 * generates matching GROQ/TypeGen types. Personal data never appears here.
 */

export type Locale = 'nl' | 'en'

/** Field-level translation wrappers (§5.1). Dutch is required, English optional. */
export interface LocaleString {
  nl: string
  en?: string
}
export type LocaleText = LocaleString
/** Simplified rich text: an array of paragraphs per language (Sanity uses Portable Text). */
export interface LocaleRichText {
  nl: string[]
  en?: string[]
}

export interface ImageAsset {
  src: string
  alt: LocaleString
}

export type Accent = 'accent1' | 'accent2' | 'accent3' | 'accent4'
export type Track = 'adults' | 'teens'

export interface VideoClip {
  source: 'upload' | 'youtube'
  file?: string
  youtubeUrl?: string
  poster: ImageAsset
  captions?: { nl?: string; en?: string }
  title: LocaleString
  speaker?: string
  consentConfirmed: boolean
}

export type PriceKind = 'regular' | 'earlyBird' | 'audit' | 'option'

export interface PriceOption {
  kind: PriceKind
  label: LocaleString
  /** Euros with up to 2 decimals, >= 0. Converted to integer cents in code. */
  amount: number
  /** ISO date (YYYY-MM-DD). Required for earlyBird; valid through end of that day, Brussels. */
  validUntil?: string
  requiresGraduate?: boolean
}

export interface Program {
  _id: string
  title: LocaleString
  subtitle: LocaleString
  /** Official international name, English, never translated (§5.2). */
  officialName?: string
  slug: string
  track: Track
  order: number
  numeral: string
  accent: Accent
  lead: LocaleText
  /** Two-line summary shown in the "Het pad" block on Home (§13.2/§13.3). */
  pathText?: LocaleText
  outcomes: LocaleString[]
  howItWorks: LocaleRichText
  forWhom: LocaleRichText
  durationLabel?: LocaleString
  hoursLabel?: LocaleString
  groupSize?: LocaleString
  expectations?: { title: LocaleString; text: LocaleText }[]
  testimonials?: string[]
  videoClip?: VideoClip
  ageMin?: number
  ageMax?: number
  /** Program slugs the registration form asks about (§6.4). */
  prerequisites?: string[]
  nextDateNote?: LocaleString
  heroImage?: ImageAsset
  faqs?: string[]
  seo?: { title: LocaleString; description: LocaleString }
}

export type EventType = 'seminar' | 'teenSeminar' | 'infoSession' | 'workshop'
export type EventLanguage = 'nl' | 'en' | 'en-nl' | 'nl-en'
export type RegistrationStatus = 'open' | 'almostFull' | 'full' | 'closed'
export type PaymentTiming = 'immediate' | 'later'

export interface InsightEvent {
  _id: string
  type: EventType
  programSlug?: string
  title?: LocaleString
  slug: string
  /** ISO datetime with Brussels offset. */
  start: string
  end: string
  scheduleNote?: LocaleString
  venueId?: string
  online?: boolean
  /** Private (§5.2): never exposed in page queries. Omitted from mock public data. */
  meetingUrl?: string
  facilitatorIds?: string[]
  language: EventLanguage
  priceOptions: PriceOption[]
  registrationStatus: RegistrationStatus
  waitlistEnabled?: boolean
  depositAmount?: number
  registrationDeadline?: string
  paymentTiming: PaymentTiming
  paymentDueDate?: string
  image?: ImageAsset
  notes?: LocaleRichText
  emailInfo?: LocaleRichText
}

export interface Facilitator {
  _id: string
  name: string
  slug: string
  role: LocaleString
  bio?: LocaleRichText
  photo?: ImageAsset
  website?: string
}

export interface TeamMember {
  _id: string
  name: string
  role: LocaleString
  bio?: LocaleText
  photo?: ImageAsset
  order: number
}

export interface Venue {
  _id: string
  name: string
  street?: string
  postalCode?: string
  city?: string
  country?: string
  mapsUrl?: string
  accessibility?: LocaleText
  image?: ImageAsset
}

export type FaqCategory = 'algemeen' | 'praktisch' | 'betalen' | 'tieners'

export interface Faq {
  _id: string
  question: LocaleString
  answer: LocaleRichText
  category: FaqCategory
  order: number
}

export type TestimonialAudience = 'adults' | 'teens' | 'parents'

export interface Testimonial {
  _id: string
  quote: LocaleText
  situation: LocaleString
  name: string
  context: LocaleString
  photo?: ImageAsset
  videoClip?: VideoClip
  programSlug?: string
  audience: TestimonialAudience
  featured: boolean
  consentConfirmed: boolean
}

export interface InternationalEvent {
  _id: string
  programSlug: string
  country: string
  city: string
  start: string
  end: string
  language: string
  url: string
}

export interface Social {
  platform: string
  url: string
}
export interface LinkItem {
  label: LocaleString
  url: string
  highlight?: boolean
}

export interface SiteSettings {
  orgName: string
  legalName?: string
  legalForm?: string
  registeredOffice?: string
  enterpriseNumber?: string
  rprCourt?: string
  email: string
  phone?: string
  iban?: string
  bic?: string
  accountHolder?: string
  allowBankTransfer: boolean
  invoiceEmail?: string
  transferDueDays: number
  consentText?: LocaleText
  consentVersion?: string
  socials: Social[]
  internationalLinks: { label: string; url?: string }[]
  internationalCalendarUrl?: string
  linksPage: LinkItem[]
  announcement?: { active: boolean; text: LocaleString; link?: string }
  defaultSeo?: { title?: LocaleString; description?: LocaleString; ogImage?: string }
}

export interface ReadMoreBlock {
  heading: LocaleString
  short: LocaleText
  more?: LocaleText
}

export interface HomePage {
  hero: {
    title: LocaleString
    lead: LocaleText
    primaryCta: LocaleString
    secondaryCta: LocaleString
    image?: ImageAsset
  }
  recognise: {
    intro: LocaleText
    situations: {
      label: LocaleString
      testimonialId?: string
      target: 'infoSession' | 'program' | 'about' | 'teens'
      programSlug?: string
    }[]
    fallback: LocaleText
  }
  whatIsInsight: { heading: LocaleString; body: LocaleText }
  howItWorks: { heading: LocaleString; points: { title: LocaleString; text: LocaleText }[] }
  benefits: { heading: LocaleString; items: LocaleString[] }
  testimonialsHeading: LocaleString
  testimonialIds: string[]
  videoClip?: VideoClip
  /** Still shown in the "Wat is Insight?" slot when no clip is uploaded yet. */
  videoPoster?: ImageAsset
  forWho: { heading: LocaleString; body: LocaleText; trustLine: LocaleString }
  path: {
    heading: LocaleString
    intro: LocaleText
    nextInsight1Heading: LocaleString
    infoSessionLine: LocaleString
    teenLine: LocaleString
  }
  upcomingHeading: LocaleString
  seo: { title: LocaleString; description: LocaleString }
}

export interface AboutPage {
  hero: { title: LocaleString; lead: LocaleText }
  sections: ReadMoreBlock[]
  benefits: { heading: LocaleString; items: LocaleString[] }
  forWho: { heading: LocaleString; body: LocaleText }
  story: { heading: LocaleString; paragraphs: LocaleText[] }
  teamIntro: LocaleText
  facilitatorsIntro: LocaleText
  support: { heading: LocaleString; body: LocaleText }
  closing: { heading: LocaleString }
  videoClip?: VideoClip
  seo: { title: LocaleString; description: LocaleString }
}

export interface TeensPage {
  hero: { title: LocaleString; lead: LocaleText; points: LocaleString[] }
  media?: { image?: ImageAsset; videoClip?: VideoClip }
  parents: {
    heading: LocaleString
    lead: LocaleText
    blocks: { title: LocaleString; text: LocaleText }[]
  }
  seo: { title: LocaleString; description: LocaleString }
}

export interface ContactPage {
  hero: { title: LocaleString; lead: LocaleText }
  sections: { direct: LocaleString; venue: LocaleString; follow: LocaleString }
  seo: { title: LocaleString; description: LocaleString }
}

export type LegalKind = 'privacy' | 'terms' | 'safeguarding'

export interface LegalPage {
  kind: LegalKind
  title: LocaleString
  body: LocaleRichText
  version?: string
  updatedAt?: string
}
