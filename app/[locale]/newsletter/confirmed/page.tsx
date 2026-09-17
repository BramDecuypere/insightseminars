import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageStub } from '@/components/page-stub'

type Props = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function NewsletterConfirmedPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('newsletter')
  return <PageStub title={t('confirmedTitle')} lead={t('confirmedBody')} />
}
