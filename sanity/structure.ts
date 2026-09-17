import type { StructureResolver } from 'sanity/structure'

/** Documents that exist exactly once (§5.3). */
const SINGLETONS = ['homePage', 'aboutPage', 'teensPage', 'contactPage', 'siteSettings']

/** Studio desk structure in Dutch (brief §5.3). */
export const structure: StructureResolver = (S) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfToday = today.toISOString()

  const singleton = (id: string, title: string, schemaType: string) =>
    S.listItem()
      .title(title)
      .id(id)
      .child(S.document().schemaType(schemaType).documentId(id).title(title))

  return S.list()
    .title('Inhoud')
    .items([
      S.listItem()
        .title('Agenda')
        .child(
          S.list()
            .title('Agenda')
            .items([
              S.listItem()
                .title('Komende activiteiten')
                .child(
                  S.documentList()
                    .title('Komende activiteiten')
                    .schemaType('event')
                    .filter('_type == "event" && end >= $startOfToday')
                    .params({ startOfToday })
                    .defaultOrdering([{ field: 'start', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Voorbije activiteiten')
                .child(
                  S.documentList()
                    .title('Voorbije activiteiten')
                    .schemaType('event')
                    .filter('_type == "event" && end < $startOfToday')
                    .params({ startOfToday })
                    .defaultOrdering([{ field: 'start', direction: 'desc' }]),
                ),
            ]),
        ),

      S.listItem()
        .title('Seminars')
        .child(
          S.documentList()
            .title('Seminars')
            .schemaType('program')
            .filter('_type == "program"')
            .defaultOrdering([
              { field: 'track', direction: 'asc' },
              { field: 'order', direction: 'asc' },
            ]),
        ),

      S.documentTypeListItem('internationalEvent').title('Insight wereldwijd'),
      S.documentTypeListItem('facilitator').title('Facilitators'),
      S.documentTypeListItem('teamMember').title('Team'),
      S.documentTypeListItem('venue').title('Locaties'),
      S.documentTypeListItem('faq').title('Veelgestelde vragen'),
      S.documentTypeListItem('testimonial').title('Getuigenissen'),

      S.divider(),

      S.listItem()
        .title("Pagina's")
        .child(
          S.list()
            .title("Pagina's")
            .items([
              singleton('homePage', 'Home', 'homePage'),
              singleton('aboutPage', 'Over Insight', 'aboutPage'),
              singleton('teensPage', 'Tieners', 'teensPage'),
              singleton('contactPage', 'Contact', 'contactPage'),
            ]),
        ),

      S.listItem()
        .title('Juridisch')
        .child(
          S.documentList()
            .title('Juridisch')
            .schemaType('legalPage')
            .filter('_type == "legalPage"'),
        ),

      S.divider(),
      singleton('siteSettings', 'Instellingen', 'siteSettings'),
    ])
}

export const SINGLETON_TYPES = SINGLETONS
