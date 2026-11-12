/**
 * One-off migration: merge the former `facilitator` and `teamMember` document
 * types into the unified `person` type (see sanity/schemaTypes/documents/people.ts).
 *
 * Why this exists: a person who was both a facilitator and a team member used
 * to need two separate documents, each with its own photo — updating one never
 * updated the other. This merges each pair into a single `person` document.
 *
 * Strategy (safe to re-run):
 * - Sanity forbids changing a document's `_type`, so each old document gets a
 *   new `person` document at `person-<oldId>`. Every reference to an old id
 *   (e.g. event.facilitators, drafts included) is repointed to the new id in
 *   the same transaction, guarded by the referencing document's revision.
 * - A facilitator and a team member are treated as the same human when their
 *   `name` matches exactly (trimmed, case-insensitive). Review the console
 *   output afterwards — if two different people share a name, split them
 *   manually in the Studio.
 * - Old `facilitator`/`teamMember` documents are left in place (their types
 *   are gone from the schema, so the Studio no longer shows them). Delete them
 *   by hand once the migration has been checked.
 *
 * Usage:
 *   npx tsx scripts/migrate-people.ts --dry-run   # review the plan, no writes
 *   npx tsx scripts/migrate-people.ts              # apply
 *
 * Needs SANITY_API_WRITE_TOKEN (never set this on Vercel) plus the public
 * project id/dataset env vars, same as scripts/seed.ts.
 */
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const dryRun = process.argv.includes('--dry-run')

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID ontbreekt.')
if (!token) throw new Error('SANITY_API_WRITE_TOKEN ontbreekt (alleen lokaal instellen).')

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-10-01',
  useCdn: false,
})

type FacilitatorDoc = {
  _id: string
  name: string
  slug?: { current: string }
  role?: unknown
  bio?: unknown
  photo?: unknown
  website?: string
}

type TeamMemberDoc = {
  _id: string
  name: string
  role?: unknown
  bio?: unknown
  photo?: unknown
  order?: number
}

const normalize = (name: string) => name.trim().toLowerCase()
const newId = (oldId: string) => `person-${oldId}`

/** Deep-copies `value`, repointing any `_ref` found in `idMap`. */
function remapRefs(value: unknown, idMap: Map<string, string>): unknown {
  if (Array.isArray(value)) return value.map((v) => remapRefs(v, idMap))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === '_ref' && typeof v === 'string' && idMap.has(v) ? idMap.get(v) : remapRefs(v, idMap)
    }
    return out
  }
  return value
}

/** Plain localeText ({nl, en} strings) -> localeRichText ({nl, en} Portable Text blocks). */
function textToBlocks(value: unknown) {
  const v = value as { nl?: string; en?: string } | undefined
  if (!v?.nl) return undefined
  const block = (text: string) => [
    { _type: 'block', _key: `k${Math.random().toString(36).slice(2)}`, style: 'normal', markDefs: [], children: [{ _type: 'span', _key: `k${Math.random().toString(36).slice(2)}`, text, marks: [] }] },
  ]
  return { nl: block(v.nl), ...(v.en ? { en: block(v.en) } : {}) }
}

async function run() {
  const facilitators = await client.fetch<FacilitatorDoc[]>(`*[_type == "facilitator"]`)
  const teamMembers = await client.fetch<TeamMemberDoc[]>(`*[_type == "teamMember"]`)

  console.log(`Gevonden: ${facilitators.length} facilitators, ${teamMembers.length} teamleden.`)

  const matchedTeamIds = new Set<string>()
  const idMap = new Map<string, string>()
  const toWrite: Record<string, unknown>[] = []

  for (const f of facilitators) {
    const match = teamMembers.find((m) => normalize(m.name) === normalize(f.name))
    const roles = ['facilitator', ...(match ? ['team'] : [])]
    idMap.set(f._id, newId(f._id))
    toWrite.push({
      _id: newId(f._id),
      _type: 'person',
      name: f.name,
      roles,
      slug: f.slug,
      role: f.role,
      bio: f.bio,
      photo: f.photo,
      website: f.website,
      order: match?.order,
    })
    if (match) {
      matchedTeamIds.add(match._id)
      idMap.set(match._id, newId(f._id))
      console.log(`Samengevoegd: "${f.name}" (facilitator ${f._id} + teamlid ${match._id})`)
    }
  }

  for (const m of teamMembers) {
    if (matchedTeamIds.has(m._id)) continue
    idMap.set(m._id, newId(m._id))
    toWrite.push({
      _id: newId(m._id),
      _type: 'person',
      name: m.name,
      roles: ['team'],
      role: m.role,
      bio: textToBlocks(m.bio),
      photo: m.photo,
      order: m.order,
    })
  }

  const referencing = await client.fetch<Record<string, unknown>[]>(
    `*[references($ids)]`,
    { ids: [...idMap.keys()] },
    { perspective: 'raw' },
  )
  const patches = referencing.map((doc) => {
    const changed: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(doc)) {
      if (k.startsWith('_')) continue
      const remapped = remapRefs(v, idMap)
      if (JSON.stringify(remapped) !== JSON.stringify(v)) changed[k] = remapped
    }
    return { id: doc._id as string, rev: doc._rev as string, changed }
  })

  console.log(`\nTe schrijven: ${toWrite.length} person-documenten.`)
  for (const p of patches) console.log(`Verwijzingen bijwerken in ${p.id}: ${Object.keys(p.changed).join(', ')}`)

  if (dryRun) {
    console.log('\n--dry-run: geen schrijfacties uitgevoerd.')
    return
  }

  let tx = client.transaction()
  for (const doc of toWrite) tx = tx.createOrReplace(doc as never)
  for (const p of patches) tx = tx.patch(p.id, (patch) => patch.ifRevisionId(p.rev).set(p.changed))
  await tx.commit()

  console.log('\nKlaar. Controleer de personen in de Studio ("Mensen") en pas rollen/volgorde aan waar nodig.')
  console.log('De oude "facilitator"/"teamMember"-documenten staan er nog; verwijder ze na controle.')
}

run().catch((err) => {
  console.error('Migratie mislukt:', err)
  process.exit(1)
})
