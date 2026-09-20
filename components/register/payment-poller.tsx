'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getRegistrationStatus } from '@/app/[locale]/register/actions'

type View = 'pending' | 'open' | 'paid' | 'failed' | 'canceled' | 'expired'

/**
 * Polls the registration status while a Mollie payment settles (brief §7.1):
 * every 3 seconds for up to 30 seconds. Shows the pending message first, then
 * switches to paid (with an add-to-calendar link) or failed (with a retry link).
 */
export function PaymentPoller({
  reference,
  locale,
  eventSlug: initialEventSlug,
}: {
  reference: string
  locale: string
  eventSlug?: string
}) {
  const t = useTranslations('confirmation')
  const [view, setView] = useState<View>('pending')
  const [payUrl, setPayUrl] = useState<string | undefined>()
  const [eventSlug, setEventSlug] = useState<string | undefined>(initialEventSlug)
  const timedOut = useRef(false)

  useEffect(() => {
    let active = true
    let attempts = 0
    const maxAttempts = 10 // 10 × 3s = 30s (brief §7.1)

    async function poll() {
      attempts += 1
      try {
        const res = await getRegistrationStatus(reference)
        if (!active) return
        if (res.payUrl) setPayUrl(res.payUrl)
        if (res.eventSlug) setEventSlug(res.eventSlug)
        if (res.state === 'paid' || res.state === 'free') {
          setView('paid')
          return
        }
        if (
          res.state === 'open' ||
          res.state === 'failed' ||
          res.state === 'canceled' ||
          res.state === 'expired'
        ) {
          setView(res.state)
          return
        }
      } catch {
        // Ignore transient errors and keep polling until the cap.
      }
      if (active && attempts < maxAttempts) {
        window.setTimeout(poll, 3000)
      } else {
        timedOut.current = true
      }
    }

    const id = window.setTimeout(poll, 3000)
    return () => {
      active = false
      window.clearTimeout(id)
    }
  }, [reference])

  const isError = view === 'failed' || view === 'canceled' || view === 'expired'
  const titleKey = {
    paid: 'paidTitle',
    open: 'openTitle',
    failed: 'failedTitle',
    canceled: 'canceledTitle',
    expired: 'expiredTitle',
    pending: 'pendingTitle',
  }[view] as 'paidTitle'
  const bodyKey = {
    paid: 'paidBody',
    open: 'openBody',
    failed: 'failedBody',
    canceled: 'canceledBody',
    expired: 'expiredBody',
    pending: 'pendingBody',
  }[view] as 'paidBody'

  const Icon = view === 'paid' ? CheckCircle2 : isError ? XCircle : Clock
  const iconColor = view === 'paid' ? 'text-avondblauw' : isError ? 'text-accent-1' : 'text-leisteen'
  const title = t(titleKey)
  const body = t(bodyKey)
  const canRetry =
    payUrl && (view === 'open' || view === 'failed' || view === 'canceled' || view === 'expired')

  return (
    <div aria-live="polite">
      <span className={`inline-flex ${iconColor}`}>
        <Icon className={`size-12 ${view === 'pending' ? 'animate-pulse' : ''}`} aria-hidden />
      </span>
      <h1 className="type-h1 mt-6 text-balance">{title}</h1>
      <p className="type-lead mt-4 text-leisteen">{body}</p>

      {view === 'paid' && eventSlug && (
        <a
          href={`/api/event/${eventSlug}/ics?locale=${locale}`}
          className="mt-8 inline-flex items-center rounded-md bg-avondblauw px-5 py-3 text-base font-semibold text-papier hover:opacity-90"
        >
          {t('addToCalendar')}
        </a>
      )}

      {canRetry && (
        <a
          href={payUrl}
          className="mt-8 inline-flex items-center rounded-md bg-avondblauw px-5 py-3 text-base font-semibold text-papier hover:opacity-90"
        >
          {t('retry')}
        </a>
      )}
    </div>
  )
}
