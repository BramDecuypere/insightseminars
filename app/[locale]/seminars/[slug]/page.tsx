import type { Metadata } from "next"
import Image from "next/image"
import { ArrowLeft, Clock, Hourglass, Users, UserRound, Tag } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { CheckList } from "@/components/site/check-list"
import { CollapsibleSection } from "@/components/site/collapsible-section"
import { EventRow } from "@/components/site/event-row"
import { FaqHash } from "@/components/site/faq-hash"
import { FaqList } from "@/components/site/faq-list"
import { JsonLd } from "@/components/site/json-ld"
import { KeyFacts, type Fact } from "@/components/site/key-facts"
import { NewsletterBand } from "@/components/site/newsletter-band"
import { PhotoGrid } from "@/components/site/photo-grid"
import { TestimonialCard } from "@/components/site/testimonial-card"
import { VideoClip } from "@/components/site/video-clip"
import { accentInk, accentVar } from "@/components/site/accent"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import {
  getEventsForProgram,
  getFacilitators,
  getFaqs,
  getPrograms,
  getProgramBySlug,
  getVenues,
  pick,
  pickRich,
} from "@/lib/content"
import { buildEventViews } from "@/lib/content/view"
import { buildMetadata, eventJsonLd, videoJsonLd } from "@/lib/seo"
import type { Faq, Locale } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const programs = await getPrograms()
  return routing.locales.flatMap((locale) =>
    programs.map((p) => ({ locale, slug: p.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) return {}
  const l = locale as Locale
  return buildMetadata({
    title: pick(program.seo?.title ?? program.title, l),
    description: pick(program.seo?.description ?? program.lead, l),
    href: { pathname: "/seminars/[slug]", params: { slug } },
    locale: l,
    image: program.heroImage?.src,
  })
}

export default async function ProgramPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const now = new Date()

  const program = await getProgramBySlug(slug)
  if (!program) notFound()

  const t = await getTranslations("programPage")
  const [events, programsAll, allFaqs, venues, facilitators] = await Promise.all([
    getEventsForProgram(slug, now),
    getPrograms(),
    getFaqs(),
    getVenues(),
    getFacilitators(),
  ])
  const views = await buildEventViews(events, l, now)

  // FAQ subset (§9.5 program page): teen programs surface the teen questions,
  // adult programs the practical ones.
  const faqCategory = program.track === "teens" ? "tieners" : "praktisch"
  const faqSubset: Faq[] = allFaqs.filter((f) => f.category === faqCategory).slice(0, 5)

  // Event JSON-LD (§10): one Event per upcoming date for this program.
  const eventsJsonLd = events.map((event) =>
    eventJsonLd({
      event,
      program,
      venue: event.venueId ? (venues.find((v) => v._id === event.venueId) ?? null) : null,
      facilitators: (event.facilitatorIds ?? [])
        .map((id) => facilitators.find((f) => f._id === id))
        .filter((f): f is (typeof facilitators)[number] => Boolean(f)),
      locale: l,
    }),
  )

  const how = pickRich(program.howItWorks, l)
  const forWhom = pickRich(program.forWhom, l)
  const accentOnLight = accentInk[program.accent]
  const accentTint = `color-mix(in srgb, ${accentVar[program.accent]} 8%, var(--papier))`

  const tc = await getTranslations("common")
  const facts: Fact[] = []
  const durationVal = pick(program.durationLabel, l)
  const hoursVal = pick(program.hoursLabel, l)
  const groupVal = pick(program.groupSize, l)
  if (durationVal) facts.push({ icon: Clock, label: tc("duration"), value: durationVal })
  if (hoursVal) facts.push({ icon: Hourglass, label: tc("schedule"), value: hoursVal })
  if (groupVal) facts.push({ icon: Users, label: tc("groupSize"), value: groupVal })
  if (program.ageMin != null && program.ageMax != null)
    facts.push({
      icon: UserRound,
      label: tc("age"),
      value: tc("ageRange", { min: program.ageMin, max: program.ageMax }),
    })
  if (program.prerequisites && program.prerequisites.length > 0) {
    const names = program.prerequisites
      .map((s) => {
        const prog = programsAll.find((p) => p.slug === s)
        return prog ? pick(prog.title, l) : s
      })
      .join(l === "nl" ? " en " : " & ")
    facts.push({ icon: Tag, label: tc("prerequisite"), value: names })
  }

  return (
    <>
      {eventsJsonLd.length > 0 ? <JsonLd data={eventsJsonLd} /> : null}
      {program.videoClip ? <JsonLd data={videoJsonLd(program.videoClip, l)} /> : null}
      {faqSubset.length > 0 ? <FaqHash /> : null}

      <header
        className={cn("relative isolate overflow-hidden", program.heroImage ? "on-avondblauw" : "text-inkt")}
        style={program.heroImage ? undefined : { backgroundColor: accentTint }}
      >
        {program.heroImage ? (
          <>
            <Image
              src={program.heroImage.src || "/placeholder.svg"}
              alt={pick(program.heroImage.alt, l)}
              fill
              priority
              sizes="100vw"
              className="absolute inset-0 -z-10 object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background: `linear-gradient(to top, color-mix(in srgb, ${accentVar[program.accent]} 90%, transparent) 0%, color-mix(in srgb, ${accentVar[program.accent]} 60%, transparent) 50%, color-mix(in srgb, ${accentVar[program.accent]} 25%, transparent) 100%)`,
              }}
            />
          </>
        ) : null}

        <div className="container-site section-y">
          <Link
            href="/seminars"
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold",
              program.heroImage ? "text-papier/80 hover:text-papier" : "text-leisteen hover:text-inkt",
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("backToSeminars")}
          </Link>

          <div className="mt-8 max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="font-display text-4xl font-bold leading-none"
                style={{ color: program.heroImage ? "var(--papier)" : accentOnLight }}
              >
                {program.numeral}
              </span>
              <span className={cn("type-eyebrow", program.heroImage ? "text-papier/80" : "text-leisteen")}>
                {pick(program.subtitle, l)}
              </span>
            </div>
            <h1 className={cn("type-h1 mt-4 text-balance", program.heroImage ? "text-papier" : "text-inkt")}>
              {pick(program.title, l)}
            </h1>
            {program.officialName ? (
              <p className={cn("mt-2 text-lg italic", program.heroImage ? "text-papier/80" : "text-leisteen")}>
                {program.officialName}
              </p>
            ) : null}
            <p className={cn("type-lead mt-5 max-w-xl", program.heroImage ? "text-papier/90" : "text-leisteen")}>
              {pick(program.lead, l)}
            </p>
          </div>
        </div>
      </header>

      <div className="bg-papier">
        <div className="container-site section-y">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Main column */}
            <div className="space-y-12">
              {how.length > 0 ? (
                <section>
                  <h2 className="type-h2 text-inkt">{t("howHeading")}</h2>
                  <div className="mt-5 space-y-4">
                    {how.map((p, i) => (
                      <p key={i} className="type-body text-inkt">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}

              {program.videoClip ? (
                <VideoClip clip={program.videoClip} locale={l} playLabel={pick({ nl: "Bekijk de video", en: "Watch the video" }, l)} />
              ) : null}

              {program.outcomes.length > 0 ? (
                <section className="rounded-panel p-6 sm:p-8" style={{ backgroundColor: accentTint }}>
                  <h2 className="type-h2 text-inkt">{t("outcomesHeading")}</h2>
                  <div className="mt-5">
                    <CheckList items={program.outcomes.map((o) => pick(o, l))} accent={program.accent} />
                  </div>
                </section>
              ) : null}

              {forWhom.length > 0 ? (
                <section>
                  <h2 className="type-h2 text-inkt">{t("forWhomHeading")}</h2>
                  <div className="mt-5 space-y-4">
                    {forWhom.map((p, i) => (
                      <p key={i} className="type-body text-inkt">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}

              {program.expectations && program.expectations.length > 0 ? (
                <CollapsibleSection label={t("expectationsHeading")}>
                  <ul className="space-y-5">
                    {program.expectations.map((e) => (
                      <li key={e.title.nl}>
                        <h3 className="text-lg font-bold text-inkt">{pick(e.title, l)}</h3>
                        <p className="mt-1.5 text-base text-leisteen">{pick(e.text, l)}</p>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              ) : null}
            </div>

            {/* Sidebar: key facts */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-panel border border-lijn bg-papier p-6">
                <h2 className="type-h3 text-inkt">{t("practicalHeading")}</h2>
                <div className="mt-4">
                  <KeyFacts facts={facts} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Sfeerbeelden */}
      {program.gallery && program.gallery.length > 0 ? (
        <section className="bg-mist">
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">
              {pick({ nl: 'Een sfeerbeeld', en: 'A glimpse of the room' }, l)}
            </h2>
            <div className="mt-8">
              <PhotoGrid
                images={program.gallery}
                locale={l}
                openLabel={tc('openImage')}
                prevLabel={tc('prevImage')}
                nextLabel={tc('nextImage')}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Getuigenissen */}
      {program.testimonials && program.testimonials.length > 0 ? (
        <section className="bg-papier">
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">{t("testimonialsHeading")}</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {program.testimonials.map((tst) => (
                <li key={tst._id}>
                  <TestimonialCard
                    testimonial={tst}
                    locale={l}
                    playLabel={tc("playVideo", { duration: "1 min" })}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Dates */}
      <section className="bg-papier">
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt">{t("datesHeading")}</h2>
          {views.length > 0 ? (
            <ul className="mt-8 space-y-4">
              {views.map((view) => (
                <EventRow key={view.id} view={view} locale={l} />
              ))}
            </ul>
          ) : (
            <p className="type-body mt-6 max-w-xl text-leisteen">{t("noDates")}</p>
          )}
        </div>
      </section>

      {faqSubset.length > 0 ? (
        <section className="bg-papier">
          <div className="container-site section-y">
            <div className="mx-auto max-w-3xl">
              <h2 className="type-h2 text-inkt">{t("faqHeading")}</h2>
              <div className="mt-6">
                <FaqList faqs={faqSubset} locale={l} />
              </div>
              <p className="mt-8 text-lg text-inkt">
                {t("contactPrompt")}{" "}
                <Link
                  href="/contact"
                  className="font-semibold underline underline-offset-4 hover:decoration-2"
                >
                  {t("contactCta")}
                </Link>
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <NewsletterBand />
    </>
  )
}
