import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AlertCircle, CheckCircle2, CreditCard } from 'lucide-react'
import { verifyPayToken } from '@/lib/domain/paylink'
import { findRegistration } from '@/lib/integrations/sheets'
import { formatEuro } from '@/lib/format'
import { PayNowButton } from '@/components/register/pay-now-button'
import type { Locale } from '@/lib/content/types'

export const metadata: Metadata = { robots: { index: false, follow: false } }

type Props = {
  params: Promise<{ locale: string; registrationId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-site section-y">
      <div className="mx-auto max-w-xl">{children}</div>
    </div>
  )
}

const num = (v: unknown): number => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export default async function PayPage({ params, searchParams }: Props) {
  const { locale, registrationId } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const sp = await searchParams
  const token = Array.isArray(sp.t) ? sp.t[0] : sp.t
  const t = await getTranslations('confirmation')

  // 1. Verify the HMAC token (timing-safe, brief §7.1).
  if (!verifyPayToken(registrationId, token)) {
    return (
      <Shell>
        <span className="inline-flex text-accent1">
          <AlertCircle className="size-12" aria-hidden />
        </span>
        <h1 className="type-h1 mt-6 text-balance">{t('invalidLink')}</h1>
      </Shell>
    )
  }

  const found = await findRegistration(registrationId)

  // 2. Row missing (not configured in preview, or unknown id).
  if (!found) {
    return (
      <Shell>
        <span className="inline-flex text-accent1">
          <AlertCircle className="size-12" aria-hidden />
        </span>
        <h1 className="type-h1 mt-6 text-balance">{t('invalidLink')}</h1>
      </Shell>
    )
  }

  const row = found.values
  const outstanding = num(row.openstaand_eur)
  const eventTitle = String(row.activiteit ?? '')

  // 3. Already settled.
  if (outstanding <= 0) {
    return (
      <Shell>
        <span className="inline-flex text-avondblauw">
          <CheckCircle2 className="size-12" aria-hidden />
        </span>
        <h1 className="type-h1 mt-6 text-balance">{t('alreadyPaid')}</h1>
      </Shell>
    )
  }

  // 4. One clear amount, one Betalen button.
  return (
    <Shell>
      <span className="inline-flex text-avondblauw">
        <CreditCard className="size-12" aria-hidden />
      </span>
      <h1 className="type-h1 mt-6 text-balance">{t('payTitle', { event: eventTitle })}</h1>
      <dl className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-lijn bg-mist px-5 py-4">
        <dt className="text-sm font-medium text-leisteen">{t('payAmount')}</dt>
        <dd className="text-2xl font-semibold text-inkt">{formatEuro(outstanding, l)}</dd>
      </dl>
      <PayNowButton registrationId={registrationId} token={token as string} />
      <p className="mt-8 text-sm text-leisteen">
        {t('reference')}: <span className="font-mono text-inkt">{registrationId}</span>
      </p>
    </Shell>
  )
}
