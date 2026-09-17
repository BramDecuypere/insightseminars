import { ArrowRight, CalendarDays } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"
import { accentVar } from "@/components/site/accent"
import { pick } from "@/lib/content"
import { formatEuro } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Locale, Program } from "@/lib/content/types"

interface ProgramCardProps {
  program: Program
  locale: Locale
  fromPrice: number | null
  free?: boolean
  nextDate?: string
}

/**
 * Overview card for a single program (§9.4). Shows the spectrum numeral, title,
 * official name, one-line summary, a key-facts row and a link to the detail
 * page. The accent is a thin top bar plus the numeral — colour is never the
 * only signal.
 */
export async function ProgramCard({ program, locale, fromPrice, free, nextDate }: ProgramCardProps) {
  const t = await getTranslations("common")
  const tp = await getTranslations("seminarsPage")

  const facts: string[] = []
  const duration = pick(program.durationLabel, locale)
  const hours = pick(program.hoursLabel, locale)
  const group = pick(program.groupSize, locale)
  if (duration) facts.push(duration)
  if (hours) facts.push(hours)
  if (group) facts.push(`${t("groupSize")}: ${group}`)

  const priceLabel = free
    ? t("free")
    : fromPrice != null
      ? t("priceFrom", { price: formatEuro(fromPrice, locale) })
      : null

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-panel border border-lijn bg-papier">
      <span aria-hidden className="h-1.5 w-full" style={{ backgroundColor: accentVar[program.accent] }} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="font-display text-3xl font-bold leading-none"
            style={{ color: accentVar[program.accent] }}
          >
            {program.numeral}
          </span>
          <div className="min-w-0">
            <h3 className="type-h3 text-inkt">{pick(program.title, locale)}</h3>
            <p className="mt-1 text-base text-leisteen">{pick(program.subtitle, locale)}</p>
            {program.officialName ? (
              <p className="mt-0.5 text-sm italic text-leisteen">{program.officialName}</p>
            ) : null}
          </div>
        </div>

        <p className="type-body mt-4 text-inkt">{pick(program.lead, locale)}</p>

        {facts.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-leisteen">
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-4 border-t border-lijn pt-4">
            {priceLabel ? <span className="text-base font-semibold text-inkt">{priceLabel}</span> : <span />}
            <span className="flex items-center gap-1.5 text-sm text-leisteen">
              <CalendarDays className="size-4" aria-hidden />
              {nextDate ?? tp("noDate")}
            </span>
          </div>
          <Link
            href={{ pathname: "/seminars/[slug]", params: { slug: program.slug } }}
            className={cn(buttonVariants({ variant: "secondary" }), "mt-4 w-full")}
          >
            {t("readMore", { program: pick(program.title, locale) })}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
