import 'server-only'
import { siteUrl } from '@/lib/env'

/**
 * Minimal iCalendar (.ics) builder (brief §7.1, §7.3). Produces a single VEVENT
 * as a UTC-timed calendar file, returned as a base64 attachment for Brevo.
 */

export interface IcsInput {
  uid: string
  start: string | Date
  end: string | Date
  summary: string
  description?: string
  location?: string
  url?: string
}

/** Format a date as UTC in iCal basic form: 20270219T180000Z. */
function toUtcStamp(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Escape text for an iCal value (commas, semicolons, newlines). */
function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Fold lines to 75 octets as the spec requires (keeps strict parsers happy). */
function fold(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = []
  let rest = line
  chunks.push(rest.slice(0, 75))
  rest = rest.slice(75)
  while (rest.length > 0) {
    chunks.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  return chunks.join('\r\n')
}

export function buildIcs(input: IcsInput): string {
  const domain = siteUrl.replace(/^https?:\/\//, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Insight Seminars België//Registratie//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${input.uid}@${domain}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(input.start)}`,
    `DTEND:${toUtcStamp(input.end)}`,
    `SUMMARY:${esc(input.summary)}`,
    input.description ? `DESCRIPTION:${esc(input.description)}` : '',
    input.location ? `LOCATION:${esc(input.location)}` : '',
    input.url ? `URL:${esc(input.url)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.map(fold).join('\r\n')
}

/** Build an .ics and return it as a base64 email attachment. */
export function icsAttachment(input: IcsInput, filename = 'afspraak.ics'): {
  name: string
  content: string
} {
  const ics = buildIcs(input)
  return { name: filename, content: Buffer.from(ics, 'utf8').toString('base64') }
}
