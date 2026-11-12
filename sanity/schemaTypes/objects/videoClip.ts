import { defineField, defineType } from 'sanity'

type VideoClipParent = {
  source?: string
  file?: unknown
  youtubeUrl?: unknown
  poster?: { asset?: unknown }
  title?: { nl?: string; en?: string }
  captionsNl?: { asset?: unknown }
  captionsEn?: { asset?: unknown }
}

/**
 * A clip counts as "in use" once a file or YouTube link is provided. `source`
 * and `consentConfirmed` carry initialValues, so the object is never truly
 * empty — without this check the required subfields would block saving even
 * when no video is entered.
 */
const hasClip = (parent: VideoClipParent | undefined): boolean =>
  Boolean(parent?.file || parent?.youtubeUrl)

/**
 * The editor started a clip (poster, title or captions) but has not added the
 * video itself yet. Only then is the file/link required, so an optional,
 * untouched clip never blocks publishing.
 */
const hasOtherClipContent = (parent: VideoClipParent | undefined): boolean =>
  Boolean(
    parent?.poster?.asset ||
      parent?.title?.nl ||
      parent?.title?.en ||
      parent?.captionsNl?.asset ||
      parent?.captionsEn?.asset,
  )

/**
 * Short speaker clip (brief §5.2 videoClip). When a clip is provided, publishing
 * requires a poster and confirmed consent. Uploads are MP4 up to ~30 MB; YouTube
 * clips load only after a click (handled in the renderer, §9.4).
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
      title: 'Videobestand (MP4, max. ~30 MB)',
      description: 'Voor korte fragmenten (tot ongeveer een minuut). Langere video\'s zet je best als niet-openbare video op YouTube.',
      type: 'file',
      options: { accept: 'video/mp4' },
      hidden: ({ parent }) => parent?.source !== 'upload',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as VideoClipParent | undefined
          if (parent?.source === 'upload' && !value && hasOtherClipContent(parent)) {
            return 'Upload een videobestand, of maak de andere velden van het videofragment leeg.'
          }
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
          const parent = context.parent as VideoClipParent | undefined
          if (parent?.source === 'youtube' && !value && hasOtherClipContent(parent)) {
            return 'Vul een YouTube-link in, of maak de andere velden van het videofragment leeg.'
          }
          return true
        }),
    }),
    defineField({
      name: 'poster',
      title: 'Posterafbeelding',
      type: 'imageWithAlt',
      description:
        'Verplicht wanneer er een videofragment is. Wordt getoond vóór het afspelen. Liggend, ideaal 1920 × 1080 px (16:9).',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as VideoClipParent | undefined
          if (hasClip(parent) && !value) return 'Een posterafbeelding is verplicht bij een videofragment.'
          return true
        }),
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
    defineField({ name: 'speaker', title: 'Spreker', type: 'string' }),
    defineField({
      name: 'consentConfirmed',
      title: 'Toestemming van de spreker bevestigd',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as VideoClipParent | undefined
          if (hasClip(parent) && value !== true) return 'Bevestig de toestemming vóór publicatie.'
          return true
        }),
    }),
  ],
  preview: {
    select: { title: 'title.nl', speaker: 'speaker', media: 'poster' },
    prepare({ title, speaker, media }) {
      return { title: title || 'Videofragment', subtitle: speaker, media }
    },
  },
})
