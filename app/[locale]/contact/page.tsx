import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ContactForm } from '@/components/site/contact-form'
import { getContactPage, getSettings, pick } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import type { Locale } from '@/lib/content/types'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const l = locale as Locale
  const page = await getContactPage()
  return buildMetadata({
    title: pick(page.seo.title, l),
    description: pick(page.seo.description, l),
    href: '/contact',
    locale: l,
  })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const t = await getTranslations('contactPage')
  const [page, settings] = await Promise.all([getContactPage(), getSettings()])

  return (
    <>
      <header className="bg-mist text-inkt">
        <div className="container-site section-y">
          <h1 className="type-h1 text-inkt text-balance">{pick(page.hero.title, l)}</h1>
          <p className="type-lead mt-5 max-w-2xl text-leisteen">{pick(page.hero.lead, l)}</p>
        </div>
      </header>

      <section className="bg-papier">
        <div className="container-site section-y">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* Form */}
            <div>
              <h2 className="type-h2 text-inkt text-balance">{t('formHeading')}</h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-10">
              <div>
                <h2 className="type-h3 text-inkt">{pick(page.sections.direct, l)}</h2>
                <dl className="mt-4 space-y-2 text-base">
                  <div className="flex gap-2">
                    <dt className="text-leisteen">{t('emailLabel')}:</dt>
                    <dd>
                      <a
                        href={`mailto:${settings.email}`}
                        className="font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
                      >
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                  {settings.phone ? (
                    <div className="flex gap-2">
                      <dt className="text-leisteen">{t('phoneLabel')}:</dt>
                      <dd>
                        <a
                          href={`tel:${settings.phone.replace(/\s/g, '')}`}
                          className="font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
                        >
                          {settings.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {settings.socials.length > 0 ? (
                <div>
                  <h2 className="type-h3 text-inkt">{pick(page.sections.follow, l)}</h2>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {settings.socials.map((s) => (
                      <li key={s.platform}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
                        >
                          {s.platform}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
