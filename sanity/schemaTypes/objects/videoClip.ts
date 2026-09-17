import { defineField, defineType } from 'sanity'

/**
 * Short speaker clip (brief §5.2 videoClip). Publishing requires a poster,
 * captions and confirmed consent. Uploads are MP4 up to ~30 MB; YouTube clips
 * load only after a click (handled in the renderer, §9.4).
 */
export const videoClip = defineType({
  name: 'videoClip',
  title: 'Videofragment',
  type: 'object',
  fields: [
    defineField({
      name: 'source',
      title: 'Bron',
      type: 'string',
      options: {
        list: [
          { title: 'Geüpload bestand (MP4)', value: 'upload' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'radio',
      },
      initialValue: 'upload',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'Videobestand (MP4, max. ~30 MB, max. 60 sec.)',
      type: 'file',
      options: { accept: 'video/mp4' },
      hidden: ({ parent }) => parent?.source !== 'upload',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { source?: string } | undefined
          if (parent?.source === 'upload' && !value) return 'Upload een videobestand.'
          return true
        }),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube-link',
      type: 'url',
      hidden: ({ parent }) => parent?.source !== 'youtube',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { source?: string } | undefined
          if (parent?.source === 'youtube' && !value) return 'Vul een YouTube-link in.'
          return true
        }),
    }),
    defineField({
      name: 'poster',
      title: 'Posterafbeelding',
      type: 'imageWithAlt',
      description: 'Verplicht. Wordt getoond vóór het afspelen.',
      validation: (rule) => rule.required().error('Een posterafbeelding is verplicht.'),
    }),
    defineField({
      name: 'captionsNl',
      title: 'Ondertiteling Nederlands (VTT)',
      type: 'file',
      options: { accept: '.vtt,text/vtt' },
    }),
    defineField({
      name: 'captionsEn',
      title: 'Ondertiteling Engels (VTT)',
      type: 'file',
      options: { accept: '.vtt,text/vtt' },
    }),
    defineField({ name: 'title', title: 'Titel', type: 'localeString' }),
    defineField({ name: 'speaker', title: 'Spreker', type: 'string', initialValue: 'Jerko' }),
    defineField({
      name: 'consentConfirmed',
      title: 'Toestemming van de spreker bevestigd',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule
          .custom((value) => (value === true ? true : 'Bevestig de toestemming vóór publicatie.'))
          .error(),
    }),
  ],
  preview: {
    select: { title: 'title.nl', speaker: 'speaker', media: 'poster' },
    prepare({ title, speaker, media }) {
      return { title: title || 'Videofragment', subtitle: speaker, media }
    },
  },
})
