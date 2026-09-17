import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Baseline security headers (brief §11). CSP is report-only for now so the
// embedded Studio (Prompt 4) is never blocked. The v0 preview strips framing
// and CSP headers, so these fully apply only on the deployed site.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async headers() {
    return [
      {
        // Everywhere except the embedded Studio, which needs to be framed.
        source: '/((?!studio).*)',
        headers: [...securityHeaders, { key: 'X-Frame-Options', value: 'DENY' }],
      },
      {
        source: '/studio/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
