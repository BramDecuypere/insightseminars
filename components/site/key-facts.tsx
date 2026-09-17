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
        <div key={label}>
          <dt className="flex items-center gap-2 text-sm font-semibold text-leisteen">
            <Icon className="size-5 shrink-0 text-leisteen" aria-hidden />
            {label}
          </dt>
          <dd className="mt-1 pl-7 text-base text-inkt">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
