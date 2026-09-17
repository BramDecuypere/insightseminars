import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

/**
 * Sanity revalidation webhook (brief §8.1). Sanity posts {_type} on publish and
 * delete; we verify the signature with SANITY_REVALIDATE_SECRET and bust the
 * `sanity:<type>` tag so volunteers see their change on the next page load.
 * No defineLive/SanityLive (§2).
 */
type WebhookPayload = { _type?: string }

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    revalidateTag(`sanity:${body._type}`, { expire: 0 })

    return NextResponse.json({ revalidated: true, tag: `sanity:${body._type}`, now: Date.now() })
  } catch (err) {
    console.error('[v0] revalidate webhook error:', err)
    return new NextResponse('Error revalidating', { status: 500 })
  }
}
