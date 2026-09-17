/**
 * Fails the build when messages/nl.json and messages/en.json have diverging
 * key sets (brief Prompt 8). Compares the full nested key paths in both
 * directions so a key added to one locale but not the other breaks CI.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const MESSAGES_DIR = join(process.cwd(), 'messages')
const LOCALES = ['nl', 'en'] as const

type Json = Record<string, unknown>

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix]
  }
  const entries = Object.entries(value as Json)
  if (entries.length === 0) {
    return [prefix]
  }
  return entries.flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

function load(locale: string): Json {
  const path = join(MESSAGES_DIR, `${locale}.json`)
  return JSON.parse(readFileSync(path, 'utf8')) as Json
}

function main() {
  const keysByLocale = new Map<string, Set<string>>()
  for (const locale of LOCALES) {
    keysByLocale.set(locale, new Set(flattenKeys(load(locale))))
  }

  const [base, ...rest] = LOCALES
  const baseKeys = keysByLocale.get(base)!
  let hasError = false

  for (const other of rest) {
    const otherKeys = keysByLocale.get(other)!
    const missingInOther = [...baseKeys].filter((k) => !otherKeys.has(k)).sort()
    const missingInBase = [...otherKeys].filter((k) => !baseKeys.has(k)).sort()

    if (missingInOther.length > 0) {
      hasError = true
      console.error(`\nKeys present in ${base}.json but missing in ${other}.json:`)
      for (const k of missingInOther) console.error(`  - ${k}`)
    }
    if (missingInBase.length > 0) {
      hasError = true
      console.error(`\nKeys present in ${other}.json but missing in ${base}.json:`)
      for (const k of missingInBase) console.error(`  - ${k}`)
    }
  }

  if (hasError) {
    console.error('\ni18n key parity check failed: nl.json and en.json must have identical keys.')
    process.exit(1)
  }

  console.log(`i18n key parity OK: ${baseKeys.size} keys match across ${LOCALES.join(', ')}.`)
}

main()
