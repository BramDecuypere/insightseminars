import type { Accent } from '@/lib/content/types'

/** Maps a program accent key to its CSS custom property (brief §9.2). */
export const accentVar: Record<Accent, string> = {
  accent1: 'var(--accent-1)',
  accent2: 'var(--accent-2)',
  accent3: 'var(--accent-3)',
  accent4: 'var(--accent-4)',
}

/**
 * Darkened accent for accent-coloured TEXT on light backgrounds (>= 4.5:1 on
 * papier). Use this instead of accentVar whenever the accent is applied to
 * text on a light surface; keep accentVar for bars, fills and text on the dark
 * avondblauw bands.
 */
export const accentInk: Record<Accent, string> = {
  accent1: 'var(--accent-1-ink)',
  accent2: 'var(--accent-2-ink)',
  accent3: 'var(--accent-3-ink)',
  accent4: 'var(--accent-4-ink)',
}
