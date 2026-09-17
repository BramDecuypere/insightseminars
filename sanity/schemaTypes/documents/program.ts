import { defineArrayMember, defineField, defineType } from 'sanity'

/** A seminar in the path: Insight I/II/III and Tiener Insight I/II/III (§5.2). */
export const program = defineType({
  name: 'program',
  title: 'Seminarie',
  type: 'document',
  groups: [
    { name: 'content', title: 'Inhoud', default: true },
    { name: 'practical', title: 'Praktisch' },
    { name: 'related', title: 'Gerelateerd' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'localeString',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Ondertitel (gewone taal)',
      description: 'Bijvoorbeeld "Ontdek wat je echt wil".',
      type: 'localeString',
      group: 'content',
    }),
    defineField({
      name: 'officialName',
      title: 'Officiële internationale naam (Engels)',
      description: 'Bijvoorbeeld "Awakening the Power of Your Heart". Niet vertalen.',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title.nl', maxLength: 96 },
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'track',
      title: 'Doelgroep',
      type: 'string',
      options: {
        list: [
          { title: 'Volwassenen', value: 'adults' },
          { title: 'Tieners', value: 'teens' },
        ],
        layout: 'radio',
      },
      initialValue: 'adults',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'order', title: 'Volgorde in het pad', type: 'number', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'numeral', title: 'Cijfer (I, II, III)', type: 'string', group: 'content' }),
    defineField({
      name: 'accent',
      title: 'Accentkleur',
      type: 'string',
      options: {
        list: [
          { title: 'Accent 1', value: 'accent1' },
          { title: 'Accent 2', value: 'accent2' },
          { title: 'Accent 3', value: 'accent3' },
          { title: 'Accent 4', value: 'accent4' },
        ],
      },
      initialValue: 'accent1',
      group: 'content',
    }),
    defineField({ name: 'lead', title: 'Intro (een of twee zinnen)', type: 'localeText', group: 'content' }),
    defineField({
      name: 'outcomes',
      title: 'Wat je ontdekt',
      type: 'array',
      of: [defineArrayMember({ type: 'localeString' })],
      group: 'content',
    }),
    defineField({ name: 'howItWorks', title: 'Zo werkt het', type: 'localeRichText', group: 'content' }),
    defineField({ name: 'forWhom', title: 'Voor wie', type: 'localeRichText', group: 'content' }),
    defineField({ name: 'durationLabel', title: 'Duur', type: 'localeString', group: 'practical' }),
    defineField({ name: 'hoursLabel', title: 'Uren', type: 'localeString', group: 'practical' }),
    defineField({ name: 'groupSize', title: 'Groepsgrootte', type: 'localeString', group: 'practical' }),
    defineField({
      name: 'expectations',
      title: 'Wat kan je verwachten',
      type: 'array',
      of: [defineArrayMember({ type: 'titledText' })],
      group: 'practical',
    }),
    defineField({ name: 'ageMin', title: 'Minimumleeftijd', type: 'number', group: 'practical', hidden: ({ parent }) => parent?.track !== 'teens' }),
    defineField({ name: 'ageMax', title: 'Maximumleeftijd', type: 'number', group: 'practical', hidden: ({ parent }) => parent?.track !== 'teens' }),
    defineField({ name: 'nextDateNote', title: 'Nog geen datum? Notitie', description: 'Bv. "Verwacht in de zomer van 2028".', type: 'localeString', group: 'practical' }),
    defineField({ name: 'heroImage', title: 'Hoofdafbeelding', type: 'imageWithAlt', group: 'content' }),
    defineField({
      name: 'videoClip',
      title: 'Videofragment',
      type: 'videoClip',
      group: 'content',
    }),
    defineField({
      name: 'prerequisites',
      title: 'Voorwaarden (eerdere seminaries)',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'program' }] })],
      group: 'related',
    }),
    defineField({
      name: 'testimonials',
      title: 'Getuigenissen',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'testimonial' }] })],
      group: 'related',
    }),
    defineField({
      name: 'faqs',
      title: 'Veelgestelde vragen',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faq' }] })],
      group: 'related',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    {
      title: 'Doelgroep en volgorde',
      name: 'trackOrder',
      by: [
        { field: 'track', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'title.nl', track: 'track', order: 'order', media: 'heroImage' },
    prepare({ title, track, order, media }) {
      return {
        title,
        subtitle: `${track === 'teens' ? 'Tieners' : 'Volwassenen'} · #${order ?? '?'}`,
        media,
      }
    },
  },
})
