import { defineField, defineType } from 'sanity'

/**
 * A human shown on the site: a seminar facilitator, a team member, or both.
 * Merged from the former separate `facilitator`/`teamMember` types so one
 * person entered once (one photo, one bio) can appear in either listing
 * instead of needing a duplicate document kept in sync by hand.
 */
export const person = defineType({
  name: 'person',
  title: 'Persoon',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'roles',
      title: 'Rol(len)',
      description: 'Bepaalt in welke lijst(en) deze persoon verschijnt.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Begeleider (seminaries)', value: 'facilitator' },
          { title: 'Team', value: 'team' },
        ],
        layout: 'tags',
      },
      validation: (r) => r.required().min(1).error('Kies minstens één rol.'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Enkel nodig voor begeleiders met een eigen profielpagina.',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      hidden: ({ parent }) => !(parent?.roles as string[] | undefined)?.includes('facilitator'),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { roles?: string[] } | undefined
          if (parent?.roles?.includes('facilitator') && !value) return 'Verplicht voor een begeleider.'
          return true
        }),
    }),
    defineField({ name: 'role', title: 'Rol / functie', type: 'localeString' }),
    defineField({ name: 'bio', title: 'Bio', type: 'localeRichText' }),
    defineField({ name: 'photo', title: 'Foto', type: 'imageWithAlt' }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      hidden: ({ parent }) => !(parent?.roles as string[] | undefined)?.includes('facilitator'),
    }),
    defineField({
      name: 'order',
      title: 'Volgorde (team)',
      type: 'number',
      initialValue: 0,
      hidden: ({ parent }) => !(parent?.roles as string[] | undefined)?.includes('team'),
    }),
  ],
  orderings: [
    { title: 'Naam', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
    { title: 'Volgorde (team)', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role.nl', media: 'photo', roles: 'roles' },
    prepare({ title, subtitle, media, roles }) {
      const roleLabel = (roles as string[] | undefined)
        ?.map((r) => ({ facilitator: 'Begeleider', team: 'Team' })[r] ?? r)
        .join(' · ')
      return { title, subtitle: [roleLabel, subtitle].filter(Boolean).join(' — '), media }
    },
  },
})

export const venue = defineType({
  name: 'venue',
  title: 'Locatie',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'street', title: 'Straat en nummer', type: 'string' }),
    defineField({ name: 'postalCode', title: 'Postcode', type: 'string' }),
    defineField({ name: 'city', title: 'Gemeente', type: 'string' }),
    defineField({ name: 'country', title: 'Land', type: 'string', initialValue: 'België' }),
    defineField({ name: 'mapsUrl', title: 'Link naar kaart', type: 'url' }),
    defineField({ name: 'accessibility', title: 'Toegankelijkheid', type: 'localeText' }),
    defineField({ name: 'image', title: 'Afbeelding', type: 'imageWithAlt' }),
  ],
  preview: { select: { title: 'name', subtitle: 'city', media: 'image' } },
})
