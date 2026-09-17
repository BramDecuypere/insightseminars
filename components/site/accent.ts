import type { Accent } from '@/lib/content/types'

/** Maps a program accent key to its CSS custom property (brief §9.2). */
export const accentVar: Record<Accent, string> = {
  accent1: 'var(--accent-1)',
  accent2: 'var(--accent-2)',
  accent3: 'var(--accent-3)',
  accent4: 'var(--accent-4)',
}
