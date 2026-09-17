import { defineArrayMember, defineField, defineType } from 'sanity'

const arr = (type: string) => defineArrayMember({ type })

export const homePage = defineType({
  name: 'homePage',
  title: 'Startpagina',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'sections', title: 'Secties' },
    { name: 'testimonials', title: 'Getuigenissen' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({ name: 'title', title: 'Titel', type: 'localeString' }),
        defineField({ name: 'lead', title: 'Intro', type: 'localeText' }),
        defineField({ name: 'primaryCta', title: 'Knop 1', type: 'localeString' }),
        defineField({ name: 'secondaryCta', title: 'Knop 2', type: 'localeString' }),
        defineField({ name: 'image', title: 'Afbeelding', type: 'imageWithAlt' }),
      ],
    }),
    defineField({
      name: 'recognise',
      title: '"Herken je dit?"',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'intro', title: 'Intro', type: 'localeText' }),
        defineField({ name: 'situations', title: 'Situaties', type: 'array', of: [arr('situationItem')] }),
        defineField({ name: 'fallback', title: 'Afsluitende tekst', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'whatIsInsight',
      title: '"Wat is Insight?"',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'body', title: 'Tekst', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'howItWorks',
      title: '"Zo werkt het"',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'points', title: 'Punten', type: 'array', of: [arr('titledText')] }),
      ],
    }),
    defineField({
      name: 'benefits',
      title: '"Wat kan het je brengen?"',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'items', title: 'Lijst', type: 'array', of: [arr('localeString')] }),
      ],
    }),
    defineField({
      name: 'forWho',
      title: '"Voor wie?"',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'body', title: 'Tekst', type: 'localeText' }),
        defineField({ name: 'trustLine', title: 'Vertrouwensregel', type: 'localeString' }),
      ],
    }),
    defineField({
      name: 'path',
      title: '"Het pad"',
      type: 'object',
      group: 'sections',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'intro', title: 'Intro', type: 'localeText' }),
        defineField({ name: 'nextInsight1Heading', title: 'Kop volgende Insight I', type: 'localeString' }),
        defineField({ name: 'infoSessionLine', title: 'Infosessie-regel', type: 'localeString' }),
        defineField({ name: 'teenLine', title: 'Tiener-regel', type: 'localeString' }),
      ],
    }),
    defineField({ name: 'upcomingHeading', title: 'Kop "Komende activiteiten"', type: 'localeString', group: 'sections' }),
    defineField({ name: 'testimonialsHeading', title: 'Kop getuigenissen', type: 'localeString', group: 'testimonials' }),
    defineField({
      name: 'testimonials',
      title: 'Uitgelichte getuigenissen',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'testimonial' }] })],
      group: 'testimonials',
    }),
    defineField({ name: 'videoClip', title: 'Videofragment', type: 'videoClip', group: 'testimonials' }),
    defineField({ name: 'videoPoster', title: 'Poster (zonder clip)', type: 'imageWithAlt', group: 'testimonials' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Startpagina' }) },
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'Over Insight',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Titel', type: 'localeString' }),
        defineField({ name: 'lead', title: 'Intro', type: 'localeText' }),
      ],
    }),
    defineField({ name: 'sections', title: 'Secties', type: 'array', of: [arr('readMoreBlock')] }),
    defineField({
      name: 'benefits',
      title: '"Wat kan het je brengen?"',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'items', title: 'Lijst', type: 'array', of: [arr('localeString')] }),
      ],
    }),
    defineField({
      name: 'forWho',
      title: '"Voor wie?"',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'body', title: 'Tekst', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'story',
      title: 'Het verhaal',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'paragraphs', title: 'Alinea\'s', type: 'array', of: [arr('localeText')] }),
      ],
    }),
    defineField({ name: 'teamIntro', title: 'Intro team', type: 'localeText' }),
    defineField({ name: 'facilitatorsIntro', title: 'Intro begeleiders', type: 'localeText' }),
    defineField({
      name: 'support',
      title: 'Ondersteuning',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'body', title: 'Tekst', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'closing',
      title: 'Afsluiter',
      type: 'object',
      fields: [defineField({ name: 'heading', title: 'Kop', type: 'localeString' })],
    }),
    defineField({ name: 'videoClip', title: 'Videofragment', type: 'videoClip' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Over Insight' }) },
})

export const teensPage = defineType({
  name: 'teensPage',
  title: 'Tieners',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Titel', type: 'localeString' }),
        defineField({ name: 'lead', title: 'Intro', type: 'localeText' }),
        defineField({ name: 'points', title: 'Punten', type: 'array', of: [arr('localeString')] }),
      ],
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'object',
      fields: [
        defineField({ name: 'image', title: 'Afbeelding', type: 'imageWithAlt' }),
        defineField({ name: 'videoClip', title: 'Videofragment', type: 'videoClip' }),
      ],
    }),
    defineField({
      name: 'parents',
      title: 'Voor ouders',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Kop', type: 'localeString' }),
        defineField({ name: 'lead', title: 'Intro', type: 'localeText' }),
        defineField({ name: 'blocks', title: 'Blokken', type: 'array', of: [arr('titledText')] }),
      ],
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Tieners' }) },
})

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Titel', type: 'localeString' }),
        defineField({ name: 'lead', title: 'Intro', type: 'localeText' }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Secties',
      type: 'object',
      fields: [
        defineField({ name: 'direct', title: 'Direct contact', type: 'localeString' }),
        defineField({ name: 'venue', title: 'Locatie', type: 'localeString' }),
        defineField({ name: 'follow', title: 'Volg ons', type: 'localeString' }),
      ],
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Contact' }) },
})
