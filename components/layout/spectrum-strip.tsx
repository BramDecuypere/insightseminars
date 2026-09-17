/**
 * Spectrum strip (brief §9.4): a 6px bar under the header, four equal segments
 * in the program accents (I, II, III, Tieners). Animates once on first load;
 * reduced-motion shows it statically. Decorative, so hidden from screen readers.
 */
const segments = [
  { color: 'var(--accent-1)', delay: '0ms' },
  { color: 'var(--accent-2)', delay: '120ms' },
  { color: 'var(--accent-3)', delay: '240ms' },
  { color: 'var(--accent-4)', delay: '360ms' },
]

export function SpectrumStrip() {
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      {segments.map((s) => (
        <span
          key={s.color}
          className="spectrum-seg block h-full flex-1"
          style={{ backgroundColor: s.color, animationDelay: s.delay }}
        />
      ))}
    </div>
  )
}
