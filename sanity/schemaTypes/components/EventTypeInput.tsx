import { Select } from '@sanity/ui'
import { useCallback, useEffect, useState } from 'react'
import { set, unset, type StringInputProps, useClient, useFormValue } from 'sanity'

/**
 * Custom input for event.type (brief: don't ask twice). "Seminarie" used to
 * be two separate picklist entries (volwassenen/tieners) that duplicated the
 * track already set on the linked program, with nothing catching a mismatch.
 * Here the editor only ever picks "Seminarie" once; which concrete value
 * (`seminar` or `teenSeminar`) gets stored is derived from the referenced
 * program's `track` and kept in sync whenever that reference changes.
 */

const OPTIONS = [
  { title: 'Seminarie', value: 'seminar' },
  { title: 'Infosessie', value: 'infoSession' },
  { title: 'Workshop', value: 'workshop' },
  { title: 'Event', value: 'event' },
] as const

// teenSeminar is a storage detail of the "seminar" bucket, never its own list entry.
const toBucket = (value?: string) => (value === 'teenSeminar' ? 'seminar' : value)

export function EventTypeInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props
  const programRef = useFormValue(['program']) as { _ref?: string } | undefined
  const client = useClient({ apiVersion: '2024-10-01' })
  const [track, setTrack] = useState<string | undefined>()

  useEffect(() => {
    if (!programRef?._ref) {
      setTrack(undefined)
      return
    }
    let active = true
    client
      .fetch<{ track?: string } | null>(`*[_id == $id][0]{track}`, { id: programRef._ref })
      .then((doc) => {
        if (active) setTrack(doc?.track)
      })
    return () => {
      active = false
    }
  }, [client, programRef?._ref])

  // Keep the stored value in sync with the program's track while "Seminarie" is selected.
  useEffect(() => {
    if (toBucket(value) !== 'seminar') return
    const desired = track === 'teens' ? 'teenSeminar' : 'seminar'
    if (value !== desired) onChange(set(desired))
  }, [track, value, onChange])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.currentTarget.value
      if (!next) {
        onChange(unset())
        return
      }
      onChange(set(next === 'seminar' ? (track === 'teens' ? 'teenSeminar' : 'seminar') : next))
    },
    [onChange, track],
  )

  return (
    <Select {...elementProps} value={toBucket(value) ?? ''} onChange={handleChange}>
      <option value="" disabled>
        Kies...
      </option>
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.title}
        </option>
      ))}
    </Select>
  )
}
