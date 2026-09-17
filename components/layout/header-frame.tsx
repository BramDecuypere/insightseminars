'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Client wrapper around the header chrome so the border can settle in once
 * the page has scrolled a little, instead of always being drawn. Keeps the
 * header itself a Server Component (nav, CTAs, translations) by taking it as
 * `children`.
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-papier text-inkt transition-colors duration-200',
        scrolled ? 'border-lijn' : 'border-transparent',
      )}
    >
      {children}
    </header>
  )
}
