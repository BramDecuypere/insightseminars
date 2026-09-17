import type { ReactNode } from 'react'

/**
 * Minimal page scaffold used for Prompt 1 stubs. Real page content is built in
 * Prompts 2–3. Kept single-H1 and localized so no Dutch/English text mixes.
 */
export function PageStub({
  title,
  lead,
  children,
}: {
  title: string
  lead?: string
  children?: ReactNode
}) {
  return (
    <div className="container-site section-y">
      <h1 className="type-h1 text-balance">{title}</h1>
      {lead && <p className="type-lead mt-5 max-w-2xl text-leisteen">{lead}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  )
}
