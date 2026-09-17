import { defineArrayMember, defineField, defineType } from 'sanity'

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  almostFull: 'Bijna vol',
  full: 'Volzet',
  closed: 'Gesloten',
}

/** One dated occurrence: a seminar run, an info session or a workshop (§5.2). */
export const event = defineType({
  name: 'event',
  title: 'Activiteit',
  type: 'document',
  groups: [
    { name: 'main', title: 'Algemeen', default: true },
    { name: 'registration', title: 'Inschrijven' },
    { name: 'payment', title: 'Betaling' },
    { name: 'content', title: 'Extra info' },
  ],
  fields: [
    defineField({
      name: 'type',
      title: 'Soort activiteit',
      type: 'string',
      options: {
        list: [
          { title: 'Seminarie (volwassenen)', value: 'seminar' },
          { title: 'Seminarie (tieners)', value: 'teenSeminar' },
          { title: 'Infosessie', value: 'infoSession' },
          { title: 'Workshop', value: 'workshop' },
        ],
      },
      initialValue: 'seminar',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'program',
      title: 'Seminarie',
      type: 'reference',
      to: [{ type: 'program' }],
      group: 'main',
      hidden: ({ parent }) => parent?.type !== 'seminar' && parent?.type !== 'teenSeminar',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined
          if ((parent?.type === 'seminar' || parent?.type === 'teenSeminar') && !value) {
            return 'Kies het bijbehorende seminarie.'
          }
          return true
        }),
    }),
    defineField({ name: 'title', title: 'Titel (optioneel)', type: 'localeString', group: 'main' }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: 'Bv. insight-1-2027-02-antwerpen. Automatisch voorgesteld, aanpasbaar.',
      options: { maxLength: 120 },
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'start',
      title: 'Start',
      type: 'datetime',
      options: { timeStep: 15 },
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'end',
      title: 'Einde',
      type: 'datetime',
      options: { timeStep: 15 },
      group: 'main',
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const parent = context.parent as { start?: string } | undefined
          if (parent?.start && value && new Date(value) <= new Date(parent.start)) {
            return 'Het einde moet na de start liggen.'
          }
          return true
        }),
    }),
    defineField({ name: 'scheduleNote', title: 'Notitie over de uren', type: 'localeString', group: 'main' }),
    defineField({
      name: 'online',
      title: 'Online',
      type: 'boolean',
      initialValue: false,
      group: 'main',
    }),
    defineField({
      name: 'venue',
      title: 'Locatie',
      type: 'reference',
      to: [{ type: 'venue' }],
      group: 'main',
      hidden: ({ parent }) => parent?.online === true,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { online?: boolean } | undefined
          if (!parent?.online && !value) return 'Kies een locatie of vink "Online" aan.'
          return true
        }),
    }),
    defineField({
      name: 'meetingUrl',
      title: 'Vergaderlink (privé)',
      description:
        'PRIVÉ. Wordt nooit op de website getoond, alleen in de bevestigingsmail gebruikt. Zet online een wachtruimte aan.',
      type: 'url',
      group: 'main',
      hidden: ({ parent }) => parent?.online !== true,
    }),
    defineField({
      name: 'facilitators',
      title: 'Begeleiders',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'facilitator' }] })],
      group: 'main',
    }),
    defineField({
      name: 'language',
      title: 'Taal',
      type: 'string',
      options: {
        list: [
          { title: 'Nederlands', value: 'nl' },
          { title: 'Engels', value: 'en' },
          { title: 'Engels, met Nederlandse vertaling', value: 'en-nl' },
          { title: 'Nederlands, met Engelse vertaling', value: 'nl-en' },
        ],
      },
      initialValue: 'nl',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceOptions',
      title: 'Prijsopties (leeg = gratis)',
      type: 'array',
      of: [defineArrayMember({ type: 'priceOption' })],
      group: 'payment',
    }),
    defineField({
      name: 'registrationStatus',
      title: 'Inschrijfstatus',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'Bijna vol', value: 'almostFull' },
          { title: 'Volzet', value: 'full' },
          { title: 'Gesloten', value: 'closed' },
        ],
      },
      initialValue: 'open',
      group: 'registration',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'waitlistEnabled',
      title: 'Wachtlijst tonen bij "Volzet"',
      type: 'boolean',
      initialValue: false,
      group: 'registration',
    }),
    defineField({
      name: 'registrationDeadline',
      title: 'Inschrijven kan tot',
      type: 'date',
      options: { dateFormat: 'DD-MM-YYYY' },
      group: 'registration',
    }),
    defineField({
      name: 'depositAmount',
      title: 'Voorschot (euro, optioneel)',
      description: 'Als ingevuld, kunnen deelnemers dit voorschot nu betalen en de rest later.',
      type: 'number',
      group: 'payment',
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: 'paymentTiming',
      title: 'Wanneer betalen',
      type: 'string',
      options: {
        list: [
          { title: 'Meteen', value: 'immediate' },
          { title: 'Later', value: 'later' },
        ],
        layout: 'radio',
      },
      initialValue: 'immediate',
      group: 'payment',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paymentDueDate',
      title: 'Betalen vóór',
      type: 'date',
      options: { dateFormat: 'DD-MM-YYYY' },
      group: 'payment',
      hidden: ({ parent }) => parent?.paymentTiming !== 'later',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { paymentTiming?: string } | undefined
          if (parent?.paymentTiming === 'later' && !value) return 'Vul een betaaldatum in.'
          return true
        }),
    }),
    defineField({ name: 'image', title: 'Afbeelding (kaart en OG)', type: 'imageWithAlt', group: 'content' }),
    defineField({ name: 'notes', title: 'Extra info op de inschrijfpagina', type: 'localeRichText', group: 'content' }),
    defineField({ name: 'emailInfo', title: 'Praktische info in de bevestigingsmail', type: 'localeRichText', group: 'content' }),
  ],
  orderings: [
    { title: 'Startdatum (oplopend)', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] },
    { title: 'Startdatum (aflopend)', name: 'startDesc', by: [{ field: 'start', direction: 'desc' }] },
  ],
  preview: {
    select: {
      programTitle: 'program.title.nl',
      title: 'title.nl',
      type: 'type',
      start: 'start',
      end: 'end',
      status: 'registrationStatus',
      media: 'image',
    },
    prepare({ programTitle, title, type, start, end, status, media }) {
      // Studio-only list format: "Insight I · 19–21 feb 2027 · Volzet" (§5.3).
      const fmt = new Intl.DateTimeFormat('nl-BE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Brussels',
      })
      let range = ''
      if (start) {
        const s = new Date(start)
        const e = end ? new Date(end) : null
        range =
          e && e.toDateString() !== s.toDateString()
            ? `${new Intl.DateTimeFormat('nl-BE', { day: 'numeric', timeZone: 'Europe/Brussels' }).format(s)}–${fmt.format(e)}`
            : fmt.format(s)
      }
      const name =
        programTitle ||
        title ||
        ({ infoSession: 'Infosessie', workshop: 'Workshop' }[type as string] ?? 'Activiteit')
      return {
        title: name,
        subtitle: [range, STATUS_LABEL[status] ?? status].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
