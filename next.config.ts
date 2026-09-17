import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { buildLegacyRedirects } from './lib/legacy-redirects'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insightseminars.be'

// Content Security Policy in report-only mode for now (brief §11), so the
// embedded Sanity Studio is never blocked while we collect violations. It only
// reports; nothing is enforced yet. connect-src lists the origins the app talks
// to (Sanity, Mollie, Vercel analytics); form-action allows the Mollie redirect.
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://api.mollie.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://www.mollie.com",
  "form-action 'self' https://www.mollie.com https://*.mollie.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
].join('; ')

// Baseline security headers (brief §11). The v0 preview strips framing and CSP
// headers, so these fully apply only on the deployed site.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
]

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Teen consent uploads can be up to 4 MB (brief §7.2). The file travels as
    // multipart (raw bytes, not base64), so headroom above 4 MB covers the rest
    // of the action payload while staying under Vercel's 4.5 MB hard limit.
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // Guarantee one-hop legacy redirects: skip Next's automatic trailing-slash
  // redirect so the .nl rules below match trailing-slash URLs directly.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        // X-Frame-Options everywhere except the embedded Studio, which is framed.
        source: '/((?!studio).*)',
        headers: [...securityHeaders, { key: 'X-Frame-Options', value: 'DENY' }],
      },
      {
        source: '/studio/:path*',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    // Host-based 301s from insightseminars.nl → insightseminars.be (brief §12).
    return buildLegacyRedirects(siteUrl)
  },
}

export default withNextIntl(nextConfig)
