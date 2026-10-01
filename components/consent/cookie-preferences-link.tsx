'use client'

import { useTranslations } from 'next-intl'
import { useConsentUI } from './consent-ui-context'

/** Footer link that reopens the cookie preferences dialog (GDPR requires this to stay reachable after the first choice). */
export function CookiePreferencesLink() {
  const t = useTranslations('cookies')
  const { openPreferences } = useConsentUI()

  return (
    <button type="button" onClick={openPreferences} className="hover:text-inkt">
      {t('manageLink')}
    </button>
  )
}
