import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LegalView } from '@/components/site/legal-view'
import { getLegalPage, pick } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/content/types'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const page = await getLegalPage('privacy')
  const title = page ? `${pick(page.title, l)} | Insight Seminars België` : 'Privacy'
  return buildMetadata({ title, href: '/privacy', locale: l })
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const page = await getLegalPage('privacy')
  if (!page) notFound()
  const t = await getTranslations('legal')
  return <LegalView page={page} locale={l} placeholder={t('placeholder')} />
}
