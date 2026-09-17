import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSettings, pick } from "@/lib/content"
import { buildMetadata } from "@/lib/seo"
import type { Locale } from "@/lib/content/types"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const t = await getTranslations({ locale, namespace: "linksPage" })
  return buildMetadata({
    title: `${t("title")} | Insight Seminars België`,
    description: t("lead"),
    href: "/links",
    locale: l,
  })
}

function isExternal(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
}

export default async function LinksPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const t = await getTranslations("linksPage")
  const settings = await getSettings()
  const links = settings.linksPage ?? []

  return (
    <header className="bg-papier">
      <div className="container-site section-y">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="type-h1 text-inkt text-balance">{t("title")}</h1>
          <p className="type-lead mt-4 text-inkt">{t("lead")}</p>
        </div>

        <ul className="mx-auto mt-10 flex max-w-xl flex-col gap-3">
          {links.map((link, i) => {
            const label = pick(link.label, l)
            const external = isExternal(link.url)
            const href = external ? link.url : `/${l}${link.url}`
            const className = [
              "flex items-center justify-between gap-4 rounded-panel border px-5 py-4 text-lg font-semibold transition-colors",
              link.highlight
                ? "border-[#c98f12] bg-accent-2 text-inkt hover:bg-[#e5a516]"
                : "border-lijn bg-papier text-inkt hover:bg-mist",
            ].join(" ")
            return (
              <li key={`${link.url}-${i}`}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={className}
                >
                  <span>{label}</span>
                  {external ? <ArrowUpRight className="size-5 shrink-0" aria-hidden /> : null}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </header>
  )
}
