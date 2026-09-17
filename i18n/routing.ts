import { defineRouting } from 'next-intl/routing'

/**
 * next-intl routing (brief §2, §4).
 * - locales nl (default) and en
 * - localePrefix 'always' so every URL is prefixed (/nl, /en)
 * - localeDetection false so everyone lands in Dutch, even with an English browser
 * - localeCookie false so no cookie is ever set
 * - localized pathnames from the §4 table (folder names are the internal keys)
 */
export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  localePrefix: 'always',
  localeDetection: false,
  localeCookie: false,
  pathnames: {
    '/': '/',
    '/about': { nl: '/over-insight', en: '/about-insight' },
    '/seminars': { nl: '/seminars', en: '/seminars' },
    '/seminars/[slug]': { nl: '/seminars/[slug]', en: '/seminars/[slug]' },
    '/teens': { nl: '/tieners', en: '/teens' },
    '/agenda': { nl: '/agenda', en: '/calendar' },
    '/faq': { nl: '/veelgestelde-vragen', en: '/faq' },
    '/contact': { nl: '/contact', en: '/contact' },
    '/links': { nl: '/links', en: '/links' },
    '/register/[event]': { nl: '/inschrijven/[event]', en: '/register/[event]' },
    '/register/confirmation': {
      nl: '/inschrijven/bevestiging',
      en: '/register/confirmation',
    },
    '/pay/[registrationId]': {
      nl: '/betalen/[registrationId]',
      en: '/pay/[registrationId]',
    },
    '/newsletter/confirmed': {
      nl: '/nieuwsbrief/bevestigd',
      en: '/newsletter/confirmed',
    },
    '/privacy': { nl: '/privacy', en: '/privacy' },
    '/terms': { nl: '/algemene-voorwaarden', en: '/terms-and-conditions' },
    '/safeguarding': {
      nl: '/veiligheid-en-gedragscode',
      en: '/safeguarding',
    },
  },
})

export type Locale = (typeof routing.locales)[number]
export type Pathname = keyof typeof routing.pathnames
