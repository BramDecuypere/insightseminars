import 'server-only'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { EmailAttachment } from '@/lib/integrations/brevo'

/**
 * One-page parental consent record (brief §7.2), built with pdf-lib and
 * returned as a base64 email attachment. The signed image is embedded when the
 * guardian signs online; for an uploaded form we print "zie bijlage" and attach
 * the upload separately. Files are never stored on the server (brief §7.2).
 */

export interface ConsentPdfInput {
  orgName: string
  event: string
  dates: string
  teenName: string
  teenBirthDate: string
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  relationship: string
  consentText: string
  consentVersion: string
  typedName: string
  /** PNG data URL from signature_pad, when signed online. */
  signatureDataUrl?: string
  /** Brussels-time timestamp string. */
  timestamp: string
}

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 56
const INK = rgb(0.11, 0.14, 0.17)
const MUTED = rgb(0.38, 0.42, 0.46)

/** Greedy word-wrap to a pixel width for a given font/size. */
function wrapText(text: string, font: import('pdf-lib').PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
  }
  return lines
}

export async function buildConsentPdf(input: ConsentPdfInput): Promise<EmailAttachment> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([A4.width, A4.height])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const contentWidth = A4.width - MARGIN * 2
  let y = A4.height - MARGIN

  const drawLine = (text: string, f = font, size = 11, color = INK) => {
    page.drawText(text, { x: MARGIN, y, size, font: f, color })
    y -= size + 6
  }
  const gap = (n = 6) => {
    y -= n
  }

  drawLine('Toestemming ouder / wettelijke voogd', bold, 16)
  drawLine(input.orgName, font, 11, MUTED)
  gap(10)

  const field = (label: string, value: string) => {
    page.drawText(label, { x: MARGIN, y, size: 9, font: bold, color: MUTED })
    y -= 13
    for (const line of wrapText(value || '-', font, 11, contentWidth)) drawLine(line)
    gap(4)
  }

  field('Activiteit', `${input.event} (${input.dates})`)
  field('Deelnemer', `${input.teenName} — geboortedatum ${input.teenBirthDate}`)
  field(
    'Ouder / voogd',
    `${input.guardianName} (${input.relationship}) — ${input.guardianEmail} · ${input.guardianPhone}`,
  )

  gap(6)
  page.drawText(`Toestemmingstekst (versie ${input.consentVersion})`, {
    x: MARGIN,
    y,
    size: 9,
    font: bold,
    color: MUTED,
  })
  y -= 15
  for (const line of wrapText(input.consentText, font, 10, contentWidth)) drawLine(line, font, 10)

  gap(14)
  drawLine('Ondertekening', bold, 11)
  if (input.signatureDataUrl) {
    try {
      const base64 = input.signatureDataUrl.replace(/^data:image\/png;base64,/, '')
      const png = await doc.embedPng(Buffer.from(base64, 'base64'))
      const maxW = 240
      const scale = Math.min(1, maxW / png.width)
      const w = png.width * scale
      const h = png.height * scale
      y -= h
      page.drawImage(png, { x: MARGIN, y, width: w, height: h })
      y -= 6
    } catch (err) {
      console.error('[pdf] could not embed signature:', err)
      drawLine('(handtekening kon niet worden ingesloten)', font, 10, MUTED)
    }
  } else {
    drawLine('Zie bijlage (geüpload formulier).', font, 10, MUTED)
  }

  gap(6)
  if (input.typedName) drawLine(`Getypte naam: ${input.typedName}`, font, 10)
  drawLine(`Ondertekend op: ${input.timestamp} (Brussel)`, font, 10, MUTED)

  const bytes = await doc.save()
  return {
    name: `toestemming-${input.teenName.replace(/\s+/g, '-').toLowerCase() || 'deelnemer'}.pdf`,
    content: Buffer.from(bytes).toString('base64'),
  }
}
