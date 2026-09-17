'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { createPayLinkPayment } from '@/app/[locale]/pay/actions'

/**
 * "Betalen" button on the pay-link page (brief §7.1). Creates the Mollie
 * payment for the amount still outstanding and redirects to the checkout.
 */
export function PayNowButton({
  registrationId,
  token,
}: {
  registrationId: string
  token: string
}) {
  const t = useTranslations('confirmation')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPay() {
    setBusy(true)
    setError(null)
    try {
      const res = await createPayLinkPayment(registrationId, token)
      if (res.ok) {
        window.location.assign(res.checkoutUrl)
        return
      }
      setError(res.error === 'paid' ? t('alreadyPaid') : t('payError'))
    } catch {
      setError(t('payError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-8">
      <Button size="lg" onClick={onPay} disabled={busy} aria-busy={busy}>
        {t('payButton')}
      </Button>
      {error && (
        <p className="mt-3 text-sm font-medium text-accent1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
