import { notFound } from 'next/navigation'

/**
 * Any unmatched path under a locale triggers the localized not-found.tsx
 * (next-intl catch-all pattern, brief §4), returning a real 404 status.
 */
export default function CatchAll() {
  notFound()
}
