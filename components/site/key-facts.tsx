import type { ComponentType } from 'react'

export interface Fact {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}

/**
 * Kerncijfers (brief §9.4): a compact definition list with small icons so a
 * visitor sees what it is, what it costs and where it is without scrolling.
 */
export function KeyFacts({ facts }: { facts: Fact[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-leisteen" />
          <div>
            <dt className="text-sm font-semibold text-leisteen">{label}</dt>
            <dd className="text-base text-inkt">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
