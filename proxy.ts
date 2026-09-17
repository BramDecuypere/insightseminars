import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * Next.js 16 renames middleware.ts to proxy.ts (brief §2).
 * next-intl handles the locale prefix and localized pathnames.
 */
export default createMiddleware(routing)

export const config = {
  // Skip API, embedded Studio, Next internals, Vercel internals and any file
  // with an extension (brief Prompt 1 §2).
  matcher: '/((?!api|studio|_next|_vercel|.*\\..*).*)',
}
