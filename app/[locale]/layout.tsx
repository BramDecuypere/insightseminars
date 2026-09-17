import type { Metadata, Viewport } from 'next'
import { Proza_Libre } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Analytics } from '@/components/analytics'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { FromNlNotice } from '@/components/site/from-nl-notice'
import { JsonLd } from '@/components/site/json-ld'
import { getSettings } from '@/lib/content'
import { DEFAULT_OG_IMAGE, organizationJsonLd } from '@/lib/seo'
import { routing } from '@/i18n/routing'
import '../globals.css'

// Proza Libre, self-hosted via next/font (brief §2, §9.3). No Google Fonts CDN.
const proza = Proza_Libre({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  style: ['normal', 'italic'],
  variable: '--font-proza',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insightseminars.be'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Insight Seminars België',
      template: '%s | Insight Seminars België',
    },
    description:
      locale === 'en'
        ? 'Intensive, experiential personal growth training in Antwerp.'
        : 'Intensieve, ervaringsgerichte training voor persoonlijke groei in Antwerpen.',
    openGraph: {
      siteName: 'Insight Seminars België',
      locale: locale === 'nl' ? 'nl_BE' : 'en_GB',
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    generator: 'v0.app',
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#211e55',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const [t, settings] = await Promise.all([getTranslations('nav'), getSettings()])
  const htmlLang = locale === 'nl' ? 'nl-BE' : 'en'

  return (
    <html lang={htmlLang} className={`${proza.variable} bg-background`}>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={organizationJsonLd(settings)} />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only left-4 top-4 z-50 rounded-md bg-avondblauw px-4 py-2 font-semibold text-papier focus:not-sr-only focus:absolute"
          >
            {t('skip')}
          </a>
          <FromNlNotice />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
