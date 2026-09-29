import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, Users } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { CollapsibleSection } from "@/components/site/collapsible-section"
import { FaqHash } from "@/components/site/faq-hash"
import { FeatureBoxes } from "@/components/site/check-list"
import { FaqList } from "@/components/site/faq-list"
import { PhotoGrid } from "@/components/site/photo-grid"
import { ProgramCard } from "@/components/site/program-card"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import {
  getAboutPage,
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
  const tc = await getTranslations("common")
  const ta = await getTranslations("aboutPage")
  const [page, aboutPage, programs, faqs, upcoming] = await Promise.all([
    getTeensPage(),
    getAboutPage(),
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

  const showPrograms = teenPrograms.length > 0
  const showGallery = Boolean(page.gallery && page.gallery.length > 0)
  const showFaq = teenFaqs.length > 0
  const renderedSections = [
    "hero",
    showPrograms && "programs",
    showGallery && "gallery",
    "parents",
    showFaq && "faq",
  ].filter(Boolean)
  const tone = (key: string) =>
    renderedSections.indexOf(key) % 2 === 0 ? "bg-papier" : "bg-mist"
  const parentsInset = tone("parents") === "bg-mist" ? "bg-papier" : "bg-mist"

  return (
    <>
      <FaqHash />
      {/* Teen hero */}
      <header className={tone("hero")}>
        <div className="container-site section-y">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <span
                className="type-eyebrow inline-block rounded-full px-3 py-1"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-4) 22%, transparent)",
                  color: "var(--accent-4-ink)",
                }}
              >
                Tiener Insight · 14–19
              </span>
              <h1 className="type-h1 mt-4 text-inkt text-balance">{pick(page.hero.title, l)}</h1>
              <p className="type-lead mt-5 max-w-xl text-inkt">{pick(page.hero.lead, l)}</p>
              <div className="mt-6">
                <FeatureBoxes items={page.hero.points.map((point) => pick(point, l))} accent="accent4" />
              </div>
              <Link
                href={{ pathname: "/agenda", query: { type: "teens" } }}
                className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
              >
                {t("datesCta")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            {page.media?.image ? (
              <div
                className="rounded-panel p-3"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-4) 14%, var(--papier))" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-panel)-0.75rem)]">
                  <Image
                    src={page.media.image.src || "/placeholder.svg"}
                    alt={pick(page.media.image.alt, l)}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Teen programs */}
      {showPrograms ? (
        <section className={tone("programs")}>
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
                    status={v ? { status: v.status, regState: v.regState } : undefined}
                  />
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Sfeerbeelden */}
      {showGallery && page.gallery ? (
        <section className={tone("gallery")}>
          <div className="container-site section-y">
            <h2 className="type-h2 text-inkt text-balance">
              {pick({ nl: 'Een sfeerbeeld', en: 'A glimpse of the room' }, l)}
            </h2>
            <div className="mt-8">
              <PhotoGrid
                images={page.gallery}
                locale={l}
                openLabel={tc('openImage')}
                prevLabel={tc('prevImage')}
                nextLabel={tc('nextImage')}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* For parents */}
      <section id="ouders" className={cn("scroll-mt-24", tone("parents"))}>
        <div className="container-site section-y">
          <div className="max-w-2xl">
            <h2 className="type-h2 text-inkt text-balance">{pick(page.parents.heading, l)}</h2>
            <p className="type-lead mt-4 text-inkt">{pick(page.parents.lead, l)}</p>
          </div>

          {page.parents.blocks.length > 4 ? (
            <div className="mt-10">
              <CollapsibleSection label={t("parentsMore")}>
                <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  {page.parents.blocks.map((block) => (
                    <div key={block.title.nl}>
                      <dt className="text-lg font-bold text-inkt">{pick(block.title, l)}</dt>
                      <dd className="mt-1.5 text-base text-leisteen">{pick(block.text, l)}</dd>
                    </div>
                  ))}
                </dl>
              </CollapsibleSection>
            </div>
          ) : (
            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {page.parents.blocks.map((block) => (
                <div key={block.title.nl}>
                  <dt className="text-lg font-bold text-inkt">{pick(block.title, l)}</dt>
                  <dd className="mt-1.5 text-base text-leisteen">{pick(block.text, l)}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className={cn("mt-10 flex items-start gap-3 rounded-panel p-5 text-base text-inkt", parentsInset)}>
            <Users className="mt-0.5 size-5 shrink-0 text-leisteen" aria-hidden />
            {t("consentNote")}
          </p>
        </div>
      </section>

      {/* Parent FAQ */}
      {showFaq ? (
        <section className={tone("faq")}>
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

      {/* Closing invitation */}
      <section className="on-avondblauw bg-avondblauw text-papier">
        <div className="container-site section-y text-center">
          <h2 className="type-h2 text-papier text-balance">{pick(aboutPage.closing.heading, l)}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={{ pathname: "/agenda", query: { type: "infoSessions" } }}
              className={cn(buttonVariants({ variant: "primary" }), "w-full sm:w-auto")}
            >
              {ta("infoCta")}
            </Link>
            <Link
              href={{ pathname: "/agenda", query: { type: "teens" } }}
              className={cn(buttonVariants({ variant: "onDark" }), "w-full sm:w-auto")}
            >
              {t("datesCta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
