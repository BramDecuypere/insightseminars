/**
 * One-off migration: merge the former `facilitator` and `teamMember` document
 * types into the unified `person` type (see sanity/schemaTypes/documents/people.ts).
 *
 * Why this exists: a person who was both a facilitator and a team member used
 * to need two separate documents, each with its own photo — updating one never
 * updated the other. This merges each pair into a single `person` document.
 *
 * Strategy (safe to re-run):
 * - Documents keep their original `_id`. We use `createOrReplace`, which
 *   overwrites the document at that id with a new `_type`, so every existing
 *   reference to a facilitator (e.g. event.facilitators) keeps working without
 *   needing to touch the events themselves.
 * - A facilitator and a team member are treated as the same human when their
 *   `name` matches exactly (trimmed, case-insensitive). Review the console
 *   output afterwards — if two different people share a name, split them
 *   manually in the Studio.
 * - The old `teamMember` documents that get merged into a matching facilitator
 *   are deleted (nothing else references a teamMember by id). Facilitator-only
 *   and team-only people are converted in place and are never deleted.
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
  const toDelete: string[] = []
  const toWrite: Record<string, unknown>[] = []

  for (const f of facilitators) {
    const match = teamMembers.find((m) => normalize(m.name) === normalize(f.name))
    const roles = ['facilitator', ...(match ? ['team'] : [])]
    toWrite.push({
      _id: f._id,
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
      toDelete.push(match._id)
      console.log(`Samengevoegd: "${f.name}" (facilitator ${f._id} + teamlid ${match._id})`)
    }
  }

  for (const m of teamMembers) {
    if (matchedTeamIds.has(m._id)) continue
    toWrite.push({
      _id: m._id,
      _type: 'person',
      name: m.name,
      roles: ['team'],
      role: m.role,
      bio: textToBlocks(m.bio),
      photo: m.photo,
      order: m.order,
    })
  }

  console.log(`\nTe schrijven: ${toWrite.length} person-documenten. Te verwijderen: ${toDelete.length} teamMember-documenten.`)

  if (dryRun) {
    console.log('\n--dry-run: geen schrijfacties uitgevoerd.')
    return
  }

  let tx = client.transaction()
  for (const doc of toWrite) tx = tx.createOrReplace(doc as never)
  for (const id of toDelete) tx = tx.delete(id)
  await tx.commit()

  console.log('\nKlaar. Controleer de personen in de Studio ("Mensen") en pas rollen/volgorde aan waar nodig.')
  console.log('De oude "facilitator"/"teamMember" schema-types kunnen nu uit Sanity verwijderd worden (al gebeurd in de schema-code).')
}

run().catch((err) => {
  console.error('Migratie mislukt:', err)
  process.exit(1)
})
