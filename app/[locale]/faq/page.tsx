import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { FaqHash } from '@/components/site/faq-hash'
import { FaqList } from '@/components/site/faq-list'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getFaqs } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import type { FaqCategory, Locale } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ locale: string }> }

const CATEGORY_ORDER: FaqCategory[] = ['algemeen', 'praktisch', 'betalen', 'tieners']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const t = await getTranslations({ locale, namespace: 'faqPage' })
  return buildMetadata({
    title:
      l === 'en'
        ? 'FAQ | Insight Seminars België'
        : 'Veelgestelde vragen | Insight Seminars België',
    description: t('lead'),
    href: '/faq',
    locale: l,
  })
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const t = await getTranslations('faqPage')
  const faqs = await getFaqs()

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: faqs.filter((f) => f.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <>
      <FaqHash />
      <header className="bg-mist text-inkt">
        <div className="container-site section-y">
          <h1 className="type-h1 text-inkt text-balance">{t('title')}</h1>
          <p className="type-lead mt-5 max-w-2xl text-leisteen">{t('lead')}</p>
        </div>
      </header>

      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="mx-auto max-w-3xl space-y-14">
            {groups.map((group) => (
              <div key={group.category}>
                <h2 className="type-h2 text-inkt">{t(`categories.${group.category}`)}</h2>
                <div className="mt-6">
                  <FaqList faqs={group.items} locale={l} />
                </div>
              </div>
            ))}

            <div className="rounded-panel bg-mist p-8 text-center">
              <p className="type-lead text-inkt text-balance">{t('contactPrompt')}</p>
              <Link href="/contact" className={cn(buttonVariants({ variant: 'primary' }), 'mt-5')}>
                {t('contactCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
