import { defineField, defineType } from 'sanity'

/**
 * Field-level translation wrappers (brief §5.1). One document holds both
 * languages side by side; Dutch is required, English optional and filled by
 * volunteers or by @sanity/assist. Queries always coalesce to Dutch.
 */

export const SUPPORTED_LANGUAGES = [
  { id: 'nl', title: 'Nederlands' },
  { id: 'en', title: 'Engels' },
] as const

export const localeString = defineType({
  name: 'localeString',
  title: 'Tekst (meertalig)',
  type: 'object',
  fields: [
    defineField({
      name: 'nl',
      title: 'Nederlands',
      type: 'string',
      validation: (rule) => rule.required().error('Nederlandse tekst is verplicht.'),
    }),
    defineField({ name: 'en', title: 'Engels', type: 'string' }),
  ],
})

export const localeText = defineType({
  name: 'localeText',
  title: 'Tekst, meerdere regels (meertalig)',
  type: 'object',
  fields: [
    defineField({
      name: 'nl',
      title: 'Nederlands',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().error('Nederlandse tekst is verplicht.'),
    }),
    defineField({ name: 'en', title: 'Engels', type: 'text', rows: 3 }),
  ],
})

export const localeRichText = defineType({
  name: 'localeRichText',
  title: 'Opgemaakte tekst (meertalig)',
  type: 'object',
  fields: [
    defineField({
      name: 'nl',
      title: 'Nederlands',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required().error('Nederlandse tekst is verplicht.'),
    }),
    defineField({ name: 'en', title: 'Engels', type: 'array', of: [{ type: 'block' }] }),
  ],
})
