import { describe, expect, it } from 'vitest'
import { buildLegacyRedirects, resolveLegacyPath } from './legacy-redirects'

describe('resolveLegacyPath', () => {
  it('maps a known Dutch path with and without a trailing slash', () => {
    expect(resolveLegacyPath('/insight-1')).toBe('/nl/seminars/insight-1?from=nl')
    expect(resolveLegacyPath('/insight-1/')).toBe('/nl/seminars/insight-1?from=nl')
  })

  it('maps the same slug under /en to the English destination', () => {
    expect(resolveLegacyPath('/en/aanmelden-belgie-2/')).toBe('/en/calendar?from=nl')
    expect(resolveLegacyPath('/en/insight-1')).toBe('/en/seminars/insight-1?from=nl')
  })

  it('maps the old home to the localized home', () => {
    expect(resolveLegacyPath('/')).toBe('/nl?from=nl')
    expect(resolveLegacyPath('/en')).toBe('/en?from=nl')
    expect(resolveLegacyPath('/en/')).toBe('/en?from=nl')
  })

  it('places ?from=nl before a hash fragment', () => {
    expect(resolveLegacyPath('/team-belgie')).toBe('/nl/over-insight?from=nl#team')
    expect(resolveLegacyPath('/en/donate')).toBe('/en/about-insight?from=nl#support')
  })

  it('sends the seminars overview and teens aliases to the right pages', () => {
    expect(resolveLegacyPath('/de-seminars/')).toBe('/nl/seminars?from=nl')
    expect(resolveLegacyPath('/aanmelden-teens/')).toBe('/nl/tieners?from=nl')
    expect(resolveLegacyPath('/en/teens')).toBe('/en/teens?from=nl')
  })

  it('folds blog posts back to the home page', () => {
    expect(resolveLegacyPath('/blog/')).toBe('/nl?from=nl')
    expect(resolveLegacyPath('/waarom-succes-en-geluk-zo-afhankelijk-zijn-van-elkaar')).toBe(
      '/nl?from=nl',
    )
  })

  it('maps old PDF uploads to the legal pages', () => {
    expect(resolveLegacyPath('/wp-content/uploads/2019/03/Algemene-Voorwaarden.pdf')).toBe(
      '/nl/algemene-voorwaarden?from=nl',
    )
    expect(resolveLegacyPath('/wp-content/uploads/Privacyverklaring-2020.pdf')).toBe(
      '/nl/privacy?from=nl',
    )
  })

  it('falls back to the home page for unknown paths, per language', () => {
    expect(resolveLegacyPath('/wp-admin')).toBe('/nl?from=nl')
    expect(resolveLegacyPath('/feed/')).toBe('/nl?from=nl')
    expect(resolveLegacyPath('/en/some-old-thing')).toBe('/en?from=nl')
  })
})

describe('buildLegacyRedirects', () => {
  const rules = buildLegacyRedirects('https://insightseminars.be/')

  it('constrains every rule to the .nl host and uses a 301', () => {
    for (const rule of rules) {
      expect(rule.statusCode).toBe(301)
      expect(rule.has).toEqual([{ type: 'host', value: '(?:www\\.)?insightseminars\\.nl' }])
      expect(rule.destination.startsWith('https://insightseminars.be')).toBe(true)
      expect(rule.destination).toContain('from=nl')
    }
  })

  it('emits an absolute one-hop destination for a known path', () => {
    const rule = rules.find((r) => r.source === '/insight-1')
    expect(rule?.destination).toBe('https://insightseminars.be/nl/seminars/insight-1?from=nl')
  })

  it('emits trailing-slash variants for exact paths', () => {
    expect(rules.some((r) => r.source === '/insight-1')).toBe(true)
    expect(rules.some((r) => r.source === '/insight-1/')).toBe(true)
  })

  it('keeps the two catch-alls last with English before the generic one', () => {
    const enIndex = rules.findIndex((r) => r.source === '/en/:path*')
    const allIndex = rules.findIndex((r) => r.source === '/:path*')
    expect(enIndex).toBeGreaterThan(-1)
    expect(allIndex).toBe(rules.length - 1)
    expect(enIndex).toBeLessThan(allIndex)
  })
})
