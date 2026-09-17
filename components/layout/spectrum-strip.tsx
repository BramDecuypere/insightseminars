/**
 * Spectrum strip (brief §9.4): a 6px bar under the header, eight equal
 * segments forming a fixed color spectrum. Animates once on first load;
 * reduced-motion shows it statically. Decorative, so hidden from screen readers.
 */
const segments = [
  { color: '#FFFF55', delay: '0ms' },
  { color: '#F09236', delay: '50ms' },
  { color: '#EA3424', delay: '100ms' },
  { color: '#3C159B', delay: '150ms' },
  { color: '#7E3BB8', delay: '200ms' },
  { color: '#53B54B', delay: '250ms' },
  { color: '#40904E', delay: '300ms' },
  { color: '#49A3E9', delay: '350ms' },
]

export function SpectrumStrip() {
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      {segments.map((s, i) => (
        <span
          key={i}
          className="spectrum-seg block h-full flex-1"
          style={{ backgroundColor: s.color, animationDelay: s.delay }}
        />
      ))}
    </div>
  )
}
