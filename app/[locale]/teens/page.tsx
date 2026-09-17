import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, Check, Users } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { FaqHash } from "@/components/site/faq-hash"
import { FaqList } from "@/components/site/faq-list"
import { ProgramCard } from "@/components/site/program-card"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import {
  getFaqs,
  getPrograms,
  getTeensPage,
  getUpcomingEvents,
  pick,
} from "@/lib/content"
import { buildEventViews } from "@/lib/content/view"
import { buildMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const page = await getTeensPage()
  const l = locale as Locale
  return buildMetadata({
    title: pick(page.seo.title, l),
    description: pick(page.seo.description, l),
    href: "/teens",
    locale: l,
  })
}

export default async function TeensPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const now = new Date()

  const t = await getTranslations("teensPage")
  const [page, programs, faqs, upcoming] = await Promise.all([
    getTeensPage(),
    getPrograms(),
    getFaqs(),
    getUpcomingEvents(now),
  ])

  const teenPrograms = programs.filter((p) => p.track === "teens")
  const teenFaqs = faqs.filter((f) => f.category === "tieners")
  const views = await buildEventViews(upcoming, l, now)
  const nextByProgram = new Map<string, (typeof views)[number]>()
  for (const v of views) {
    if (!v.programSlug || !v.hasDate) continue
    if (!nextByProgram.has(v.programSlug)) nextByProgram.set(v.programSlug, v)
  }

  return (
    <>
      <FaqHash />
      {/* Teen hero */}
      <header className="bg-papier">
        <div className="container-site section-y">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <span
                className="type-eyebrow inline-block rounded-full px-3 py-1 text-inkt"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-4) 22%, transparent)" }}
              >
                Tiener Insight · 14–19
              </span>
              <h1 className="type-h1 mt-4 text-inkt text-balance">{pick(page.hero.title, l)}</h1>
              <p className="type-lead mt-5 max-w-xl text-inkt">{pick(page.hero.lead, l)}</p>
              <ul className="mt-6 flex flex-wrap gap-3">
                {page.hero.points.map((point) => (
                  <li
                    key={point.nl}
                    className="flex items-center gap-2 rounded-full border border-lijn bg-mist px-4 py-2 text-base text-inkt"
                  >
                    <Check className="size-4" style={{ color: "var(--accent-4)" }} aria-hidden />
                    {pick(point, l)}
                  </li>
                ))}
              </ul>
              <Link
                href={{ pathname: "/agenda", query: { type: "teens" } }}
                className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
              >
                {t("datesCta")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            {page.media?.image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-panel">
                <Image
                  src={page.media.image.src || "/placeholder.svg"}
                  alt={pick(page.media.image.alt, l)}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Teen programs */}
      {teenPrograms.length > 0 ? (
        <section className="bg-mist">
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt">{t("programsHeading")}</h2>
            <p className="type-body mt-4 max-w-2xl text-inkt">{t("programsLead")}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {teenPrograms.map((p) => {
                const v = nextByProgram.get(p.slug)
                return (
                  <ProgramCard
                    key={p._id}
                    program={p}
                    locale={l}
                    fromPrice={v?.fromPrice ?? null}
                    free={v?.free ?? false}
                    nextDate={v?.dateRange}
                  />
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* For parents */}
      <section id="ouders" className="scroll-mt-24 bg-papier">
        <div className="container-site section-y">
          <div className="max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.parents.heading, l)}</h2>
            <p className="type-lead mt-4 text-inkt">{pick(page.parents.lead, l)}</p>
          </div>

          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {page.parents.blocks.map((block) => (
              <div key={block.title.nl}>
                <dt className="text-lg font-bold text-inkt">{pick(block.title, l)}</dt>
                <dd className="mt-1.5 text-base text-leisteen">{pick(block.text, l)}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 flex items-start gap-3 rounded-panel bg-mist p-5 text-base text-inkt">
            <Users className="mt-0.5 size-5 shrink-0 text-leisteen" aria-hidden />
            {t("consentNote")}
          </p>
        </div>
      </section>

      {/* Parent FAQ */}
      {teenFaqs.length > 0 ? (
        <section className="bg-mist">
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt">{t("faqHeading")}</h2>
            <div className="mt-8 max-w-3xl">
              <FaqList faqs={teenFaqs} locale={l} />
              <Link
                href="/faq"
                className="mt-6 inline-flex items-center gap-1.5 text-lg font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
              >
                {t("faqCta")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
