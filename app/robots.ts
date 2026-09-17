import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * Disallow the Studio, the API and the noindex flows in both locales
 * (brief §10). Those pages also carry a noindex robots meta tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio',
        '/api',
        '/nl/inschrijven/bevestiging',
        '/en/register/confirmation',
        '/nl/betalen/',
        '/en/pay/',
        '/nl/nieuwsbrief/bevestigd',
        '/en/newsletter/confirmed',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
