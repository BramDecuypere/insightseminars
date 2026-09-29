import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Native <details>/<summary> disclosure for secondary content, matching
 * FaqList's visual language. Use for content that follows an already-visible
 * lead sentence or heading — never wrap the lead itself.
 */
export function CollapsibleSection({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <details className={`group rounded-panel border border-lijn ${className ?? ''}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-base font-semibold text-inkt">{label}</span>
        <Plus className="size-5 shrink-0 text-leisteen transition-transform group-open:rotate-45" aria-hidden />
      </summary>
      <div className="-mt-1 space-y-3 px-5 pb-5">{children}</div>
    </details>
  )
}
