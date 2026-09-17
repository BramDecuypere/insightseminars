import type { InsightEvent, Locale, PriceOption } from '@/lib/content/types'
import { isFree, lowestPrice, visibleOptions } from '@/lib/domain/pricing'
import { registrationState } from '@/lib/domain/events'

/**
 * Registration flow context (brief §7.1–7.3). Computed once on the server from
 * the event and passed to the client so both build the same Zod schema and the
 * same steps. Personal data never lives here; only shape and constraints do.
 */

export type FlowKind = 'adult' | 'teen' | 'waitlist' | 'info'

export interface FlowOption {
  /** Stable key: kind + label + amount. Robust to reordering (server rematches). */
  id: string
  kind: PriceOption['kind']
  label: string
  amount: number
  requiresGraduate: boolean
  validUntil?: string
}

export interface FlowContext {
  flow: FlowKind
  eventSlug: string
  eventTitle: string
  /** ISO start datetime, needed for the "18 on the start date" question. */
  startDate: string
  options: FlowOption[]
  free: boolean
  fromPrice: number | null
  hasDeposit: boolean
  depositAmount?: number
  paymentTiming: InsightEvent['paymentTiming']
  paymentDueDate?: string
  allowBankTransfer: boolean
  waitlist: boolean
  /** Program slugs the form must ask "where/when did you take {program}?". */
  prerequisites: string[]
  /** Display names for those prerequisite slugs (for the form question). */
  prerequisiteLabels: Record<string, string>
  ageMin?: number
  ageMax?: number
  /** Adult programs ask the 18+ question; teen programs ask a birth date. */
  asksAdultQuestion: boolean
}

export function optionId(o: PriceOption): string {
  return `${o.kind}:${o.label.nl}:${o.amount}`
}

/** Resolve the flow context from an event (and its program, when adult/teen). */
export function resolveFlow(params: {
  event: InsightEvent
  eventTitle: string
  locale: Locale
  prerequisites?: string[]
  prerequisiteLabels?: Record<string, string>
  ageMin?: number
  ageMax?: number
  allowBankTransfer: boolean
  now?: Date
}): FlowContext {
  const { event, eventTitle, locale, allowBankTransfer } = params
  const now = params.now ?? new Date()
  const state = registrationState(event, now)
  const visible = visibleOptions(event.priceOptions ?? [], now)
  const free = isFree(event.priceOptions ?? [])

  const isTeen = event.type === 'teenSeminar'
  const isInfo = event.type === 'infoSession' || event.type === 'workshop'
  let flow: FlowKind = isTeen ? 'teen' : 'adult'
  if (isInfo) flow = 'info'
  if (state === 'waitlist') flow = 'waitlist'

  const options: FlowOption[] = visible.map((o) => ({
    id: optionId(o),
    kind: o.kind,
    label: locale === 'en' ? o.label.en || o.label.nl : o.label.nl,
    amount: o.amount,
    requiresGraduate: Boolean(o.requiresGraduate),
    validUntil: o.validUntil,
  }))

  return {
    flow,
    eventSlug: event.slug,
    eventTitle,
    startDate: event.start,
    options,
    free,
    fromPrice: lowestPrice(event.priceOptions ?? [], now),
    hasDeposit: typeof event.depositAmount === 'number' && event.depositAmount > 0,
    depositAmount: event.depositAmount,
    paymentTiming: event.paymentTiming,
    paymentDueDate: event.paymentDueDate,
    allowBankTransfer,
    waitlist: state === 'waitlist',
    prerequisites: params.prerequisites ?? [],
    prerequisiteLabels: params.prerequisiteLabels ?? {},
    ageMin: params.ageMin,
    ageMax: params.ageMax,
    asksAdultQuestion: flow === 'adult',
  }
}

/** The ordered step keys for a flow (brief §7.1, §7.2). */
export function stepsFor(ctx: FlowContext): string[] {
  if (ctx.flow === 'waitlist') return ['date', 'you']
  if (ctx.flow === 'teen') {
    const steps = ['date', 'teen', 'guardian', 'consent']
    if (!ctx.free) steps.push('billing')
    steps.push('review')
    return steps
  }
  // adult
  const steps = ['date', 'you', 'agreements']
  if (!ctx.free) steps.push('billing')
  steps.push('review')
  return steps
}
