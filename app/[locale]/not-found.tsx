import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'

/**
 * Localized 404 UI (brief §4). Rendered inside the [locale] layout, so it uses
 * the visitor's language and keeps the header, footer and skip link.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="container-site section-y">
      <p className="type-numeral text-lijn" aria-hidden="true">
        404
      </p>
      <h1 className="type-h1 mt-2 text-balance">{t('title')}</h1>
      <p className="type-lead mt-5 max-w-2xl text-leisteen">{t('body')}</p>
      <Link href="/" className={`${buttonVariants({ variant: 'primary' })} mt-8`}>
        {t('home')}
      </Link>
    </div>
  )
}
