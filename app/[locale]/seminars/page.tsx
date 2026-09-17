import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ProgramCard } from "@/components/site/program-card"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { getPrograms, getSettings, getUpcomingEvents, pick } from "@/lib/content"
import { buildEventViews } from "@/lib/content/view"
import { buildMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const t = await getTranslations({ locale, namespace: "seminarsPage" })
  return buildMetadata({
    title: "Seminars | Insight Seminars België",
    description: t("lead"),
    href: "/seminars",
    locale: l,
  })
}

export default async function SeminarsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const now = new Date()

  const t = await getTranslations("seminarsPage")
  const [programs, settings, upcoming] = await Promise.all([
    getPrograms(),
    getSettings(),
    getUpcomingEvents(now),
  ])
  const views = await buildEventViews(upcoming, l, now)

  // Earliest upcoming, dated event per program → the card's "next date".
  const nextByProgram = new Map<string, (typeof views)[number]>()
  for (const v of views) {
    if (!v.programSlug || !v.hasDate) continue
    if (!nextByProgram.has(v.programSlug)) nextByProgram.set(v.programSlug, v)
  }
  const adults = programs.filter((p) => p.track === "adults")
  const teens = programs.filter((p) => p.track === "teens")

  const cardData = (slug: string) => {
    const v = nextByProgram.get(slug)
    return {
      fromPrice: v?.fromPrice ?? null,
      free: v?.free ?? false,
      nextDate: v?.dateRange,
    }
  }

  return (
    <>
      <header className="on-avondblauw bg-avondblauw text-papier">
        <div className="container-site section-y">
          <h1 className="type-h1 text-papier text-balance">{t("title")}</h1>
          <p className="type-lead mt-5 max-w-2xl text-papier/85">{t("lead")}</p>
        </div>
      </header>

      <section className="bg-papier">
        <div className="container-site section-y">
          <h2 className="type-h2 text-inkt">{t("adultsHeading")}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {adults.map((p) => {
              const d = cardData(p.slug)
              return (
                <ProgramCard
                  key={p._id}
                  program={p}
                  locale={l}
                  fromPrice={d.fromPrice}
                  free={d.free}
                  nextDate={d.nextDate}
                />
              )
            })}
          </div>
        </div>
      </section>

      {teens.length > 0 ? (
        <section className="bg-mist">
          <div className="container-site section-y">
            <div className="max-w-2xl">
              <h2 className="type-h2 text-inkt">{t("teensHeading")}</h2>
              <p className="type-body mt-4 text-inkt">{t("teensLead")}</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {teens.map((p) => {
                const d = cardData(p.slug)
                return (
                  <ProgramCard
                    key={p._id}
                    program={p}
                    locale={l}
                    fromPrice={d.fromPrice}
                    free={d.free}
                    nextDate={d.nextDate}
                  />
                )
              })}
            </div>
            <Link
              href="/teens"
              className="mt-8 inline-flex items-center gap-1.5 text-lg font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
            >
              {t("teensLink")}
              <ArrowUpRight className="size-5" aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}

      {/* Insight worldwide */}
      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <h2 className="type-h2 text-inkt text-balance">{t("worldHeading")}</h2>
              <p className="type-body mt-4 text-inkt">{t("worldLead")}</p>
              <a
                href={settings.internationalCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
              >
                {t("worldCta")}
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
            <ul className="divide-y divide-lijn rounded-panel border border-lijn">
              {settings.internationalLinks.map((link) => (
                <li key={link.label}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 px-5 py-4 text-inkt hover:bg-mist"
                    >
                      <span className="font-semibold">{link.label}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-leisteen" aria-hidden />
                    </a>
                  ) : (
                    <span className="flex items-center px-5 py-4 font-semibold text-inkt">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Still unsure? */}
      <section className="on-avondblauw bg-avondblauw text-papier">
        <div className="container-site section-y text-center">
          <h2 className="type-h2 text-papier text-balance">{t("doubtHeading")}</h2>
          <p className="type-lead mx-auto mt-4 max-w-xl text-papier/85">{t("doubtBody")}</p>
          <Link
            href={{ pathname: "/agenda", query: { type: "infoSessions" } }}
            className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
          >
            {t("doubtCta")}
          </Link>
        </div>
      </section>
    </>
  )
}
