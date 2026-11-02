/**
 * One-off migration: move each testimonial's former single `program`
 * reference into the new `programs` array, so a testimonial can be linked to
 * several seminars.
 *
 * Safe to re-run: only testimonials that still have `program` are touched; an
 * existing `programs` list is kept and the old reference is appended to it
 * when it isn't already there.
 *
 * Usage:
 *   npx tsx scripts/migrate-testimonial-programs.ts --dry-run   # review the plan, no writes
 *   npx tsx scripts/migrate-testimonial-programs.ts              # apply
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

type Ref = { _type: 'reference'; _ref: string; _key?: string }
type TestimonialDoc = { _id: string; name?: string; program: Ref; programs?: Ref[] }

const key = () => `k${Math.random().toString(36).slice(2)}`

async function run() {
  // Includes drafts, so unpublished edits are migrated too.
  const docs = await client.fetch<TestimonialDoc[]>(
    `*[_type == "testimonial" && defined(program)]{ _id, name, program, programs }`,
  )
  if (!docs.length) {
    console.log('Niets te migreren.')
    return
  }

  const tx = client.transaction()
  for (const doc of docs) {
    const programs = doc.programs ?? []
    const alreadyListed = programs.some((p) => p._ref === doc.program._ref)
    console.log(`${doc._id} (${doc.name ?? '?'}): ${doc.program._ref}${alreadyListed ? ' (al in lijst)' : ''}`)
    tx.patch(doc._id, (p) => {
      let patch = p.setIfMissing({ programs: [] })
      if (!alreadyListed) {
        patch = patch.append('programs', [{ _type: 'reference', _ref: doc.program._ref, _key: key() }])
      }
      return patch.unset(['program'])
    })
  }

  if (dryRun) {
    console.log(`\n--dry-run: ${docs.length} getuigenis(sen) zouden aangepast worden.`)
    return
  }
  await tx.commit()
  console.log(`\n${docs.length} getuigenis(sen) gemigreerd.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
