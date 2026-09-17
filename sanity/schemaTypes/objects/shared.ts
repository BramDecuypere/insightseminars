import { defineArrayMember, defineField, defineType } from 'sanity'

/** Image with hotspot and required, translated alt text (brief §5.2). */
export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Afbeelding',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt-tekst (beschrijving)',
      description: 'Korte beschrijving voor schermlezers en zoekmachines. Verplicht.',
      type: 'localeString',
      validation: (rule) => rule.required().error('Alt-tekst is verplicht.'),
    }),
  ],
})

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'title', title: 'SEO-titel', type: 'localeString' }),
    defineField({ name: 'description', title: 'SEO-omschrijving', type: 'localeText' }),
  ],
})

export const social = defineType({
  name: 'social',
  title: 'Sociaal kanaal',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: ['facebook', 'instagram', 'youtube', 'linkedin', 'tiktok'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'url' },
  },
})

export const linkItem = defineType({
  name: 'linkItem',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'url', title: 'Link', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'highlight', title: 'Uitlichten', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'label.nl', subtitle: 'url' } },
})

export const internationalLink = defineType({
  name: 'internationalLink',
  title: 'Internationale link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'url', title: 'Link', type: 'url' }),
  ],
  preview: { select: { title: 'label', subtitle: 'url' } },
})

export const announcement = defineType({
  name: 'announcement',
  title: 'Aankondiging',
  type: 'object',
  fields: [
    defineField({ name: 'active', title: 'Actief', type: 'boolean', initialValue: false }),
    defineField({ name: 'text', title: 'Tekst', type: 'localeString' }),
    defineField({ name: 'link', title: 'Link', type: 'string' }),
  ],
})

/** A titled paragraph ({title, text}) reused in several sections. */
export const titledText = defineType({
  name: 'titledText',
  title: 'Blok met titel',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'text', title: 'Tekst', type: 'localeText', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'title.nl' } },
})

/** "Lees meer" block: heading, short intro, optional expanded text (§9.1). */
export const readMoreBlock = defineType({
  name: 'readMoreBlock',
  title: 'Blok met "Lees meer"',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Kop', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'short', title: 'Korte tekst', type: 'localeText', validation: (r) => r.required() }),
    defineField({ name: 'more', title: 'Meer (achter "Lees meer")', type: 'localeText' }),
  ],
  preview: { select: { title: 'heading.nl' } },
})

/** "Herken je dit?" situation on the homepage (§5.2). */
export const situationItem = defineType({
  name: 'situationItem',
  title: 'Situatie ("Herken je dit?")',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'localeString', validation: (r) => r.required() }),
    defineField({
      name: 'target',
      title: 'Verwijst naar',
      type: 'string',
      options: {
        list: [
          { title: 'Infosessie', value: 'infoSession' },
          { title: 'Programma', value: 'program' },
          { title: 'Over Insight', value: 'about' },
          { title: 'Tieners', value: 'teens' },
        ],
        layout: 'radio',
      },
      initialValue: 'about',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'program',
      title: 'Programma',
      type: 'reference',
      to: [{ type: 'program' }],
      hidden: ({ parent }) => parent?.target !== 'program',
    }),
    defineField({
      name: 'testimonial',
      title: 'Getuigenis',
      type: 'reference',
      to: [{ type: 'testimonial' }],
    }),
  ],
  preview: { select: { title: 'label.nl' } },
})

export const arrayOf = (type: string) => defineArrayMember({ type })
