import { getEventBySlug, getProgramBySlug, getVenueById, pick } from '@/lib/content'
import type { Locale } from '@/lib/content/types'
import { buildIcs } from '@/lib/integrations/ics'

/**
 * Public "add to calendar" file for an event (brief §7.1). Calendar details of
 * a public event are not sensitive, so this needs no token. Reads the event
 * from the CMS and returns a single VEVENT as an .ics download.
 */

export const runtime = 'nodejs'

type Params = { params: Promise<{ slug: string }> }

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params
  const locale = (new URL(req.url).searchParams.get('locale') === 'en' ? 'en' : 'nl') as Locale

  const event = await getEventBySlug(slug)
  if (!event) return new Response('Not found', { status: 404 })

  let title = event.title ? pick(event.title, locale) : ''
  if (!title && event.programSlug) {
    const program = await getProgramBySlug(event.programSlug)
    if (program) title = pick(program.title, locale)
  }
  if (!title) title = event.slug

  const venue = event.venueId ? await getVenueById(event.venueId) : null
  const location = venue
    ? [venue.name, venue.street, `${venue.postalCode ?? ''} ${venue.city ?? ''}`.trim()]
        .filter(Boolean)
        .join(', ')
    : undefined

  const ics = buildIcs({
    uid: `event-${event.slug}`,
    start: event.start,
    end: event.end,
    summary: title,
    location,
  })

  return new Response(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${event.slug}.ics"`,
      'cache-control': 'public, max-age=3600',
    },
  })
}
