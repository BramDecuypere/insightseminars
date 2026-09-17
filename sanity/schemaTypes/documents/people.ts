import { defineField, defineType } from 'sanity'

export const facilitator = defineType({
  name: 'facilitator',
  title: 'Begeleider',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'role', title: 'Rol', type: 'localeString' }),
    defineField({ name: 'bio', title: 'Bio', type: 'localeRichText' }),
    defineField({ name: 'photo', title: 'Foto', type: 'imageWithAlt' }),
    defineField({ name: 'website', title: 'Website', type: 'url' }),
  ],
  preview: { select: { title: 'name', subtitle: 'role.nl', media: 'photo' } },
})

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Teamlid',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Rol', type: 'localeString' }),
    defineField({ name: 'bio', title: 'Korte bio', type: 'localeText' }),
    defineField({ name: 'photo', title: 'Foto', type: 'imageWithAlt' }),
    defineField({ name: 'order', title: 'Volgorde', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Volgorde', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role.nl', media: 'photo' } },
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
