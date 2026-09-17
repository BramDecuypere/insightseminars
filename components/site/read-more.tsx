'use client'

import { Minus, Plus } from 'lucide-react'
import { useId, useState } from 'react'

/**
 * "Lees meer" disclosure (brief §9.4). Shows a short paragraph, then expands
 * the rest in place. Keyboard operable, with aria-expanded/aria-controls.
 */
export function ReadMore({
  short,
  more,
  moreLabel,
  lessLabel,
}: {
  short: string
  more?: string
  moreLabel: string
  lessLabel: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div>
      <p className="type-body text-inkt">{short}</p>
      {more ? (
        <>
          <p id={id} hidden={!open} className="type-body mt-3 text-inkt">
            {more}
          </p>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md text-base font-semibold text-inkt underline underline-offset-4 hover:decoration-2"
          >
            {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
            {open ? lessLabel : moreLabel}
          </button>
        </>
      ) : null}
    </div>
  )
}
