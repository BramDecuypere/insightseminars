import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { EventRow } from "@/components/site/event-row"
import { NewsletterBand } from "@/components/site/newsletter-band"
import { Link } from "@/i18n/navigation"
import { getUpcomingEvents } from "@/lib/content"
import { buildEventViews } from "@/lib/content/view"
import { buildMetadata } from "@/lib/seo"
import type { EventType, Locale } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string }>
}

const FILTERS = ["all", "seminars", "teens", "infoSessions", "workshops"] as const
type Filter = (typeof FILTERS)[number]

const MATCHERS: Record<Exclude<Filter, "all">, EventType> = {
  seminars: "seminar",
  teens: "teenSeminar",
  infoSessions: "infoSession",
  workshops: "workshop",
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const t = await getTranslations({ locale, namespace: "agenda" })
  return buildMetadata({
    title: `${t("title")} | Insight Seminars België`,
    description: t("lead"),
    href: "/agenda",
    locale: l,
  })
}

export default async function AgendaPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { type } = await searchParams
  setRequestLocale(locale)
  const l = locale as Locale
  const now = new Date()

  const t = await getTranslations("agenda")
  const active: Filter = FILTERS.includes(type as Filter) ? (type as Filter) : "all"

  const upcoming = await getUpcomingEvents(now)
  const views = await buildEventViews(upcoming, l, now)

  const filtered =
    active === "all" ? views : views.filter((v) => v.type === MATCHERS[active])

  // Only show a tab when it has something behind it (plus "all").
  const availableTypes = new Set(views.map((v) => v.type))
  const visibleFilters = FILTERS.filter(
    (f) => f === "all" || availableTypes.has(MATCHERS[f as Exclude<Filter, "all">]),
  )

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
          <nav aria-label={t("title")} className="flex flex-wrap gap-2">
            {visibleFilters.map((f) => {
              const isActive = f === active
              return (
                <Link
                  key={f}
                  href={f === "all" ? { pathname: "/agenda" } : { pathname: "/agenda", query: { type: f } }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-4 py-2 text-base font-semibold transition-colors",
                    isActive
                      ? "border-avondblauw bg-avondblauw text-papier"
                      : "border-lijn bg-papier text-inkt hover:bg-mist",
                  )}
                >
                  {t(`filters.${f}`)}
                </Link>
              )
            })}
          </nav>

          {filtered.length > 0 ? (
            <ul className="mt-10 space-y-4">
              {filtered.map((view) => (
                <EventRow key={view.id} view={view} locale={l} />
              ))}
            </ul>
          ) : (
            <p className="type-body mt-10 max-w-xl text-leisteen">{t("empty")}</p>
          )}
        </div>
      </section>

      <NewsletterBand />
    </>
  )
}
