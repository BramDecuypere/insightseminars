import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale, Program } from '@/lib/content/types'
import { pick } from '@/lib/content'
import { accentVar } from './accent'

/**
 * "Het pad" (brief §9.4): three columns on avondblauw. Each shows a big numeral
 * in the program colour (decorative; the real name is the heading), the title,
 * the plain subtitle, the official English name as a secondary line, a short
 * path text and a link into the program page.
 */
export async function PathBlock({
  programs,
  locale,
}: {
  programs: Program[]
  locale: Locale
}) {
  const t = await getTranslations('common')

  return (
    <ul className="grid gap-8 md:grid-cols-3">
      {programs.map((p) => (
        <li key={p._id} className="flex flex-col">
          <span
            aria-hidden
            className="type-numeral leading-none"
            style={{ color: accentVar[p.accent] }}
          >
            {p.numeral}
          </span>
          <h3 className="mt-2 text-2xl font-bold">{pick(p.title, locale)}</h3>
          <p className="mt-1 text-lg">{pick(p.subtitle, locale)}</p>
          {p.officialName ? (
            <p lang="en" className="mt-1 text-base italic">
              {p.officialName}
            </p>
          ) : null}
          <p className="mt-3 text-base">{pick(p.pathText, locale)}</p>
          <Link
            href={{ pathname: '/seminars/[slug]', params: { slug: p.slug } }}
            className="mt-4 inline-flex w-fit items-center text-base font-semibold underline underline-offset-4 hover:decoration-2"
          >
            {t('readMore', { program: pick(p.title, locale) })}
          </Link>
        </li>
      ))}
    </ul>
  )
}
