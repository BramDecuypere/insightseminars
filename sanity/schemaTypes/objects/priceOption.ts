import { defineField, defineType } from 'sanity'

/** A single price line on an event (brief §5.2 priceOption). */
export const priceOption = defineType({
  name: 'priceOption',
  title: 'Prijsoptie',
  type: 'object',
  description:
    'Voeg een vroegboekprijs toe met een einddatum. Tot en met die dag zien bezoekers enkel de vroegboekprijs; daarna verschijnt automatisch de standaardprijs.',
  fields: [
    defineField({
      name: 'kind',
      title: 'Soort',
      type: 'string',
      options: {
        list: [
          { title: 'Standaardprijs', value: 'regular' },
          { title: 'Vroegboekprijs', value: 'earlyBird' },
          { title: 'Herhaalprijs (audit)', value: 'audit' },
          { title: 'Optie (bv. met overnachting)', value: 'option' },
        ],
      },
      validation: (rule) => rule.required().error('Kies een soort prijs.'),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'amount',
      title: 'Bedrag (euro)',
      type: 'number',
      validation: (rule) =>
        rule.required().min(0).precision(2).error('Bedrag moet 0 of meer zijn.'),
    }),
    defineField({
      name: 'validUntil',
      title: 'Geldig tot en met',
      type: 'date',
      options: { dateFormat: 'DD-MM-YYYY' },
      description: 'Verplicht voor een vroegboekprijs. Geldig tot het einde van die dag (Brussel).',
      hidden: ({ parent }) => parent?.kind !== 'earlyBird',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { kind?: string } | undefined
          if (parent?.kind === 'earlyBird' && !value) {
            return 'Een vroegboekprijs heeft een einddatum nodig.'
          }
          return true
        }),
    }),
    defineField({
      name: 'requiresGraduate',
      title: 'Alleen voor wie het seminarie al volgde',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => parent?.kind !== 'audit',
    }),
  ],
  preview: {
    select: { label: 'label.nl', amount: 'amount', kind: 'kind' },
    prepare({ label, amount, kind }) {
      return {
        title: label || kind,
        subtitle: typeof amount === 'number' ? `€ ${amount.toFixed(2)}` : 'gratis',
      }
    },
  },
})
