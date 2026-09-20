import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CheckCircle2, Clock, XCircle, ListChecks, Info } from 'lucide-react'
import { CopyButton } from '@/components/register/copy-button'
import { PaymentPoller } from '@/components/register/payment-poller'
import { readRegistrationStatus } from '@/lib/registration/status'
import { getSettings } from '@/lib/content'
import { formatEuro } from '@/lib/format'
import { formatDate } from '@/lib/domain/dates'
import type { Locale } from '@/lib/content/types'

export const metadata: Metadata = { robots: { index: false, follow: false } }

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type Tone = 'ok' | 'pending' | 'error'

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const sp = await searchParams

  const t = await getTranslations('confirmation')
  const requestedState = str(sp.state) ?? 'pending'
  const ref = str(sp.ref)
  const amountCents = Number(str(sp.amount))
  const due = str(sp.due)
  const ogm = str(sp.ogm)
  let eventSlug = str(sp.event)

  // Mollie always redirects back with `state=pending`; the real outcome (open,
  // paid, failed, canceled, expired) lives in the sheet / Mollie. Resolve it
  // server-side so the page shows the correct feedback right away. While the
  // payment is genuinely still settling we fall back to the live poller.
  let state = requestedState
  let payUrl: string | undefined
  if (requestedState === 'pending' && ref) {
    const status = await readRegistrationStatus(ref)
    if (status.state === 'pending' || status.state === 'unknown') {
      return (
        <div className="container-site section-y">
          <div className="mx-auto max-w-2xl">
            <PaymentPoller reference={ref} locale={locale} eventSlug={eventSlug} />
            <p className="mt-8 text-sm text-leisteen">
              {t('reference')}: <span className="font-mono text-inkt">{ref}</span>
            </p>
          </div>
        </div>
      )
    }
    state = status.state
    payUrl = status.payUrl
    eventSlug = status.eventSlug ?? eventSlug
  }

  const settings = await getSettings()
  const dueText = due ? formatDate(due, l) : ''
  const amountText = Number.isFinite(amountCents) ? formatEuro(amountCents, l) : ''

  // Each state maps to a heading, body and visual tone. Detail rows are added below.
  const view: { tone: Tone; title: string; body: string } = (() => {
    switch (state) {
      case 'paid':
        return { tone: 'ok', title: t('paidTitle'), body: t('paidBody') }
      case 'transfer':
        return { tone: 'ok', title: t('transferTitle'), body: t('transferBody', { amount: amountText, date: dueText }) }
      case 'later':
        return { tone: 'ok', title: t('laterTitle'), body: t('laterBody', { date: dueText }) }
      case 'check':
        return { tone: 'pending', title: t('checkTitle'), body: t('checkBody') }
      case 'waitlist':
        return { tone: 'pending', title: t('waitlistTitle'), body: t('waitlistBody') }
      case 'free':
        return { tone: 'ok', title: t('paidTitle'), body: t('paidBody') }
      case 'info':
        return { tone: 'ok', title: t('infoSessionTitle'), body: t('infoSessionBody') }
      case 'open':
        return { tone: 'pending', title: t('openTitle'), body: t('openBody') }
      case 'failed':
        return { tone: 'error', title: t('failedTitle'), body: t('failedBody') }
      case 'canceled':
        return { tone: 'error', title: t('canceledTitle'), body: t('canceledBody') }
      case 'expired':
        return { tone: 'error', title: t('expiredTitle'), body: t('expiredBody') }
      default:
        return { tone: 'pending', title: t('pendingTitle'), body: t('pendingBody') }
    }
  })()

  const Icon = view.tone === 'ok' ? CheckCircle2 : view.tone === 'error' ? XCircle : state === 'check' ? ListChecks : state === 'info' ? Info : Clock
  const iconColor =
    view.tone === 'ok' ? 'text-avondblauw' : view.tone === 'error' ? 'text-accent-1' : 'text-leisteen'

  // States where the visitor still owes a payment can offer a retry link.
  const canRetry = payUrl && (state === 'open' || state === 'failed' || state === 'canceled' || state === 'expired')

  const showTransferDetails = state === 'transfer'
  const rows: { label: string; value: string }[] = []
  if (showTransferDetails) {
    if (settings?.iban) rows.push({ label: t('iban'), value: settings.iban })
    if (settings?.accountHolder) rows.push({ label: t('accountHolder'), value: settings.accountHolder })
    if (ogm) rows.push({ label: t('reference'), value: ogm })
  }

  return (
    <div className="container-site section-y">
      <div className="mx-auto max-w-2xl">
        <span className={`inline-flex ${iconColor}`}>
          <Icon className="size-12" aria-hidden />
        </span>
        <h1 className="type-h1 mt-6 text-balance">{view.title}</h1>
        <p className="type-lead mt-4 text-leisteen">{view.body}</p>

        {(state === 'paid' || state === 'free') && eventSlug && (
          <a
            href={`/api/event/${eventSlug}/ics?locale=${locale}`}
            className="mt-6 inline-flex items-center rounded-md bg-avondblauw px-5 py-3 text-base font-semibold text-papier hover:opacity-90"
          >
            {t('addToCalendar')}
          </a>
        )}

        {canRetry && (
          <a
            href={payUrl}
            className="mt-6 inline-flex items-center rounded-md bg-avondblauw px-5 py-3 text-base font-semibold text-papier hover:opacity-90"
          >
            {t('retry')}
          </a>
        )}

        {showTransferDetails && rows.length > 0 && (
          <dl className="mt-8 divide-y divide-lijn rounded-xl border border-lijn bg-mist">
            {amountText && (
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm font-medium text-leisteen">{t('amountLabel')}</dt>
                <dd className="text-lg font-semibold text-inkt">{amountText}</dd>
              </div>
            )}
            {rows.map((row) => (
              <div key={row.label} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <dt className="text-sm font-medium text-leisteen">{row.label}</dt>
                <dd className="flex items-center gap-3">
                  <span className="font-mono text-base text-inkt">{row.value}</span>
                  <CopyButton value={row.value} label={row.label} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {ref && (
          <p className="mt-8 text-sm text-leisteen">
            {t('reference')}: <span className="font-mono text-inkt">{ref}</span>
          </p>
        )}
      </div>
    </div>
  )
}
