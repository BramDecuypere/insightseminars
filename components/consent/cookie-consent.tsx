'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { saveConsent } from '@/lib/consent/actions'
import { CONSENT_CHANGE_EVENT, readClientConsentCookie, type ConsentPreferences } from '@/lib/consent/types'
import { useConsentUI } from './consent-ui-context'

/**
 * GDPR cookie banner + preferences dialog. The saved choice cannot be known
 * during SSR (same reasoning as FromNlNotice), so both the banner visibility
 * and the preferences checkbox start from a fixed default and are corrected
 * once in an effect after mount.
 *
 * `@vercel/analytics` (the only optional cookie technology on the site, see
 * components/analytics.tsx) gates itself by reading the same cookie and
 * listening for CONSENT_CHANGE_EVENT, so saving here never needs a page
 * reload or a server round-trip to take effect.
 */
export function CookieConsent() {
  const t = useTranslations('cookies')
  const { isPreferencesOpen, openPreferences, closePreferences } = useConsentUI()
  const [bannerVisible, setBannerVisible] = useState(false)
  const [analyticsChecked, setAnalyticsChecked] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const saved = readClientConsentCookie()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBannerVisible(saved === null)
    if (saved) setAnalyticsChecked(saved.analytics)
  }, [])

  function commit(preferences: ConsentPreferences) {
    startTransition(async () => {
      await saveConsent(preferences)
      setAnalyticsChecked(preferences.analytics)
      setBannerVisible(false)
      closePreferences()
      window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT))
    })
  }

  return (
    <>
      {bannerVisible && (
        <div
          role="region"
          aria-label={t('title')}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-lijn bg-papier shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          <div className="container-site flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="type-small font-semibold text-inkt">{t('title')}</p>
              <p className="mt-1 type-small text-leisteen">
                {t('body')}{' '}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-inkt">
                  {t('privacyLink')}
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
              <Button variant="outline" size="sm" onClick={openPreferences} disabled={isPending}>
                {t('manage')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => commit({ analytics: false })}
                disabled={isPending}
              >
                {t('rejectAll')}
              </Button>
              <Button size="sm" onClick={() => commit({ analytics: true })} disabled={isPending}>
                {t('acceptAll')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
        <DialogContent className="max-w-md gap-6 rounded-panel border border-lijn bg-papier p-6 shadow-[0_16px_48px_rgba(28,30,51,0.14)] ring-0 sm:max-w-md">
          <DialogHeader className="gap-1.5 pr-6">
            <DialogTitle className="text-[1.375rem] leading-[1.3] font-semibold text-inkt">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-[0.9375rem] leading-[1.5] text-leisteen">
              {t('body')}{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-inkt">
                {t('privacyLink')}
              </Link>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-md border border-lijn bg-mist/60 p-4">
              <Checkbox id="consent-necessary" checked disabled className="mt-0.5" />
              <label htmlFor="consent-necessary">
                <span className="block type-small font-semibold text-inkt">{t('necessary')}</span>
                <span className="block type-small text-leisteen">{t('necessaryHint')}</span>
              </label>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-lijn p-4">
              <Checkbox
                id="consent-analytics"
                checked={analyticsChecked}
                onCheckedChange={(checked) => setAnalyticsChecked(checked === true)}
                className="mt-0.5 data-checked:border-avondblauw data-checked:bg-avondblauw"
              />
              <label htmlFor="consent-analytics">
                <span className="block type-small font-semibold text-inkt">{t('analytics')}</span>
                <span className="block type-small text-leisteen">{t('analyticsHint')}</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-lijn pt-5 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => commit({ analytics: false })}
              disabled={isPending}
            >
              {t('rejectAll')}
            </Button>
            <Button onClick={() => commit({ analytics: analyticsChecked })} disabled={isPending}>
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
