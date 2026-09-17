import { defineField, defineType } from 'sanity'

const FAQ_CATEGORIES = [
  { title: 'Algemeen', value: 'algemeen' },
  { title: 'Praktisch', value: 'praktisch' },
  { title: 'Betalen', value: 'betalen' },
  { title: 'Tieners', value: 'tieners' },
]

export const faq = defineType({
  name: 'faq',
  title: 'Veelgestelde vraag',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Vraag', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Antwoord', type: 'localeRichText', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'string',
      options: { list: FAQ_CATEGORIES },
      initialValue: 'algemeen',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Volgorde', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Volgorde', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'question.nl', category: 'category' },
    prepare({ title, category }) {
      const label = FAQ_CATEGORIES.find((c) => c.value === category)?.title ?? category
      return { title, subtitle: label }
    },
  },
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Getuigenis',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Citaat (1 tot 3 zinnen)',
      type: 'localeText',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'situation',
      title: 'Situatie vooraf (in eigen woorden)',
      description: 'Bv. "Ik liep vast in mijn werk".',
      type: 'localeString',
    }),
    defineField({ name: 'name', title: 'Naam of initialen', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'context', title: 'Context', description: 'Bv. "deelnemer Insight I, 2025".', type: 'localeString' }),
    defineField({ name: 'photo', title: 'Foto (optioneel)', type: 'imageWithAlt' }),
    defineField({ name: 'videoClip', title: 'Videofragment (optioneel)', type: 'videoClip' }),
    defineField({ name: 'program', title: 'Seminarie (optioneel)', type: 'reference', to: [{ type: 'program' }] }),
    defineField({
      name: 'audience',
      title: 'Doelgroep',
      type: 'string',
      options: {
        list: [
          { title: 'Volwassenen', value: 'adults' },
          { title: 'Tieners', value: 'teens' },
          { title: 'Ouders', value: 'parents' },
        ],
      },
      initialValue: 'adults',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'featured', title: 'Tonen op de startpagina', type: 'boolean', initialValue: false }),
    defineField({
      name: 'consentConfirmed',
      title: 'Toestemming bevestigd',
      description: 'Moet aangevinkt zijn vóór publicatie.',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value) => (value === true ? true : 'Bevestig de toestemming vóór publicatie.')),
    }),
  ],
  preview: {
    select: { title: 'quote.nl', name: 'name', media: 'photo' },
    prepare({ title, name, media }) {
      return { title: name, subtitle: title, media }
    },
  },
})

export const internationalEvent = defineType({
  name: 'internationalEvent',
  title: 'Internationale activiteit',
  type: 'document',
  fields: [
    defineField({ name: 'program', title: 'Seminarie', type: 'reference', to: [{ type: 'program' }] }),
    defineField({ name: 'country', title: 'Land', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'city', title: 'Stad', type: 'string' }),
    defineField({ name: 'start', title: 'Start', type: 'date', options: { dateFormat: 'DD-MM-YYYY' }, validation: (r) => r.required() }),
    defineField({
      name: 'end',
      title: 'Einde',
      type: 'date',
      options: { dateFormat: 'DD-MM-YYYY' },
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const parent = context.parent as { start?: string } | undefined
          if (parent?.start && value && new Date(value) < new Date(parent.start)) {
            return 'Het einde moet na de start liggen.'
          }
          return true
        }),
    }),
    defineField({ name: 'language', title: 'Taal', type: 'string', initialValue: 'English' }),
    defineField({ name: 'url', title: 'Inschrijflink', type: 'url', validation: (r) => r.required() }),
  ],
  orderings: [{ title: 'Startdatum', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] }],
  preview: {
    select: { program: 'program.title.nl', country: 'country', city: 'city', start: 'start' },
    prepare({ program, country, city, start }) {
      return {
        title: `${program ?? 'Seminarie'} · ${city ?? ''} ${country}`.trim(),
        subtitle: start,
      }
    },
  },
})
