/**
 * Money maths for registration (brief §6.12). All amounts are euros (numbers
 * with up to 2 decimals). The registrant always sees ONE clear amount and ONE
 * button, so these helpers reduce everything to "pay now" and "still open".
 */

export interface AmountsInput {
  /** The recomputed event price for the chosen option. */
  price: number
  /** 'volledig' (full) or 'voorschot' (deposit). */
  payChoice: 'volledig' | 'voorschot'
  /** The event's deposit amount, when it offers one. */
  depositAmount?: number
  /** Self-declared earlier deposit (never auto-deducted online). */
  earlierDeposit?: number
  /** Self-declared sponsoring (never auto-deducted online). */
  sponsoring?: number
}

export interface Amounts {
  price: number
  /** Amount to charge in an online payment right now (0 when nothing is due now). */
  payNow: number
  /** Outstanding balance recorded in the sheet at creation (openstaand_eur). */
  outstanding: number
  /** True when a deposit/sponsoring was declared: no payment starts (te_controleren). */
  declaredCredit: boolean
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Resolve the amounts for a submission (§6.12). When the registrant declares an
 * earlier deposit or sponsoring, nothing is charged now and the row goes to
 * `te_controleren`; a volunteer verifies and fills `openstaand_eur` later.
 */
export function computeAmounts(input: AmountsInput): Amounts {
  const price = round2(Math.max(0, input.price))
  const earlier = round2(Math.max(0, input.earlierDeposit ?? 0))
  const sponsoring = round2(Math.max(0, input.sponsoring ?? 0))
  const declaredCredit = earlier > 0 || sponsoring > 0

  if (price === 0) {
    return { price: 0, payNow: 0, outstanding: 0, declaredCredit: false }
  }

  if (declaredCredit) {
    // Self-declared amounts are verified by a human; charge nothing online now.
    const outstanding = round2(Math.max(0, price - earlier - sponsoring))
    return { price, payNow: 0, outstanding, declaredCredit: true }
  }

  const useDeposit =
    input.payChoice === 'voorschot' &&
    typeof input.depositAmount === 'number' &&
    input.depositAmount > 0 &&
    input.depositAmount < price

  if (useDeposit) {
    const deposit = round2(input.depositAmount as number)
    return { price, payNow: deposit, outstanding: round2(price - deposit), declaredCredit: false }
  }

  return { price, payNow: price, outstanding: 0, declaredCredit: false }
}

/** Format an amount as a Mollie value string ("475.00"). */
export function toMollieValue(euros: number): string {
  return round2(euros).toFixed(2)
}
