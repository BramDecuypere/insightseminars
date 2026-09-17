import type { ReactElement } from 'react'
import {
  DetailRows,
  EmailHeading,
  EmailLocale,
  EmailShell,
  Paragraph,
  PayButton,
} from './shell'

/**
 * Registration email content (brief §13.9), Dutch and English. Each builder
 * returns a subject plus a React element rendered to HTML/text by lib/emails.
 * Copy stays close to the markup so translators can see both together.
 */

export interface RegistrationEmailData {
  firstName: string
  event: string
  dates: string
  schedule?: string
  venue?: string
  address?: string
  facilitators?: string
  language?: string
  amount?: string
  registrationId: string
  emailInfo?: string
  // Payment specifics.
  iban?: string
  accountHolder?: string
  ogm?: string
  dueDate?: string
  payUrl?: string
  remaining?: string
  paid?: string
  allowBankTransfer?: boolean
  // Invoice.
  invoiceCompany?: string
  // Teen variant.
  teenFirstName?: string
  guardianFirstName?: string
}

export interface EmailResult {
  subject: string
  element: ReactElement
}

function t(nl: string, en: string, locale: EmailLocale): string {
  return locale === 'en' ? en : nl
}

function invoiceNote(data: RegistrationEmailData, locale: EmailLocale): string | null {
  if (!data.invoiceCompany) return null
  return t(
    `Je vroeg een factuur aan op naam van ${data.invoiceCompany}. Die ontvang je apart.`,
    `You requested an invoice for ${data.invoiceCompany}. It will follow separately.`,
    locale,
  )
}

function eventDetailRows(data: RegistrationEmailData, locale: EmailLocale) {
  const rows: { label: string; value: string }[] = []
  rows.push({ label: t('Wanneer', 'When', locale), value: data.dates })
  if (data.schedule) rows.push({ label: t('Uren', 'Hours', locale), value: data.schedule })
  if (data.venue) {
    rows.push({
      label: t('Waar', 'Where', locale),
      value: [data.venue, data.address].filter(Boolean).join(', '),
    })
  }
  if (data.facilitators)
    rows.push({ label: t('Facilitator', 'Facilitator', locale), value: data.facilitators })
  if (data.language) rows.push({ label: t('Taal', 'Language', locale), value: data.language })
  if (data.amount) rows.push({ label: t('Betaald', 'Paid', locale), value: data.amount })
  rows.push({ label: t('Referentie', 'Reference', locale), value: data.registrationId })
  return rows
}

export function registrationConfirmed(
  data: RegistrationEmailData,
  locale: EmailLocale,
): EmailResult {
  const subject = t(
    `Je plaats voor ${data.event} is bevestigd`,
    `Your place for ${data.event} is confirmed`,
    locale,
  )
  const isTeen = Boolean(data.teenFirstName)
  const note = invoiceNote(data, locale)
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>
          {t('Je inschrijving is bevestigd', 'Your registration is confirmed', locale)}
        </EmailHeading>
        {isTeen ? (
          <Paragraph>
            {t(
              `Dag ${data.guardianFirstName}, de inschrijving van ${data.teenFirstName} voor ${data.event} is bevestigd.`,
              `Hi ${data.guardianFirstName}, the registration of ${data.teenFirstName} for ${data.event} is confirmed.`,
              locale,
            )}
          </Paragraph>
        ) : (
          <>
            <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
            <Paragraph>
              {t(
                `Je betaling is goed ontvangen. Je plaats voor ${data.event} is bevestigd.`,
                `We received your payment. Your place for ${data.event} is confirmed.`,
                locale,
              )}
            </Paragraph>
          </>
        )}
        <DetailRows rows={eventDetailRows(data, locale)} />
        {data.emailInfo && <Paragraph>{data.emailInfo}</Paragraph>}
        {note && <Paragraph>{note}</Paragraph>}
        <Paragraph>
          {t(
            'Heb je nog een vraag? Beantwoord gewoon deze mail. Tot dan!',
            'Any questions? Just reply to this email. See you there!',
            locale,
          )}
        </Paragraph>
      </EmailShell>
    ),
  }
}

export function registrationBankTransfer(
  data: RegistrationEmailData,
  locale: EmailLocale,
): EmailResult {
  const subject = t(
    `Nog één stap voor je inschrijving voor ${data.event}`,
    `One more step for your registration for ${data.event}`,
    locale,
  )
  const note = invoiceNote(data, locale)
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Bijna klaar', 'Almost there', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>
          {t(
            `Bedankt voor je inschrijving voor ${data.event} (${data.dates}). Je inschrijving is definitief zodra we je betaling ontvangen. Maak het bedrag over vóór ${data.dueDate}:`,
            `Thanks for registering for ${data.event} (${data.dates}). Your registration is final once we receive your payment. Please transfer the amount before ${data.dueDate}:`,
            locale,
          )}
        </Paragraph>
        <DetailRows
          rows={[
            { label: t('Bedrag', 'Amount', locale), value: data.amount ?? '' },
            { label: t('Rekeningnummer', 'Account number', locale), value: data.iban ?? '' },
            { label: t('Op naam van', 'Account holder', locale), value: data.accountHolder ?? '' },
            {
              label: t('Gestructureerde mededeling', 'Structured reference', locale),
              value: data.ogm ?? '',
            },
          ]}
        />
        <Paragraph>
          {t(
            'Gebruik zeker de gestructureerde mededeling, zo kunnen we je betaling snel koppelen.',
            'Please use the structured reference so we can match your payment quickly.',
            locale,
          )}
        </Paragraph>
        {note && <Paragraph>{note}</Paragraph>}
      </EmailShell>
    ),
  }
}

export function registrationPayLater(
  data: RegistrationEmailData,
  locale: EmailLocale,
): EmailResult {
  const subject = t(
    `Je inschrijving voor ${data.event} is ontvangen`,
    `Your registration for ${data.event} is received`,
    locale,
  )
  const note = invoiceNote(data, locale)
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Je plaats is gereserveerd', 'Your place is reserved', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>
          {t(
            `Bedankt voor je inschrijving voor ${data.event} (${data.dates}). Je plaats is gereserveerd. Betaal uiterlijk op ${data.dueDate} via deze beveiligde link:`,
            `Thanks for registering for ${data.event} (${data.dates}). Your place is reserved. Please pay by ${data.dueDate} via this secure link:`,
            locale,
          )}
        </Paragraph>
        {data.payUrl && (
          <PayButton href={data.payUrl} label={t('Betalen', 'Pay now', locale)} />
        )}
        {data.allowBankTransfer && data.iban && (
          <Paragraph>
            {t(
              `Liever overschrijven? Maak ${data.amount} over naar ${data.iban} met gestructureerde mededeling ${data.ogm}.`,
              `Prefer a bank transfer? Transfer ${data.amount} to ${data.iban} with structured reference ${data.ogm}.`,
              locale,
            )}
          </Paragraph>
        )}
        {note && <Paragraph>{note}</Paragraph>}
      </EmailShell>
    ),
  }
}

export function paymentCheck(data: RegistrationEmailData, locale: EmailLocale): EmailResult {
  const subject = t(
    `We hebben je inschrijving voor ${data.event} ontvangen`,
    `We received your registration for ${data.event}`,
    locale,
  )
  const note = invoiceNote(data, locale)
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Bedankt voor je inschrijving', 'Thanks for registering', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>
          {t(
            `Bedankt voor je inschrijving voor ${data.event} (${data.dates}). Je gaf aan dat je al een voorschot betaalde of gesponsord wordt. We controleren dat en sturen je daarna een betaallink voor het resterende bedrag. Je hoeft nu niets te doen.`,
            `Thanks for registering for ${data.event} (${data.dates}). You indicated that you already paid a deposit or are being sponsored. We will check this and then send you a payment link for the remaining amount. You do not need to do anything now.`,
            locale,
          )}
        </Paragraph>
        {note && <Paragraph>{note}</Paragraph>}
      </EmailShell>
    ),
  }
}

export function depositReceived(data: RegistrationEmailData, locale: EmailLocale): EmailResult {
  const subject = t(
    `Je voorschot voor ${data.event} is ontvangen`,
    `Your deposit for ${data.event} is received`,
    locale,
  )
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Je voorschot is ontvangen', 'Your deposit is received', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>
          {t(
            `We ontvingen je voorschot van ${data.paid}. Je plaats voor ${data.event} is gereserveerd. Het resterende bedrag van ${data.remaining} betaal je uiterlijk op ${data.dueDate} via deze link:`,
            `We received your deposit of ${data.paid}. Your place for ${data.event} is reserved. Pay the remaining ${data.remaining} by ${data.dueDate} via this link:`,
            locale,
          )}
        </Paragraph>
        {data.payUrl && <PayButton href={data.payUrl} label={t('Betalen', 'Pay now', locale)} />}
      </EmailShell>
    ),
  }
}

export function payLink(data: RegistrationEmailData, locale: EmailLocale): EmailResult {
  const subject = t(`Je betaallink voor ${data.event}`, `Your payment link for ${data.event}`, locale)
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Je betaallink', 'Your payment link', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>
          {t(
            `Nog te betalen voor ${data.event}: ${data.remaining}. Betalen kan via deze beveiligde link:`,
            `Still to pay for ${data.event}: ${data.remaining}. You can pay via this secure link:`,
            locale,
          )}
        </Paragraph>
        {data.payUrl && <PayButton href={data.payUrl} label={t('Betalen', 'Pay now', locale)} />}
      </EmailShell>
    ),
  }
}

export function waitlist(data: RegistrationEmailData, locale: EmailLocale): EmailResult {
  const subject = t(
    `Je staat op de wachtlijst voor ${data.event}`,
    `You are on the waiting list for ${data.event}`,
    locale,
  )
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Je staat op de wachtlijst', 'You are on the waiting list', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>
          {t(
            `${data.event} (${data.dates}) is volzet, maar je staat nu op de wachtlijst. Komt er een plaats vrij, dan contacteren we je meteen. Je hoeft nu nog niets te betalen.`,
            `${data.event} (${data.dates}) is full, but you are now on the waiting list. If a place opens up, we will contact you right away. You do not need to pay anything yet.`,
            locale,
          )}
        </Paragraph>
      </EmailShell>
    ),
  }
}

export interface InfoSessionEmailData {
  firstName: string
  event: string
  date: string
  time: string
  meetingUrl: string
}

export function infoSessionConfirmed(
  data: InfoSessionEmailData,
  locale: EmailLocale,
): EmailResult {
  const subject = t(
    `Je bent ingeschreven voor ${data.event}`,
    `You are registered for ${data.event}`,
    locale,
  )
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale={locale}>
        <EmailHeading>{t('Je bent ingeschreven', 'You are registered', locale)}</EmailHeading>
        <Paragraph>{t(`Dag ${data.firstName},`, `Hi ${data.firstName},`, locale)}</Paragraph>
        <Paragraph>{t('Fijn dat je erbij bent!', 'Great to have you!', locale)}</Paragraph>
        <DetailRows
          rows={[
            { label: t('Wanneer', 'When', locale), value: `${data.date}, ${data.time}` },
            { label: t('Link', 'Link', locale), value: data.meetingUrl },
          ]}
        />
        <Paragraph>
          {t(
            'Tip: klik een paar minuten vooraf op de link, dan kan je rustig je camera en geluid testen. In de bijlage vind je een uitnodiging voor je agenda.',
            'Tip: click the link a few minutes early so you can calmly test your camera and sound. The attachment holds a calendar invite.',
            locale,
          )}
        </Paragraph>
      </EmailShell>
    ),
  }
}

export interface InternalEmailData {
  event: string
  name: string
  status: string
  fields: { label: string; value: string }[]
  invoice?: { company: string; peppol: string }
}

/** Internal notification, always Dutch (brief §13.9). */
export function internalRegistration(data: InternalEmailData): EmailResult {
  const subject = `Nieuwe inschrijving: ${data.event}, ${data.name} (${data.status})`
  return {
    subject,
    element: (
      <EmailShell preview={subject} locale="nl">
        <EmailHeading>Nieuwe inschrijving</EmailHeading>
        {data.invoice && (
          <Paragraph>
            {`Factuur gevraagd (Peppol: ${data.invoice.peppol}) — ${data.invoice.company}`}
          </Paragraph>
        )}
        <DetailRows rows={data.fields} />
        <Paragraph>Alle inschrijvingen staan in de Google Sheet.</Paragraph>
      </EmailShell>
    ),
  }
}
