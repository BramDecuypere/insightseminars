import 'server-only'
import { auth, sheets, type sheets_v4 } from '@googleapis/sheets'
import { env, hasKeys } from '@/lib/env'

/**
 * Google Sheets adapter (brief §8.3). Columns are mapped by HEADER NAME, never
 * by position, so volunteers can freely insert their own columns. Booleans are
 * stored as `ja`/`nee`; timestamps as "YYYY-MM-DD HH:mm" in Brussels time
 * (formatted by the caller). When the service account is not configured, every
 * function logs and no-ops instead of crashing (dev/preview).
 */

export const REGISTRATIONS_TAB = 'Inschrijvingen'
export const INFO_SESSIONS_TAB = 'Infosessies'

/** A row is a plain map keyed by Dutch header name. */
export type SheetRow = Record<string, string | number | boolean | null | undefined>

function configured(): boolean {
  return hasKeys(
    ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID'],
    'Google Sheets',
  )
}

let cached: sheets_v4.Sheets | null = null

function client(): sheets_v4.Sheets {
  if (cached) return cached
  const googleAuth = new auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Env stores the key with escaped newlines (brief §8.3).
      private_key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  cached = sheets({ version: 'v4', auth: googleAuth })
  return cached
}

function toCell(value: SheetRow[string]): string | number {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'ja' : 'nee'
  return value
}

/** Read the header row (row 1) of a tab. */
async function readHeaders(tab: string): Promise<string[]> {
  const res = await client().spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${tab}!1:1`,
  })
  return (res.data.values?.[0] as string[] | undefined) ?? []
}

/** Append one row to a tab, placing each value under its matching header. */
async function appendByHeader(tab: string, row: SheetRow): Promise<void> {
  if (!configured()) {
    console.log(`[v0] (sheets stub) append to ${tab}:`, row)
    return
  }
  const headers = await readHeaders(tab)
  if (headers.length === 0) {
    throw new Error(`[sheets] ${tab} has no header row; cannot map columns`)
  }
  const values = [headers.map((h) => toCell(row[h]))]
  await client().spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  })
}

/** Append a registration to the `Inschrijvingen` tab. */
export async function appendRegistration(row: SheetRow): Promise<void> {
  await appendByHeader(REGISTRATIONS_TAB, row)
}

/** Append an info-session / workshop signup to the `Infosessies` tab. */
export async function appendInfoSessionSignup(row: SheetRow): Promise<void> {
  await appendByHeader(INFO_SESSIONS_TAB, row)
}

export interface FoundRow {
  /** 1-based sheet row number (header is row 1). */
  rowNumber: number
  headers: string[]
  values: SheetRow
}

/** Find a registration by its id. Returns null when not configured or absent. */
export async function findRegistration(id: string): Promise<FoundRow | null> {
  if (!configured()) {
    console.log(`[v0] (sheets stub) find registration ${id}`)
    return null
  }
  const res = await client().spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${REGISTRATIONS_TAB}`,
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  if (rows.length === 0) return null
  const headers = rows[0]
  const idCol = headers.indexOf('registratie_id')
  if (idCol === -1) return null
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i]?.[idCol] === id) {
      const values: SheetRow = {}
      headers.forEach((h, c) => {
        values[h] = rows[i][c] ?? ''
      })
      return { rowNumber: i + 1, headers, values }
    }
  }
  return null
}

/**
 * Read every registration row, mapped by header name. Returns [] when Sheets is
 * not configured (dev/preview). Used by the "send pay links" cron (brief §7.1).
 */
export async function listRegistrations(): Promise<FoundRow[]> {
  if (!configured()) {
    console.log('[v0] (sheets stub) list registrations')
    return []
  }
  const res = await client().spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${REGISTRATIONS_TAB}`,
  })
  const rows = (res.data.values as string[][] | undefined) ?? []
  if (rows.length === 0) return []
  const headers = rows[0]
  const out: FoundRow[] = []
  for (let i = 1; i < rows.length; i += 1) {
    const values: SheetRow = {}
    headers.forEach((h, c) => {
      values[h] = rows[i][c] ?? ''
    })
    out.push({ rowNumber: i + 1, headers, values })
  }
  return out
}

/** Convert a 0-based column index to an A1 letter (A, B, …, AA). */
function columnLetter(index: number): string {
  let n = index
  let out = ''
  do {
    out = String.fromCharCode(65 + (n % 26)) + out
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return out
}

/**
 * Patch specific columns of a registration row by header name. Only the given
 * fields change; volunteer-edited columns are left untouched.
 */
export async function updateRegistration(id: string, patch: SheetRow): Promise<void> {
  if (!configured()) {
    console.log(`[v0] (sheets stub) update registration ${id}:`, patch)
    return
  }
  const found = await findRegistration(id)
  if (!found) {
    console.warn(`[sheets] registration ${id} not found; skipping update`)
    return
  }
  const data: sheets_v4.Schema$ValueRange[] = []
  for (const [header, value] of Object.entries(patch)) {
    const col = found.headers.indexOf(header)
    if (col === -1) {
      console.warn(`[sheets] unknown column "${header}"; skipping`)
      continue
    }
    const cell = `${REGISTRATIONS_TAB}!${columnLetter(col)}${found.rowNumber}`
    data.push({ range: cell, values: [[toCell(value)]] })
  }
  if (data.length === 0) return
  await client().spreadsheets.values.batchUpdate({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  })
}
