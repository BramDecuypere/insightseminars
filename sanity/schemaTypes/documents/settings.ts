import { defineArrayMember, defineField, defineType } from 'sanity'

const arr = (type: string) => defineArrayMember({ type })

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Juridische pagina',
  type: 'document',
  fields: [
    defineField({
      name: 'kind',
      title: 'Soort',
      type: 'string',
      options: {
        list: [
          { title: 'Privacy', value: 'privacy' },
          { title: 'Algemene voorwaarden', value: 'terms' },
          { title: 'Veiligheid en gedragscode', value: 'safeguarding' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'title', title: 'Titel', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'body', title: 'Inhoud', type: 'localeRichText', validation: (r) => r.required() }),
    defineField({ name: 'version', title: 'Versie', type: 'string' }),
    defineField({ name: 'updatedAt', title: 'Laatst bijgewerkt', type: 'date', options: { dateFormat: 'DD-MM-YYYY' } }),
  ],
  preview: { select: { title: 'title.nl', subtitle: 'kind' } },
})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Instellingen',
  type: 'document',
  groups: [
    { name: 'org', title: 'Organisatie', default: true },
    { name: 'contact', title: 'Contact en betaling' },
    { name: 'consent', title: 'Toestemming tieners' },
    { name: 'links', title: 'Links' },
    { name: 'site', title: 'Site-breed' },
  ],
  fields: [
    defineField({ name: 'orgName', title: 'Weergavenaam', type: 'string', group: 'org', validation: (r) => r.required() }),
    defineField({ name: 'legalName', title: 'Juridische naam', type: 'string', group: 'org' }),
    defineField({ name: 'legalForm', title: 'Rechtsvorm', type: 'string', group: 'org' }),
    defineField({ name: 'registeredOffice', title: 'Maatschappelijke zetel', type: 'string', group: 'org' }),
    defineField({ name: 'enterpriseNumber', title: 'Ondernemingsnummer (KBO)', type: 'string', group: 'org' }),
    defineField({ name: 'rprCourt', title: 'RPR + rechtbank', type: 'string', group: 'org' }),

    defineField({ name: 'email', title: 'E-mail', type: 'string', group: 'contact', validation: (r) => r.required() }),
    defineField({ name: 'phone', title: 'Telefoon', type: 'string', group: 'contact' }),
    defineField({ name: 'iban', title: 'IBAN', type: 'string', group: 'contact' }),
    defineField({ name: 'bic', title: 'BIC', type: 'string', group: 'contact' }),
    defineField({ name: 'accountHolder', title: 'Rekeninghouder', type: 'string', group: 'contact' }),
    defineField({ name: 'allowBankTransfer', title: 'Overschrijving toestaan', type: 'boolean', initialValue: true, group: 'contact' }),
    defineField({ name: 'invoiceEmail', title: 'E-mail voor facturen', type: 'string', group: 'contact' }),
    defineField({ name: 'transferDueDays', title: 'Betaaltermijn overschrijving (dagen)', type: 'number', initialValue: 7, group: 'contact' }),

    defineField({ name: 'consentText', title: 'Toestemmingstekst', type: 'localeText', group: 'consent' }),
    defineField({ name: 'consentVersion', title: 'Versie toestemming', type: 'string', group: 'consent' }),
    defineField({
      name: 'consentTemplatePdf',
      title: 'Blanco toestemmingsformulier (PDF)',
      description: 'Een leeg formulier, zonder persoonsgegevens.',
      type: 'file',
      options: { accept: 'application/pdf' },
      group: 'consent',
    }),

    defineField({ name: 'socials', title: 'Sociale kanalen', type: 'array', of: [arr('social')], group: 'links' }),
    defineField({ name: 'internationalLinks', title: 'Internationale links', type: 'array', of: [arr('internationalLink')], group: 'links' }),
    defineField({ name: 'internationalCalendarUrl', title: 'Internationale kalender (link)', type: 'url', group: 'links' }),
    defineField({ name: 'linksPage', title: 'Links-pagina', type: 'array', of: [arr('linkItem')], group: 'links' }),

    defineField({ name: 'announcement', title: 'Aankondiging', type: 'announcement', group: 'site' }),
    defineField({
      name: 'defaultSeo',
      title: 'Standaard SEO',
      type: 'object',
      group: 'site',
      fields: [
        defineField({ name: 'title', title: 'Titel', type: 'localeString' }),
        defineField({ name: 'description', title: 'Omschrijving', type: 'localeText' }),
        defineField({ name: 'ogImage', title: 'OG-afbeelding', type: 'imageWithAlt' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Instellingen' }) },
})
