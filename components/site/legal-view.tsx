import { getFormatter, getTranslations } from 'next-intl/server'
import { pick, pickRich } from '@/lib/content'
import type { LegalPage, Locale } from '@/lib/content/types'

/**
 * Legal page renderer (brief §13.10): title, version and last-updated meta,
 * then the rich-text body. When the body is still empty, a single placeholder
 * sentence is shown instead of blank space — never invented legal text.
 */
export async function LegalView({
  page,
  locale,
  placeholder,
}: {
  page: LegalPage
  locale: Locale
  placeholder: string
}) {
  const t = await getTranslations('footer')
  const format = await getFormatter()
  const body = pickRich(page.body, locale)
  const hasBody = body.length > 0

  const meta: string[] = []
  if (page.version) meta.push(t('version', { version: page.version }))
  if (page.updatedAt) {
    meta.push(t('updated', { date: format.dateTime(new Date(page.updatedAt), { dateStyle: 'long' }) }))
  }

  return (
    <article className="bg-papier">
      <div className="container-site section-y">
        <div className="mx-auto max-w-2xl">
          <h1 className="type-h1 text-inkt text-balance">{pick(page.title, locale)}</h1>
          {meta.length > 0 ? (
            <p className="type-small mt-4 text-leisteen">{meta.join(' \u00b7 ')}</p>
          ) : null}

          {hasBody ? (
            <div className="mt-8 space-y-4">
              {body.map((p, i) => (
                <p key={i} className="type-body text-inkt">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="type-body mt-8 rounded-panel bg-mist p-6 text-leisteen">{placeholder}</p>
          )}
        </div>
      </div>
    </article>
  )
}
