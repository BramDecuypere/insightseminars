import { z } from 'zod'
import { ageOn, isRealDate } from '@/lib/domain/age'
import { isValidEnterpriseNumber } from '@/lib/domain/vat'
import type { FlowContext } from './flow'

/**
 * Shared registration validation (brief §7.1). The SAME schema runs on the
 * client (react-hook-form) and the server action, built from the FlowContext so
 * conditional rules match the visible steps. Error `message` values are stable
 * codes; the UI maps them to `form.errors.*` translations (so no Dutch/English
 * text is baked into validation).
 */

const YESNO = ['ja', 'nee'] as const
const yesNo = z.enum(YESNO)

/** Optional-looking base: every field exists so react-hook-form stays controlled. */
const base = z.object({
  // Anti-spam (brief §7.1): honeypot must stay empty; loadedAt drives the 3s trap.
  website: z.string().max(0, 'honeypot').optional().default(''),
  formLoadedAt: z.number().optional().default(0),

  // Step: date & price.
  priceOptionId: z.string().optional().default(''),
  auditHistory: z.string().optional().default(''),
  prerequisiteHistory: z.record(z.string(), z.string()).optional().default({}),

  // Step: your details (adult) / teen + guardian.
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  street: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  city: z.string().optional().default(''),
  country: z.string().optional().default('België'),
  isAdult: z.union([yesNo, z.literal('')]).optional().default(''),

  // Teen.
  teenFirstName: z.string().optional().default(''),
  teenLastName: z.string().optional().default(''),
  teenEmail: z.string().optional().default(''),
  birthDay: z.coerce.number().optional().default(0),
  birthMonth: z.coerce.number().optional().default(0),
  birthYear: z.coerce.number().optional().default(0),

  // Guardian.
  guardianFirstName: z.string().optional().default(''),
  guardianLastName: z.string().optional().default(''),
  guardianEmail: z.string().optional().default(''),
  guardianPhone: z.string().optional().default(''),
  relationship: z.union([z.enum(['parent', 'guardian']), z.literal('')]).optional().default(''),

  // Consent (teen under 18).
  consentMethod: z.union([z.enum(['sign', 'upload']), z.literal('')]).optional().default(''),
  consentTypedName: z.string().optional().default(''),
  consentAccepted: z.boolean().optional().default(false),
  // PNG data URL from signature_pad (online signing).
  consentSignature: z.string().optional().default(''),
  // Filename of an uploaded signed form (the bytes travel separately as a File).
  consentUploadName: z.string().optional().default(''),

  // Step: emergency & agreements.
  emergencyName: z.string().optional().default(''),
  emergencyPhone: z.string().optional().default(''),
  photoConsent: z.union([yesNo, z.literal('')]).optional().default(''),
  whatsapp: z.union([yesNo, z.literal('')]).optional().default(''),
  intention: z.string().optional().default(''),
  referral: z.string().optional().default(''),

  // Step: payment & invoicing.
  payChoice: z.enum(['volledig', 'voorschot']).optional().default('volledig'),
  earlierDeposit: yesNo.optional().default('nee'),
  earlierDepositAmount: z.string().optional().default(''),
  sponsoring: yesNo.optional().default('nee'),
  sponsoringAmount: z.string().optional().default(''),
  sponsor: z.string().optional().default(''),
  invoiceNeeded: yesNo.optional().default('nee'),
  invoiceCompany: z.string().optional().default(''),
  invoiceVat: z.string().optional().default(''),
  invoiceAddress: z.string().optional().default(''),
  invoiceSameAddress: z.boolean().optional().default(true),
  invoiceEmail: z.string().optional().default(''),
  peppol: z.union([z.enum(['ja', 'nee', 'unknown']), z.literal('')]).optional().default(''),
  peppolId: z.string().optional().default(''),

  // Step: review.
  terms: z.boolean().optional().default(false),
})

export type RegistrationInput = z.infer<typeof base>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\d][\d\s()/.-]{6,}$/
const POSTAL_RE = /^\d{4}$/

function req(ctx: z.RefinementCtx, value: string, path: string, code = 'required') {
  if (!value || value.trim() === '') {
    ctx.addIssue({ code: 'custom', message: code, path: [path] })
    return false
  }
  return true
}

function amountOk(value: string): boolean {
  if (!value) return false
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) && n > 0
}

/** Build the schema for a specific flow. Cross-field rules follow §6 and §7. */
export function makeRegistrationSchema(ctx: FlowContext) {
  return base.superRefine((data, issue) => {
    // Honeypot.
    if (data.website && data.website.length > 0) {
      issue.addIssue({ code: 'custom', message: 'honeypot', path: ['website'] })
    }

    // Waitlist only needs contact identity.
    const isWaitlist = ctx.flow === 'waitlist'
    const isTeen = ctx.flow === 'teen'

    // --- Step: date & price (skipped for free events with no options) ---
    if (!isWaitlist && ctx.options.length > 0) {
      req(issue, data.priceOptionId, 'priceOptionId', 'choose')
      const chosen = ctx.options.find((o) => o.id === data.priceOptionId)
      if (chosen?.requiresGraduate) {
        req(issue, data.auditHistory, 'auditHistory')
      }
    }
    for (const slug of ctx.prerequisites) {
      if (!data.prerequisiteHistory?.[slug]?.trim()) {
        issue.addIssue({ code: 'custom', message: 'required', path: ['prerequisiteHistory', slug] })
      }
    }

    // --- Identity ---
    if (isTeen) {
      req(issue, data.teenFirstName, 'teenFirstName')
      req(issue, data.teenLastName, 'teenLastName')
      // Birth date must be a real calendar date and within the age range.
      const birth = { day: data.birthDay, month: data.birthMonth, year: data.birthYear }
      if (!data.birthDay || !data.birthMonth || !data.birthYear) {
        issue.addIssue({ code: 'custom', message: 'required', path: ['birthDay'] })
      } else if (!isRealDate(birth)) {
        issue.addIssue({ code: 'custom', message: 'date', path: ['birthDay'] })
      } else {
        const age = ageOn(birth, ctx.startDate)
        const min = ctx.ageMin ?? 0
        const max = ctx.ageMax ?? 120
        if (age < min || age > max) {
          issue.addIssue({ code: 'custom', message: 'age', path: ['birthDay'] })
        }
      }
      if (data.teenEmail && !EMAIL_RE.test(data.teenEmail)) {
        issue.addIssue({ code: 'custom', message: 'email', path: ['teenEmail'] })
      }
      // Guardian details (always collected for teens).
      req(issue, data.guardianFirstName, 'guardianFirstName')
      req(issue, data.guardianLastName, 'guardianLastName')
      if (!EMAIL_RE.test(data.guardianEmail)) {
        issue.addIssue({ code: 'custom', message: 'email', path: ['guardianEmail'] })
      }
      if (!PHONE_RE.test(data.guardianPhone)) {
        issue.addIssue({ code: 'custom', message: 'phone', path: ['guardianPhone'] })
      }
      req(issue, data.relationship, 'relationship', 'choose')
    } else {
      req(issue, data.firstName, 'firstName')
      req(issue, data.lastName, 'lastName')
      if (!EMAIL_RE.test(data.email)) {
        issue.addIssue({ code: 'custom', message: 'email', path: ['email'] })
      }
      if (!isWaitlist) {
        if (!PHONE_RE.test(data.phone)) {
          issue.addIssue({ code: 'custom', message: 'phone', path: ['phone'] })
        }
        req(issue, data.street, 'street')
        if (!POSTAL_RE.test(data.postalCode) && (data.country === 'België' || !data.country)) {
          issue.addIssue({ code: 'custom', message: 'postalCode', path: ['postalCode'] })
        } else {
          req(issue, data.postalCode, 'postalCode')
        }
        req(issue, data.city, 'city')
        if (ctx.asksAdultQuestion) req(issue, data.isAdult, 'isAdult', 'choose')
      }
    }

    // --- Emergency & agreements (adult only; teens carry guardian as contact) ---
    if (ctx.flow === 'adult') {
      req(issue, data.emergencyName, 'emergencyName')
      if (!PHONE_RE.test(data.emergencyPhone)) {
        issue.addIssue({ code: 'custom', message: 'phone', path: ['emergencyPhone'] })
      }
      req(issue, data.photoConsent, 'photoConsent', 'choose')
      req(issue, data.whatsapp, 'whatsapp', 'choose')
    }

    // --- Consent (teen under 18 on the start date) ---
    if (isTeen && data.birthDay && data.birthMonth && data.birthYear) {
      const age = ageOn(
        { day: data.birthDay, month: data.birthMonth, year: data.birthYear },
        ctx.startDate,
      )
      if (age < 18) {
        if (data.consentMethod === '') {
          issue.addIssue({ code: 'custom', message: 'consent', path: ['consentMethod'] })
        }
        // Online signing needs both a drawn signature and a typed name.
        if (data.consentMethod === 'sign') {
          if (!data.consentSignature) {
            issue.addIssue({ code: 'custom', message: 'consent', path: ['consentSignature'] })
          }
          req(issue, data.consentTypedName, 'consentTypedName')
        }
        // Uploading needs a chosen file.
        if (data.consentMethod === 'upload' && !data.consentUploadName) {
          issue.addIssue({ code: 'custom', message: 'consent', path: ['consentUploadName'] })
        }
        if (!data.consentAccepted) {
          issue.addIssue({ code: 'custom', message: 'consent', path: ['consentAccepted'] })
        }
      }
    }

    // --- Payment & invoicing (paid, non-waitlist flows) ---
    if (!isWaitlist && !ctx.free) {
      if (data.earlierDeposit === 'ja' && !amountOk(data.earlierDepositAmount)) {
        issue.addIssue({ code: 'custom', message: 'amount', path: ['earlierDepositAmount'] })
      }
      if (data.sponsoring === 'ja' && !amountOk(data.sponsoringAmount)) {
        issue.addIssue({ code: 'custom', message: 'amount', path: ['sponsoringAmount'] })
      }
      if (data.invoiceNeeded === 'ja') {
        req(issue, data.invoiceCompany, 'invoiceCompany')
        if (!isValidEnterpriseNumber(data.invoiceVat)) {
          issue.addIssue({ code: 'custom', message: 'vat', path: ['invoiceVat'] })
        }
        if (!data.invoiceSameAddress) req(issue, data.invoiceAddress, 'invoiceAddress')
        if (!EMAIL_RE.test(data.invoiceEmail)) {
          issue.addIssue({ code: 'custom', message: 'email', path: ['invoiceEmail'] })
        }
        req(issue, data.peppol, 'peppol', 'choose')
      }
    }

    // --- Review (terms) ---
    if (!isWaitlist) {
      if (!data.terms) {
        issue.addIssue({ code: 'custom', message: 'terms', path: ['terms'] })
      }
    }
  })
}

/** Info-session / workshop signup (brief §7.3). Single step. */
export const infoSessionSchema = z.object({
  website: z.string().max(0, 'honeypot').optional().default(''),
  formLoadedAt: z.number().optional().default(0),
  firstName: z.string().min(1, 'required'),
  email: z.string().regex(EMAIL_RE, 'email'),
  referral: z.string().optional().default(''),
  newsletter: z.boolean().optional().default(false),
})

export type InfoSessionInput = z.infer<typeof infoSessionSchema>
