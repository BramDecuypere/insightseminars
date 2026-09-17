import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware navigation helpers. Use these Link/redirect/usePathname/useRouter
 * everywhere instead of next/link, so localized pathnames (§4) are resolved.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
