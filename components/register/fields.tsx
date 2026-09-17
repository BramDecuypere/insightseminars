'use client'

import { createContext, useContext, useId, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import type { FlowContext } from '@/lib/registration/flow'

/**
 * Shared registration form primitives (brief §7.1). Fields read react-hook-form
 * via context and translate the schema's error codes to `form.errors.*`, so a
 * step component only declares field names and labels. Autocomplete attributes
 * and accessible error wiring live here.
 */

const FlowCtx = createContext<FlowContext | null>(null)
export const FlowProvider = FlowCtx.Provider
export function useFlow(): FlowContext {
  const ctx = useContext(FlowCtx)
  if (!ctx) throw new Error('useFlow must be used within FlowProvider')
  return ctx
}

/** Resolve a field's error code to a translated message (handles {min,max}). */
export function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext()
  const te = useTranslations('form.errors')
  const flow = useContext(FlowCtx)
  const parts = name.split('.')
  let node: unknown = errors
  for (const p of parts) {
    if (node && typeof node === 'object' && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p]
    } else {
      node = undefined
      break
    }
  }
  const message = (node as { message?: string } | undefined)?.message
  if (!message) return undefined
  if (message === 'age') {
    return te('age', { min: flow?.ageMin ?? 0, max: flow?.ageMax ?? 0 })
  }
  // `honeypot` is intentionally silent to the user.
  if (message === 'honeypot') return undefined
  try {
    return te(message as never)
  } catch {
    return te('required')
  }
}

const labelClass = 'block text-base font-semibold text-inkt'
const inputClass =
  'mt-1.5 h-12 w-full rounded-md border border-lijn bg-mist px-3.5 text-base text-inkt outline-none focus-visible:ring-3 focus-visible:ring-accent-4 focus-visible:ring-offset-2'

export function ErrorText({ name }: { name: string }) {
  const error = useFieldError(name)
  if (!error) return null
  return (
    <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-accent-1" role="alert">
      {error}
    </p>
  )
}

function Optional() {
  const t = useTranslations('form.fields')
  return <span className="ml-1 font-normal text-leisteen">({t('optional')})</span>
}

export function TextField({
  name,
  label,
  type = 'text',
  autoComplete,
  inputMode,
  hint,
  optional,
}: {
  name: string
  label: string
  type?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  hint?: string
  optional?: boolean
}) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <Optional />}
      </label>
      {hint && <p className="mt-0.5 text-sm text-leisteen">{hint}</p>}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass}
        {...register(name)}
      />
      <ErrorText name={name} />
    </div>
  )
}

export function TextAreaField({
  name,
  label,
  optional,
  rows = 4,
}: {
  name: string
  label: string
  optional?: boolean
  rows?: number
}) {
  const { register } = useFormContext()
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <Optional />}
      </label>
      <textarea
        id={id}
        rows={rows}
        className="mt-1.5 w-full rounded-md border border-lijn bg-mist px-3.5 py-2.5 text-base text-inkt outline-none focus-visible:ring-3 focus-visible:ring-accent-4 focus-visible:ring-offset-2"
        {...register(name)}
      />
      <ErrorText name={name} />
    </div>
  )
}

export function SelectField({
  name,
  label,
  options,
  optional,
}: {
  name: string
  label: string
  options: { value: string; label: string }[]
  optional?: boolean
}) {
  const { register } = useFormContext()
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <Optional />}
      </label>
      <select id={id} className={inputClass} {...register(name)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ErrorText name={name} />
    </div>
  )
}

/** A segmented radio group (used for Ja/Nee and other short choices). */
export function RadioField({
  name,
  label,
  options,
  hint,
}: {
  name: string
  label: string
  options: { value: string; label: string }[]
  hint?: string
}) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  return (
    <fieldset aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : undefined}>
      <legend className={labelClass}>{label}</legend>
      {hint && <p className="mt-0.5 text-sm text-leisteen">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-lijn bg-mist px-3.5 py-2.5 text-base text-inkt has-[:checked]:border-avondblauw has-[:checked]:bg-papier has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-accent-4"
          >
            <input type="radio" value={o.value} className="accent-avondblauw" {...register(name)} />
            {o.label}
          </label>
        ))}
      </div>
      <ErrorText name={name} />
    </fieldset>
  )
}

export function CheckboxField({ name, children }: { name: string; children: ReactNode }) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-base text-inkt">
        <input
          id={id}
          type="checkbox"
          className="mt-1 size-5 shrink-0 accent-avondblauw"
          aria-describedby={error ? `${name}-error` : undefined}
          {...register(name)}
        />
        <span>{children}</span>
      </label>
      <ErrorText name={name} />
    </div>
  )
}

/** Off-screen honeypot field (brief §7.1). Real users never fill it. */
export function Honeypot() {
  const { register } = useFormContext()
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </label>
    </div>
  )
}
