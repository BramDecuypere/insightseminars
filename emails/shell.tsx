import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'

/**
 * Shared email chrome (brief §13.9): white background, the wordmark on an
 * avondblauw strip at the top, and the Insight team signature at the bottom.
 * All styling is inline because email clients ignore stylesheets.
 */

const AVONDBLAUW = '#211E55'
const INKT = '#1C1E33'
const LEISTEEN = '#575C75'
const LIJN = '#DADCE8'
const FONT =
  "'Proza Libre', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"

export type EmailLocale = 'nl' | 'en'

const SIGN_OFF: Record<EmailLocale, string> = {
  nl: 'Het team van Insight Seminars België',
  en: 'The Insight Seminars België team',
}

export function EmailShell({
  preview,
  locale,
  children,
}: {
  preview: string
  locale: EmailLocale
  children: ReactNode
}) {
  return (
    <Html lang={locale === 'nl' ? 'nl-BE' : 'en'}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#F2F3F8', margin: 0, padding: 0, fontFamily: FONT }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>
          <Section style={{ backgroundColor: AVONDBLAUW, padding: '24px 32px' }}>
            <Text
              style={{
                margin: 0,
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '0.01em',
              }}
            >
              Insight Seminars België
            </Text>
          </Section>
          <Section style={{ padding: '32px' }}>{children}</Section>
          <Hr style={{ borderColor: LIJN, margin: '0 32px' }} />
          <Section style={{ padding: '24px 32px' }}>
            <Text style={{ margin: 0, color: LEISTEEN, fontSize: '14px', lineHeight: 1.6 }}>
              {SIGN_OFF[locale]}
              <br />
              <Link href="https://insightseminars.be" style={{ color: INKT }}>
                insightseminars.be
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text style={{ margin: '0 0 16px', color: INKT, fontSize: '16px', lineHeight: 1.6 }}>
      {children}
    </Text>
  )
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{ margin: '0 0 20px', color: INKT, fontSize: '22px', fontWeight: 800 }}
    >
      {children}
    </Heading>
  )
}

/** A label/value detail block ("Wanneer: 19–21 februari 2027"). */
export function DetailRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 20px' }}>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td
              style={{
                padding: '4px 12px 4px 0',
                color: LEISTEEN,
                fontSize: '15px',
                verticalAlign: 'top',
                whiteSpace: 'nowrap',
              }}
            >
              {r.label}
            </td>
            <td style={{ padding: '4px 0', color: INKT, fontSize: '15px', fontWeight: 600 }}>
              {r.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function PayButton({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ margin: '8px 0 24px' }}>
      <Link
        href={href}
        style={{
          backgroundColor: '#F4B223',
          border: '1px solid #C98A00',
          color: INKT,
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {label}
      </Link>
    </Section>
  )
}
