import type {
  AboutPage,
  ContactPage,
  Facilitator,
  Faq,
  HomePage,
  InsightEvent,
  InternationalEvent,
  LegalPage,
  Program,
  SiteSettings,
  TeamMember,
  TeensPage,
  Testimonial,
  Venue,
} from './types'

/**
 * Seed content (brief §13), Flemish Dutch with English translations for the
 * key display fields (§13.11). Values marked [TE BEVESTIGEN] are left empty,
 * never shown as literal text (§13). No invented testimonials, no stock imagery.
 */

export const settings: SiteSettings = {
  orgName: 'Insight Seminars België',
  // legalName/legalForm/registeredOffice/enterpriseNumber/rprCourt: [TE BEVESTIGEN]
  email: 'info@insightseminars.be',
  iban: 'BE94 7785 9380 0814',
  accountHolder: 'Insight Seminars Belgium',
  allowBankTransfer: true,
  transferDueDays: 7,
  consentText: {
    nl: 'Ik geef als ouder of wettelijke voogd toestemming dat mijn kind deelneemt aan het hierboven vermelde seminar van Insight Seminars België. Ik heb de algemene voorwaarden en het beleid rond veiligheid en gedragscode gelezen.',
    en: 'As a parent or legal guardian, I give consent for my child to take part in the seminar of Insight Seminars België mentioned above. I have read the terms and conditions and the safeguarding and code of conduct policy.',
  },
  consentVersion: '2026-09',
  socials: [
    { platform: 'Facebook', url: 'https://www.facebook.com/Insightseminarsbelgium' },
    { platform: 'Instagram', url: 'https://www.instagram.com/insightseminarsbelgium' },
  ],
  internationalLinks: [
    { label: 'Insight Seminars (internationaal)', url: 'https://insightseminars.org' },
    { label: 'Insight UK' },
    { label: 'Insight Bulgarije' },
    { label: 'Insight Cyprus' },
    { label: 'Insight Boston', url: 'https://insightboston.org' },
  ],
  internationalCalendarUrl: 'https://insightseminars.org',
  linksPage: [
    { label: { nl: 'Gratis infosessie', en: 'Free info session' }, url: '/agenda?type=infoSessions', highlight: true },
    { label: { nl: 'Volgende Insight I', en: 'Next Insight I' }, url: '/agenda?type=seminars', highlight: true },
    { label: { nl: 'Instagram', en: 'Instagram' }, url: 'https://www.instagram.com/insightseminarsbelgium' },
    { label: { nl: 'Facebook', en: 'Facebook' }, url: 'https://www.facebook.com/Insightseminarsbelgium' },
    { label: { nl: 'Nieuwsbrief', en: 'Newsletter' }, url: '/#nieuwsbrief' },
    { label: { nl: 'Contact', en: 'Contact' }, url: '/contact' },
  ],
}

export const venues: Venue[] = [
  {
    _id: 'venue-werkhuys',
    name: "'t Werkhuys",
    street: 'Zegelstraat 13',
    postalCode: '2140',
    city: 'Antwerpen',
    country: 'België',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=%27t+Werkhuys+Zegelstraat+13+2140+Antwerpen',
  },
  {
    _id: 'venue-stayokay-arnhem',
    name: 'Stayokay Arnhem',
    city: 'Arnhem',
    country: 'Nederland',
    // address: [TE BEVESTIGEN]
  },
]

export const facilitators: Facilitator[] = [
  { _id: 'fac-ruth', name: 'Ruth Rochelle', slug: 'ruth-rochelle', role: { nl: 'Facilitator', en: 'Facilitator' } },
  { _id: 'fac-mike', name: 'Mike Connor', slug: 'mike-connor', role: { nl: 'Facilitator', en: 'Facilitator' } },
  { _id: 'fac-david', name: 'David Raynr', slug: 'david-raynr', role: { nl: 'Facilitator', en: 'Facilitator' } },
]

export const team: TeamMember[] = [
  {
    _id: 'team-isabel',
    name: 'Isabel Leybaert',
    order: 1,
    role: { nl: 'Actrice, dramadocent en theatercoach', en: 'Actress, drama teacher and theatre coach' },
    photo: {
      src: '/images/team/isabel-leybaert.jpg',
      alt: { nl: 'Portret van Isabel Leybaert', en: 'Portrait of Isabel Leybaert' },
    },
    bio: {
      nl: 'In mijn professionele leven hou ik me bezig als actrice, dramadocent en theatercoach. Tot op de dag van vandaag word ik warm en vrolijk bij de herinnering aan mijn allereerste Insight in 1994. Ik ben ervan overtuigd dat de talrijke inzichten die Insight mij bood in mijn eigen patronen, mijn valkuilen, maar ook in mijn persoonlijke waardes en kwaliteiten, mijn leven ontzettend veel rijker en bewuster heeft gemaakt. Zulke leerrijke en hartverwarmende ervaring wil ik iedereen toewensen. Het is dan ook daarom dat ik niet heb getwijfeld om als vrijwilliger mee te werken aan een herstart voor vzw Insight in België.',
      en: 'In my professional life I work as an actress, drama teacher and theatre coach. To this day I feel warm and happy remembering my very first Insight in 1994. I am convinced that the many insights Insight gave me into my own patterns and pitfalls, but also into my personal values and qualities, have made my life so much richer and more conscious. I wish everyone such an enriching, heartwarming experience. That is why I didn’t hesitate to volunteer for the relaunch of vzw Insight in Belgium.',
    },
  },
  {
    _id: 'team-lulu',
    name: 'Lulu Aertgeerts',
    order: 2,
    role: {
      nl: 'Dramaturge en opleidingshoofd Musical, Koninklijk Conservatorium Brussel',
      en: 'Dramaturge and head of the Musical Theatre department, Royal Conservatory Brussels',
    },
    photo: {
      src: '/images/team/lulu-aertgeerts.jpg',
      alt: { nl: 'Portret van Lulu Aertgeerts', en: 'Portrait of Lulu Aertgeerts' },
    },
    bio: {
      nl: 'Ik ben opgeleid als dramaturg (KUL 1986), maar was naast mijn tv-werk als actrice (o.a. Wittekerke, Familie, coach voor Idool en X-factor) voornamelijk werkzaam in de musicalsector (Koninklijk Ballet van Vlaanderen, Stage Entertainment, Music Hall, …). Sinds 2013 ben ik opleidingshoofd van de Musicalafdeling van het Koninklijk Conservatorium Brussel, en pik ik sporadisch nog een rolletje mee, omdat het leven op, voor, achter en naast het podium een waar feest is. Ik ben een Insight 1, 2 en 3 – grad en assisteerde bij meerdere seminaries. Insight heeft me geleerd om thuis te komen bij mezelf. De inzichten die ik tijdens de seminaries verworven heb, helpen me nog dagelijks om prioriteiten te stellen, in het ‘nu’ te leven, en met focus en daadkracht te werken aan het realiseren van mijn dromen. Ook genieten en niks doen is dik oké.',
      en: 'I trained as a dramaturge (KU Leuven, 1986), but alongside TV work as an actress (including Wittekerke, Familie, coaching Idool and X Factor) I mainly worked in musical theatre (Royal Ballet of Flanders, Stage Entertainment, Music Hall, …). Since 2013 I’ve headed the Musical Theatre department at the Royal Conservatory of Brussels, and I still take the odd role, because life on, in front of, behind and beside the stage is a true celebration. I’m an Insight 1, 2 and 3 graduate and have assisted at several seminars. Insight taught me to come home to myself. What I learned there still helps me daily to set priorities, live in the ‘now’, and work with focus and drive toward my dreams. Enjoying life and doing nothing is perfectly fine too.',
    },
  },
  {
    _id: 'team-jerko',
    name: 'Jerko Božiković',
    order: 3,
    role: { nl: 'Voormalig professioneel danser, trainer, coach en keynote speaker', en: 'Former professional dancer, trainer, coach and keynote speaker' },
    photo: {
      src: '/images/team/jerko-bozikovic.jpg',
      alt: { nl: 'Portret van Jerko Božiković', en: 'Portrait of Jerko Božiković' },
    },
    bio: {
      nl: 'Ik heb 2 grote carrières/dromen mogen hebben, eerst 16 jaar als professioneel danser in vele musicals, tv-shows en revues in binnen- en buitenland. Sinds 2001 werk ik als trainer – coach – keynote speaker in de bedrijfswereld, waar ik elke dag mensen mag inspireren, uitdagen, bewust maken en laten groeien, en dit op 4 continenten. Insight heeft daar een grote rol in gespeeld om deze beide dromen toe te laten, uit te bouwen en van te genieten. Ik heb Insight 1, 2, 3, 4, Gift of the Heart en Leadership gedaan. Tussen 1995 en 2000 was ik ook city director voor Insight Benelux en organiseerde ik samen met een team jaarlijks verschillende Insight seminars. Het is met heel veel dankbaarheid en passie dat ik mee Insight in België op de kaart help zetten, om hier mensen terug naar hun hart, hun dromen en hun passie te helpen evolueren.',
      en: 'I’ve been lucky enough to have 2 big careers/dreams: first 16 years as a professional dancer in many musicals, TV shows and revues at home and abroad. Since 2001 I’ve worked as a trainer – coach – keynote speaker in the corporate world, where every day, on 4 continents, I get to inspire, challenge and grow people. Insight played a big role in allowing, building and enjoying both of those dreams. I’ve done Insight 1, 2, 3, 4, Gift of the Heart and Leadership. Between 1995 and 2000 I was also city director for Insight Benelux, organising several Insight seminars a year together with a team. It’s with great gratitude and passion that I help put Insight Belgium back on the map, helping people here evolve back toward their heart, their dreams and their passion.',
    },
  },
]

export const programs: Program[] = [
  {
    _id: 'program-insight-1',
    slug: 'insight-1',
    track: 'adults',
    order: 1,
    numeral: 'I',
    accent: 'accent1',
    title: { nl: 'Insight I', en: 'Insight I' },
    subtitle: { nl: 'Ontdek wat je echt wil', en: 'Awakening the Power of Your Heart' },
    officialName: 'Awakening the Power of Your Heart',
    durationLabel: { nl: '3 dagen', en: '3 days' },
    hoursLabel: { nl: 'Doorgaans van 9 tot 22 uur', en: 'Usually from 9am to 10pm' },
    groupSize: { nl: '', en: '' }, // "Meestal 20 tot 40 deelnemers" [TE BEVESTIGEN]
    lead: {
      nl: 'Een interactief seminar van drie dagen waarin je ontdekt wat je écht wil, en wat je nodig hebt om het ook te leven.',
      en: 'An interactive three-day seminar in which you discover what you really want, and what you need to live it.',
    },
    pathText: {
      nl: 'Drie dagen om helder te krijgen wat je wil en jezelf meer te vertrouwen.',
      en: 'Three days to get clear on what you want and to trust yourself more.',
    },
    outcomes: [
      { nl: 'Helder krijgen wat je wil, en hoe je intenties je daarbij helpen', en: 'Getting clear on what you want, and how your intentions help you' },
      { nl: 'Jezelf meer vertrouwen, waarderen en steunen', en: 'Trusting, valuing and supporting yourself more' },
      { nl: 'Feedback geven en ontvangen zonder in de verdediging te gaan', en: 'Giving and receiving feedback without getting defensive' },
      { nl: 'Vergeving gebruiken om oude pijn los te laten', en: 'Using forgiveness to let go of old pain' },
      { nl: 'Keuzes maken die kloppen met wat je diep vanbinnen weet', en: 'Making choices that match what you know deep down' },
    ],
    howItWorks: {
      nl: [
        'Je werkt in de grote groep, in kleine groepjes en met een partner. De facilitator geeft korte inleidingen, daarna ga je zelf aan de slag.',
        'Een team van ervaren vrijwilligers zorgt ervoor dat alles vlot en veilig verloopt.',
      ],
    },
    forWhom: {
      nl: ['Voor iedereen vanaf 18 jaar. Je hebt geen voorkennis nodig. Ben je jonger? Bekijk dan Tiener Insight.'],
    },
    expectations: [
      { title: { nl: 'Intensief', en: 'Intensive' }, text: { nl: 'Drie lange dagen, met voldoende pauzes.', en: 'Three long days, with plenty of breaks.' } },
      { title: { nl: 'In groep en met een partner', en: 'In a group and with a partner' }, text: { nl: 'Je werkt afwisselend in de grote groep, in kleine groepjes en met één andere deelnemer.', en: 'You work in turns in the large group, in small groups and with one other participant.' } },
      { title: { nl: 'Begeleid', en: 'Guided' }, text: { nl: 'Een ervaren facilitator en een team van vrijwilligers zorgen voor een veilige sfeer.', en: 'An experienced facilitator and a team of volunteers create a safe atmosphere.' } },
      { title: { nl: 'Geen voorkennis nodig', en: 'No prior experience needed' }, text: { nl: 'Je komt zoals je bent.', en: 'You come as you are.' } },
    ],
    heroImage: {
      src: '/images/seminar-room.png',
      alt: { nl: 'Deelnemers in gesprek tijdens Insight I', en: 'Participants in conversation during Insight I' },
    },
    seo: {
      title: { nl: 'Insight I — training voor persoonlijke groei in Antwerpen', en: 'Insight I — personal growth training in Antwerp' },
      description: { nl: 'Een interactief seminar van drie dagen om te ontdekken wat je echt wil.', en: 'An interactive three-day seminar to discover what you really want.' },
    },
  },
  {
    _id: 'program-insight-2',
    slug: 'insight-2',
    track: 'adults',
    order: 2,
    numeral: 'II',
    accent: 'accent2',
    title: { nl: 'Insight II', en: 'Insight II' },
    subtitle: { nl: 'Laat los wat je tegenhoudt', en: 'Committing to the Power of Your Heart' },
    officialName: 'Committing to the Power of Your Heart',
    durationLabel: { nl: '5 dagen', en: '5 days' },
    hoursLabel: { nl: 'Doorgaans van 9 tot 22 uur', en: 'Usually from 9am to 10pm' },
    groupSize: { nl: '', en: '' },
    prerequisites: ['insight-1'],
    lead: {
      nl: 'Vijf dagen om dieper te gaan. Je kijkt naar wat je nog tegenhoudt en kiest voluit voor wie je bent.',
      en: 'Five days to go deeper. You look at what still holds you back and fully choose who you are.',
    },
    pathText: {
      nl: 'Vijf dagen om los te laten wat je tegenhoudt en voluit te kiezen voor wie je bent.',
      en: 'Five days to let go of what holds you back and fully choose who you are.',
    },
    outcomes: [
      { nl: 'Zien wat je beperkt, en het loslaten', en: 'Seeing what limits you, and letting it go' },
      { nl: 'Eerlijker en liefdevoller communiceren', en: 'Communicating more honestly and lovingly' },
      { nl: 'Buiten je comfortzone stappen, op jouw manier', en: 'Stepping outside your comfort zone, your way' },
      { nl: 'Je intuïtie en je innerlijk weten vertrouwen', en: 'Trusting your intuition and inner knowing' },
      { nl: 'Je talenten en gaven ten volle opnemen', en: 'Fully taking up your talents and gifts' },
    ],
    howItWorks: {
      nl: [
        'Insight II bouwt verder op wat je in Insight I ontdekte. In vijf dagen is er ruimte om dieper te gaan en nieuw gedrag echt te oefenen.',
        'Je krijgt praktische tools mee die je ook na het seminar blijft gebruiken.',
      ],
    },
    forWhom: { nl: ['Voor wie Insight I volgde, in België of elders.'] },
    seo: {
      title: { nl: 'Insight II — persoonlijke ontwikkeling training in Antwerpen', en: 'Insight II — personal development training in Antwerp' },
      description: { nl: 'Vijf dagen om los te laten wat je tegenhoudt en voluit te kiezen voor wie je bent.', en: 'Five days to let go of what holds you back and fully choose who you are.' },
    },
  },
  {
    _id: 'program-insight-3',
    slug: 'insight-3',
    track: 'adults',
    order: 3,
    numeral: 'III',
    accent: 'accent3',
    title: { nl: 'Insight III', en: 'Insight III' },
    subtitle: { nl: 'Vind rust in jezelf, ook als het druk is', en: 'Living Peacefully in the Power of Your Heart' },
    officialName: 'Living Peacefully in the Power of Your Heart',
    // durationLabel, groupSize, locatie: [TE BEVESTIGEN]
    prerequisites: ['insight-2'],
    lead: {
      nl: 'Een seminar in retraitevorm dat voortbouwt op Insight I en II. Je leert telkens terug te keren naar je eigen centrum, ook als het leven druk wordt.',
      en: 'A retreat-style seminar that builds on Insight I and II. You learn to keep returning to your own centre, even when life gets busy.',
    },
    pathText: {
      nl: 'Een retraite om te verankeren wat je in Insight I en II ontdekte.',
      en: 'A retreat to anchor what you discovered in Insight I and II.',
    },
    outcomes: [
      { nl: 'Verankeren wat je in Insight I en II ontdekte', en: 'Anchoring what you discovered in Insight I and II' },
      { nl: 'Stilte en reflectie een vaste plek geven', en: 'Giving silence and reflection a lasting place' },
      { nl: 'In je kracht blijven, ook onder druk', en: 'Staying in your strength, even under pressure' },
      { nl: 'Met meer mildheid naar jezelf en anderen kijken', en: 'Looking at yourself and others with more gentleness' },
    ],
    howItWorks: {
      nl: ['Insight III vindt plaats in een rustige omgeving, weg van de dagelijkse drukte. Oefeningen, stilte en ontmoeting wisselen elkaar af.'],
    },
    forWhom: { nl: ['Voor wie Insight II volgde.'] },
    nextDateNote: { nl: 'Nieuwe data volgen binnenkort.', en: 'New dates will follow soon.' },
    seo: {
      title: { nl: 'Insight III — retraite voor persoonlijke groei', en: 'Insight III — retreat for personal growth' },
      description: { nl: 'Een seminar in retraitevorm dat voortbouwt op Insight I en II.', en: 'A retreat-style seminar that builds on Insight I and II.' },
    },
  },
  {
    _id: 'program-tiener-insight-1',
    slug: 'tiener-insight-1',
    track: 'teens',
    order: 1,
    numeral: 'I',
    accent: 'accent4',
    ageMin: 14,
    ageMax: 19,
    title: { nl: 'Tiener Insight I', en: 'Teen Insight I' },
    subtitle: { nl: 'Ontdek je eigen kracht', en: 'Discover your own strength' },
    // officialName: [TE BEVESTIGEN]
    durationLabel: { nl: '3,5 dagen', en: '3.5 days' },
    lead: {
      nl: 'Drie en een halve dag waarin jongeren van 14 tot 19 jaar bouwen aan zelfvertrouwen, beter leren communiceren en hun talenten ontdekken, in een veilige en begeleide groep.',
      en: 'Three and a half days in which young people aged 14 to 19 build self-confidence, learn to communicate better and discover their talents, in a safe and guided group.',
    },
    outcomes: [
      { nl: 'Meer zelfvertrouwen en zelfwaardering', en: 'More self-confidence and self-worth' },
      { nl: 'Zeggen wat je denkt en voelt, op een respectvolle manier', en: 'Saying what you think and feel, respectfully' },
      { nl: 'Je eigen talenten en sterktes herkennen', en: 'Recognising your own talents and strengths' },
      { nl: 'Omgaan met druk van buitenaf', en: 'Dealing with outside pressure' },
    ],
    howItWorks: { nl: [] },
    forWhom: { nl: ['Voor jongeren van 14 tot 19 jaar. Geen voorkennis nodig. Een ouder of voogd schrijft in en geeft toestemming.'] },
    seo: {
      title: { nl: 'Tiener Insight I — voor jongeren van 14 tot 19 jaar', en: 'Teen Insight I — for young people aged 14 to 19' },
      description: { nl: 'Bouwen aan zelfvertrouwen en beter communiceren, in een veilige groep.', en: 'Building self-confidence and better communication, in a safe group.' },
    },
  },
  {
    _id: 'program-tiener-insight-2',
    slug: 'tiener-insight-2',
    track: 'teens',
    order: 2,
    numeral: 'II',
    accent: 'accent4',
    ageMin: 14,
    ageMax: 19,
    title: { nl: 'Tiener Insight II', en: 'Teen Insight II' },
    subtitle: { nl: 'Kies voor jezelf', en: 'Choose yourself' },
    durationLabel: { nl: '5 dagen', en: '5 days' },
    prerequisites: ['tiener-insight-1'],
    lead: {
      nl: 'Vijf dagen om los te laten wat niet werkt in je leven en te oefenen met nieuwe, betere keuzes, in een veilige en ondersteunende groep.',
      en: 'Five days to let go of what is not working in your life and practise new, better choices, in a safe and supportive group.',
    },
    outcomes: [
      { nl: 'Oude gewoontes herkennen en loslaten', en: 'Recognising and letting go of old habits' },
      { nl: 'Bewust kiezen in plaats van meegaan', en: 'Choosing consciously instead of going along' },
      { nl: 'Verantwoordelijkheid nemen voor je eigen geluk', en: 'Taking responsibility for your own happiness' },
    ],
    howItWorks: { nl: [] },
    forWhom: { nl: ['Voor wie Tiener Insight I volgde.'] },
    nextDateNote: { nl: 'Verwacht in de zomer van 2028.', en: 'Expected in the summer of 2028.' },
    seo: {
      title: { nl: 'Tiener Insight II — kies voor jezelf', en: 'Teen Insight II — choose yourself' },
      description: { nl: 'Vijf dagen om te oefenen met nieuwe, betere keuzes.', en: 'Five days to practise new, better choices.' },
    },
  },
  {
    _id: 'program-tiener-insight-3',
    slug: 'tiener-insight-3',
    track: 'teens',
    order: 3,
    numeral: 'III',
    accent: 'accent4',
    ageMin: 14,
    ageMax: 19,
    title: { nl: 'Tiener Insight III', en: 'Teen Insight III' },
    subtitle: { nl: 'Thuiskomen bij jezelf', en: 'Coming home to yourself' },
    durationLabel: { nl: '5 dagen', en: '5 days' },
    prerequisites: ['tiener-insight-1', 'tiener-insight-2'],
    lead: {
      nl: 'Vijf dagen om even helemaal los te koppelen van de dagelijkse drukte, naar binnen te keren en te verankeren wat je in Tiener Insight I en II leerde.',
      en: 'Five days to fully unplug from daily busyness, turn inward and anchor what you learned in Teen Insight I and II.',
    },
    outcomes: [
      { nl: 'Rust vinden, weg van prikkels en verwachtingen', en: 'Finding calm, away from stimuli and expectations' },
      { nl: 'Contact maken met wat je echt belangrijk vindt', en: 'Connecting with what really matters to you' },
      { nl: 'Meenemen wat je leerde naar school, thuis en je vrienden', en: 'Taking what you learned to school, home and friends' },
    ],
    howItWorks: { nl: [] },
    forWhom: { nl: ['Voor wie Tiener Insight I en II volgde.'] },
    seo: {
      title: { nl: 'Tiener Insight III — thuiskomen bij jezelf', en: 'Teen Insight III — coming home to yourself' },
      description: { nl: 'Vijf dagen om naar binnen te keren en te verankeren wat je leerde.', en: 'Five days to turn inward and anchor what you learned.' },
    },
  },
]

const scheduleNote = {
  nl: 'Doorgaans van 9 tot 22 uur, uren kunnen afwijken.',
  en: 'Usually from 9am to 10pm, hours may vary.',
}

export const events: InsightEvent[] = [
  {
    _id: 'event-insight-2-2026-11',
    type: 'seminar',
    programSlug: 'insight-2',
    slug: 'insight-2-2026-11-antwerpen',
    start: '2026-11-04T09:00:00+01:00',
    end: '2026-11-08T22:00:00+01:00',
    scheduleNote,
    venueId: 'venue-werkhuys',
    facilitatorIds: ['fac-ruth'],
    language: 'en-nl',
    registrationStatus: 'open',
    paymentTiming: 'immediate',
    priceOptions: [
      { kind: 'earlyBird', label: { nl: 'Vroegboekprijs', en: 'Early-bird price' }, amount: 775, validUntil: '2026-10-04' },
      { kind: 'regular', label: { nl: 'Standaardprijs', en: 'Standard price' }, amount: 850 },
      { kind: 'audit', label: { nl: 'Herhaalprijs (audit)', en: 'Audit price (for graduates)' }, amount: 695, requiresGraduate: true },
    ],
  },
  {
    _id: 'event-insight-1-2027-02',
    type: 'seminar',
    programSlug: 'insight-1',
    slug: 'insight-1-2027-02-antwerpen',
    start: '2027-02-19T09:00:00+01:00',
    end: '2027-02-21T22:00:00+01:00',
    scheduleNote,
    venueId: 'venue-werkhuys',
    facilitatorIds: ['fac-ruth'],
    language: 'en-nl',
    registrationStatus: 'open',
    paymentTiming: 'immediate',
    priceOptions: [
      { kind: 'earlyBird', label: { nl: 'Vroegboekprijs', en: 'Early-bird price' }, amount: 475, validUntil: '2027-01-19' },
      { kind: 'regular', label: { nl: 'Standaardprijs', en: 'Standard price' }, amount: 525 },
      { kind: 'audit', label: { nl: 'Herhaalprijs (audit)', en: 'Audit price (for graduates)' }, amount: 250, requiresGraduate: true },
    ],
  },
  {
    _id: 'event-insight-1-2027-05',
    type: 'seminar',
    programSlug: 'insight-1',
    slug: 'insight-1-2027-05-antwerpen',
    start: '2027-05-14T09:00:00+02:00',
    end: '2027-05-16T22:00:00+02:00',
    scheduleNote,
    venueId: 'venue-werkhuys',
    facilitatorIds: ['fac-mike'],
    language: 'en-nl',
    registrationStatus: 'open',
    paymentTiming: 'immediate',
    priceOptions: [
      { kind: 'earlyBird', label: { nl: 'Vroegboekprijs', en: 'Early-bird price' }, amount: 475, validUntil: '2027-04-14' },
      { kind: 'regular', label: { nl: 'Standaardprijs', en: 'Standard price' }, amount: 525 },
      { kind: 'audit', label: { nl: 'Herhaalprijs (audit)', en: 'Audit price (for graduates)' }, amount: 250, requiresGraduate: true },
    ],
  },
  {
    _id: 'event-tiener-insight-1-2027-05',
    type: 'teenSeminar',
    programSlug: 'tiener-insight-1',
    slug: 'tiener-insight-1-2027-05',
    start: '2027-05-06T09:00:00+02:00',
    end: '2027-05-09T22:00:00+02:00',
    language: 'nl',
    registrationStatus: 'open',
    paymentTiming: 'immediate',
    priceOptions: [
      { kind: 'option', label: { nl: 'Met overnachting', en: 'With overnight stay' }, amount: 600 },
      { kind: 'option', label: { nl: 'Zonder overnachting', en: 'Without overnight stay' }, amount: 400 },
    ],
  },
  {
    _id: 'event-tiener-insight-3-2027-08',
    type: 'teenSeminar',
    programSlug: 'tiener-insight-3',
    slug: 'tiener-insight-3-2027-08',
    start: '2027-08-16T09:00:00+02:00',
    end: '2027-08-20T22:00:00+02:00',
    language: 'nl',
    registrationStatus: 'open',
    paymentTiming: 'later',
    paymentDueDate: '2027-01-01',
    priceOptions: [
      { kind: 'earlyBird', label: { nl: 'Vroegboekprijs', en: 'Early-bird price' }, amount: 900, validUntil: '2026-09-20' },
      { kind: 'regular', label: { nl: 'Standaardprijs', en: 'Standard price' }, amount: 1000 },
    ],
  },
]

export const internationalEvents: InternationalEvent[] = []

export const testimonials: Testimonial[] = []

export const faqs: Faq[] = [
  { _id: 'faq-1', category: 'algemeen', order: 1, question: { nl: 'Wat is Insight precies?', en: 'What exactly is Insight?' }, answer: { nl: ['Insight is een reeks ervaringsgerichte seminars rond persoonlijke groei, georganiseerd door een educatieve organisatie zonder winstoogmerk. Je leert niet alleen uit presentaties, maar vooral door te doen: oefeningen, gesprekken en reflectie.'] } },
  { _id: 'faq-2', category: 'algemeen', order: 2, question: { nl: 'Is Insight een vorm van therapie?', en: 'Is Insight a form of therapy?' }, answer: { nl: ['Nee. Insight is een educatief programma en vervangt geen professionele hulp. Ben je in behandeling, of twijfel je of een seminar nu goed voor je is? Overleg dan eerst met je arts of therapeut, en neem gerust contact met ons op.'] } },
  { _id: 'faq-3', category: 'algemeen', order: 3, question: { nl: 'Heeft Insight een religieuze achtergrond?', en: 'Does Insight have a religious background?' }, answer: { nl: ['Nee. Insight onderwijst geen geloof of levensbeschouwing. Je test zelf wat voor jou werkt en neemt mee wat bij je past.'] } },
  { _id: 'faq-4', category: 'algemeen', order: 4, question: { nl: 'Voor wie is Insight I bedoeld?', en: 'Who is Insight I for?' }, answer: { nl: ['Voor iedereen vanaf 18 jaar die zichzelf beter wil leren kennen en bewuster wil leven. Je hebt geen voorkennis nodig. Voor jongeren van 14 tot 19 jaar is er Tiener Insight.'] } },
  { _id: 'faq-5', category: 'algemeen', order: 5, question: { nl: 'Wat betekent "the Power of Your Heart"?', en: 'What does "the Power of Your Heart" mean?' }, answer: { nl: ['Zo heten de seminars internationaal. Met "je hart" bedoelen we niet iets zweverigs, maar het deel van jezelf dat weet wat je echt belangrijk vindt. Deelnemers vertellen het vaak het best zelf: lees hun ervaringen bij elk seminar.'] } },
  { _id: 'faq-6', category: 'algemeen', order: 6, question: { nl: 'Moet ik veel over mezelf vertellen?', en: 'Do I have to share a lot about myself?' }, answer: { nl: ['Nee. Je bepaalt zelf wat en hoeveel je deelt. Niemand wordt verplicht om iets te vertellen.'] } },
  { _id: 'faq-7', category: 'praktisch', order: 7, question: { nl: 'Hoe ziet een seminardag eruit?', en: 'What does a seminar day look like?' }, answer: { nl: ['Een seminardag is lang: doorgaans van 9 tot 22 uur, met voldoende pauzes. De exacte uren vind je bij elke datum in de agenda.'] } },
  { _id: 'faq-8', category: 'praktisch', order: 8, question: { nl: 'Met hoeveel mensen zit je in een seminar?', en: 'How many people are in a seminar?' }, answer: { nl: ['Meestal met 20 tot 40 deelnemers, begeleid door een facilitator en een team van vrijwilligers. Je werkt ook vaak in kleine groepjes of met één partner.'] } },
  { _id: 'faq-9', category: 'praktisch', order: 9, question: { nl: 'In welke taal gaat een seminar door?', en: 'In which language is a seminar held?' }, answer: { nl: ['Dat staat bij elke datum in de agenda. Sommige seminars worden in het Engels gegeven, met vertaling naar het Nederlands.'] } },
  { _id: 'faq-10', category: 'praktisch', order: 10, question: { nl: 'Waar vinden de seminars plaats?', en: 'Where do the seminars take place?' }, answer: { nl: ['De seminars voor volwassenen vinden plaats in Antwerpen. Het exacte adres staat bij elke datum. Tiener Insight kan op een andere locatie doorgaan.'] } },
  { _id: 'faq-11', category: 'praktisch', order: 11, question: { nl: "Worden er foto's genomen?", en: 'Are photos taken?' }, answer: { nl: ['Soms nemen we sfeerfoto\u2019s van de groep, nooit van individuele oefeningen. Bij je inschrijving kies je zelf of je daarop mag staan.'] } },
  { _id: 'faq-12', category: 'praktisch', order: 12, question: { nl: 'Wat moet ik meebrengen?', en: 'What should I bring?' }, answer: { nl: ['Alle praktische informatie krijg je in je bevestigingsmail.'] } },
  { _id: 'faq-13', category: 'betalen', order: 13, question: { nl: 'Wat kost een seminar?', en: 'What does a seminar cost?' }, answer: { nl: ['De prijs staat bij elke datum in de agenda. Wie vroeg inschrijft, betaalt vaak een lagere vroegboekprijs. Volgde je het seminar al eerder? Dan kan je het opnieuw volgen aan een verlaagd herhaaltarief (audit).'] } },
  { _id: 'faq-14', category: 'betalen', order: 14, question: { nl: 'Hoe kan ik betalen?', en: 'How can I pay?' }, answer: { nl: ['Je betaalt online met Bancontact, iDEAL of kaart. Je kan ook overschrijven; je krijgt dan een gestructureerde mededeling. Je inschrijving is definitief zodra je betaling binnen is.'] } },
  { _id: 'faq-15', category: 'betalen', order: 15, question: { nl: 'Kan ik een voorschot betalen?', en: 'Can I pay a deposit?' }, answer: { nl: ['Bij sommige seminars kan je eerst een voorschot betalen en de rest later, via de persoonlijke betaallink in je e-mail.'] } },
  { _id: 'faq-16', category: 'betalen', order: 16, question: { nl: 'Ik betaalde al een voorschot of word gesponsord. Hoe gaat dat?', en: 'I already paid a deposit or am sponsored. How does that work?' }, answer: { nl: ['Vink het aan bij je inschrijving en vul het bedrag in. Wij controleren het en sturen je daarna een betaallink voor het resterende bedrag.'] } },
  { _id: 'faq-17', category: 'betalen', order: 17, question: { nl: 'Kan ik een factuur krijgen?', en: 'Can I get an invoice?' }, answer: { nl: ['Ja. Duid bij je inschrijving aan dat je een factuur nodig hebt en vul de gegevens van je bedrijf of organisatie in, en laat ons weten of je met Peppol werkt.'] } },
  { _id: 'faq-18', category: 'betalen', order: 18, question: { nl: 'Wat als ik niet kan komen?', en: 'What if I cannot attend?' }, answer: { nl: ['Laat het ons zo snel mogelijk weten via info@insightseminars.be. Wat er met je betaling gebeurt, lees je in onze algemene voorwaarden.'] } },
  { _id: 'faq-19', category: 'tieners', order: 19, question: { nl: 'Hoe schrijf ik mijn tiener in?', en: 'How do I register my teenager?' }, answer: { nl: ['Een ouder of voogd vult het inschrijvingsformulier in. Is je tiener jonger dan 18? Dan geef je in de laatste stap toestemming: je ondertekent online of je uploadt een ondertekend formulier.'] } },
  { _id: 'faq-20', category: 'tieners', order: 20, question: { nl: 'Mag mijn tiener zichzelf inschrijven?', en: 'Can my teenager register themselves?' }, answer: { nl: ['Jongeren vanaf 18 jaar kunnen zichzelf inschrijven. Voor jongere tieners schrijft een ouder of voogd in.'] } },
  { _id: 'faq-21', category: 'tieners', order: 21, question: { nl: 'Wie begeleidt de tieners?', en: 'Who supervises the teenagers?' }, answer: { nl: ['Een ervaren facilitator en een team van volwassen vrijwilligers.'] } },
  { _id: 'faq-22', category: 'tieners', order: 22, question: { nl: 'Ik ken Insight zelf niet. Kan ik eerst meer te weten komen?', en: "I don't know Insight myself. Can I learn more first?" }, answer: { nl: ['Zeker. Kom naar een gratis infosessie of neem contact op, dan vertellen we je graag meer.'] } },
  { _id: 'faq-23', category: 'tieners', order: 23, question: { nl: 'Blijven de tieners overnachten?', en: 'Do the teenagers stay overnight?' }, answer: { nl: ['Dat hangt af van het seminar en de gekozen formule. Bij elke datum zie je of er een formule met overnachting is.'] } },
]

export const homePage: HomePage = {
  hero: {
    title: { nl: 'Voel je dat er meer in je leven zit?', en: 'Do you feel there is more to your life?' },
    lead: {
      nl: 'Insight is een intensieve training van een paar dagen waarin je ervaart hoe je in het leven staat, en ontdekt wat er nog meer mogelijk is.',
      en: 'Insight is an intensive training of a few days in which you experience how you relate to life, and discover what more is possible.',
    },
    primaryCta: { nl: 'Kom naar een gratis infosessie', en: 'Come to a free info session' },
    secondaryCta: { nl: 'Bekijk de seminars', en: 'See the seminars' },
    image: {
      src: '/images/home-hero.png',
      alt: {
        nl: 'Deelnemers in gesprek tijdens een Insight-seminar in een lichte ruimte',
        en: 'Participants in conversation during an Insight seminar in a bright room',
      },
    },
  },
  recognise: {
    intro: {
      nl: 'Je hoeft niet precies te weten wat er aan de hand is. Misschien herken je jezelf in een van deze zinnen.',
      en: "You don't have to know exactly what's going on. Maybe you recognise yourself in one of these sentences.",
    },
    situations: [
      { label: { nl: 'Ik loop steeds opnieuw tegen dezelfde patronen aan.', en: 'I keep running into the same patterns.' }, target: 'infoSession' },
      { label: { nl: 'Ik wil meer uit mijn leven halen, maar weet niet goed hoe.', en: "I want more out of my life, but don't quite know how." }, target: 'program', programSlug: 'insight-1' },
      { label: { nl: 'Ik verlang naar meer verbinding met anderen.', en: 'I long for more connection with others.' }, target: 'program', programSlug: 'insight-1' },
      { label: { nl: 'Ik weet niet goed wat ik zelf eigenlijk wil.', en: "I don't really know what I want myself." }, target: 'infoSession' },
      { label: { nl: 'De manier waarop ik tot nu toe met dingen omging, werkt niet meer.', en: 'The way I dealt with things until now no longer works.' }, target: 'program', programSlug: 'insight-1' },
      { label: { nl: 'Ik wil mijn tiener sterker in het leven zien staan.', en: 'I want to see my teenager stand stronger in life.' }, target: 'teens' },
    ],
    fallback: {
      nl: 'Veel deelnemers kwamen met net deze vraag binnen. Op de gratis infosessie vertellen ze hoe het voor hen was.',
      en: 'Many participants came in with exactly this question. At the free info session they tell you how it was for them.',
    },
  },
  whatIsInsight: {
    heading: { nl: 'Wat is Insight?', en: 'What is Insight?' },
    body: {
      nl: 'Insight is een intensieve, ervaringsgerichte training. Je onderzoekt je patronen, je keuzes, je relaties en je grenzen. Niet alleen met je hoofd: je ervaart het, in contact met jezelf en met anderen.',
      en: 'Insight is an intensive, experiential training. You explore your patterns, your choices, your relationships and your boundaries. Not only with your head: you experience it, in contact with yourself and others.',
    },
  },
  howItWorks: {
    heading: { nl: 'Zo werkt het', en: 'How it works' },
    points: [
      { title: { nl: 'Ervaren, niet alleen praten', en: 'Experience, not just talk' }, text: { nl: 'Oefeningen, gesprekken en interactie laten je zien wat er echt gebeurt, en je oefent meteen met nieuwe keuzes.', en: 'Exercises, conversations and interaction show you what really happens, and you practise new choices right away.' } },
      { title: { nl: 'Intensief en praktisch', en: 'Intensive and practical' }, text: { nl: 'Een seminar duurt maar een paar dagen, maar met lange dagen. Waar andere trajecten maanden vragen, beleef je hier in korte tijd heel veel.', en: 'A seminar lasts only a few days, but with long days. Where other paths take months, here you experience a great deal in a short time.' } },
      { title: { nl: 'Jouw tempo, jouw conclusies', en: 'Your pace, your conclusions' }, text: { nl: 'Je deelt wat je zelf wil. Insight vraagt je niet om iets te geloven: je ontdekt zelf wat voor jou werkt.', en: "You share what you want. Insight doesn't ask you to believe anything: you discover for yourself what works for you." } },
    ],
  },
  benefits: {
    heading: { nl: 'Wat kan het je brengen?', en: 'What can it bring you?' },
    items: [
      { nl: 'Beter zien wat er echt in je speelt', en: 'Seeing more clearly what is really going on in you' },
      { nl: 'Inzicht in patronen die steeds terugkomen', en: 'Insight into patterns that keep returning' },
      { nl: 'Duidelijker voelen wat je wel en niet wil', en: 'Feeling more clearly what you do and do not want' },
      { nl: 'Je grenzen herkennen en uitspreken', en: 'Recognising and voicing your boundaries' },
      { nl: 'Meer verbinding met jezelf en anderen', en: 'More connection with yourself and others' },
      { nl: 'Meer vrijheid in hoe je reageert', en: 'More freedom in how you respond' },
    ],
  },
  testimonialsHeading: { nl: 'Wat deelnemers zeggen', en: 'What participants say' },
  testimonialIds: [],
  // No clip is uploaded yet (§17). The "Wat is Insight?" section falls back to a
  // still poster; no play button is shown until a real clip exists.
  videoPoster: {
    src: '/images/seminar-room.png',
    alt: {
      nl: 'Twee deelnemers in een een-op-een gesprek tijdens een seminar',
      en: 'Two participants in a one-to-one conversation during a seminar',
    },
  },
  forWho: {
    heading: { nl: 'Voor wie?', en: 'Who is it for?' },
    body: {
      nl: 'Voor iedereen vanaf 18 jaar. Je hoeft niet al met persoonlijke ontwikkeling bezig te zijn. Het volstaat dat je voelt: er mag iets veranderen, ook al weet je nog niet precies wat.',
      en: "For everyone aged 18 and over. You don't need to already be working on personal development. It's enough that you feel: something may change, even if you don't yet know exactly what.",
    },
    trustLine: { nl: 'Insight bestaat sinds 1978. Wereldwijd namen al meer dan een miljoen mensen deel.', en: 'Insight has existed since 1978. More than a million people worldwide have taken part.' },
  },
  path: {
    heading: { nl: 'Het pad', en: 'The path' },
    intro: { nl: 'Je begint met Insight I. Daarna kies je zelf of en wanneer je verdergaat.', en: 'You start with Insight I. After that you decide whether and when to continue.' },
    nextInsight1Heading: { nl: 'Volgende Insight I', en: 'Next Insight I' },
    infoSessionLine: { nl: 'Eerst kennismaken?', en: 'Want to get to know us first?' },
    teenLine: { nl: 'Voor jongeren van 14 tot 19 jaar is er Tiener Insight.', en: 'For young people aged 14 to 19 there is Teen Insight.' },
  },
  upcomingHeading: { nl: 'Binnenkort', en: 'Coming up' },
  seo: {
    title: { nl: 'Insight Seminars België | Training voor persoonlijke groei in Antwerpen', en: 'Insight Seminars België | Personal growth training in Antwerp' },
    description: { nl: 'Intensieve, ervaringsgerichte training voor persoonlijke groei. Ontdek je patronen, maak bewustere keuzes en ervaar meer verbinding. Kom naar een gratis infosessie.', en: 'Intensive, experiential training for personal growth. Discover your patterns, make more conscious choices and experience more connection. Come to a free info session.' },
  },
}

export const aboutPage: AboutPage = {
  hero: { title: { nl: 'Over Insight', en: 'About Insight' }, lead: { nl: 'Wat Insight is, hoe het werkt, en wie het in België mogelijk maakt.', en: 'What Insight is, how it works, and who makes it possible in Belgium.' } },
  sections: [
    { heading: { nl: 'Herken je dit?', en: 'Does this sound like you?' }, short: { nl: 'Heb je soms het gevoel dat er meer in je leven zit, maar weet je niet precies wat? Loop je steeds tegen dezelfde dingen aan?', en: 'Do you sometimes feel there is more to your life, but not quite know what? Do you keep running into the same things?' }, more: { nl: 'Misschien wil je meer verbinding, beter begrijpen waarom je doet wat je doet, of ontdekken wat je zelf wil, los van de verwachtingen van anderen. Je hoeft daarvoor niet precies te weten wat er aan de hand is, en je hoeft ook nog niet bezig te zijn met persoonlijke ontwikkeling. Nieuwsgierigheid is genoeg.' } },
    { heading: { nl: 'Wat is Insight?', en: 'What is Insight?' }, short: { nl: 'Insight is een intensieve, ervaringsgerichte training waarin je onderzoekt hoe jij in het leven staat: je patronen, je keuzes, je relaties en je grenzen.', en: 'Insight is an intensive, experiential training in which you explore how you relate to life: your patterns, choices, relationships and boundaries.' }, more: { nl: 'Je ontdekt waar je jezelf tegenhoudt, waar je meer vrijheid kan ervaren en wat voor jou echt belangrijk is. Dat doe je niet alleen met je hoofd. Je ervaart het, in contact met jezelf en met anderen. Insight is geen therapie en geen religie: het is een educatief programma waarin je zelf ervaart wat voor jou werkt.' } },
    { heading: { nl: 'Hoe werkt de training?', en: 'How does the training work?' }, short: { nl: 'Je praat niet alleen over wat je wil veranderen, je gaat ermee aan de slag: met oefeningen, gesprekken en interactie.', en: 'You not only talk about what you want to change, you work with it: through exercises, conversations and interaction.' }, more: { nl: 'Soms is dat confronterend, soms verrassend, soms net heel licht en speels. Je kijkt naar wat er echt gebeurt, in plaats van naar het verhaal dat je erover vertelt. Je oefent om aanwezig te blijven als iets ongemakkelijk wordt, en je ontdekt je automatische reacties, zodat je ruimte krijgt voor nieuwe keuzes.' } },
    { heading: { nl: 'Intensief, maar praktisch', en: 'Intensive, but practical' }, short: { nl: 'Een seminar duurt maar een paar dagen, maar de dagen zijn lang. Waar andere vormen van persoonlijke ontwikkeling soms maandenlang één gesprek per week vragen, beleef je bij Insight in korte tijd heel veel.', en: 'A seminar lasts only a few days, but the days are long. Where other forms of personal development sometimes take months of one conversation a week, at Insight you experience a great deal in a short time.' }, more: { nl: 'Niet omdat je na een paar dagen "klaar" bent, maar omdat een intensieve ervaring soms zichtbaar en voelbaar maakt waar je anders maanden omheen blijft lopen.' } },
  ],
  benefits: {
    heading: { nl: 'Wat kan Insight je brengen?', en: 'What can Insight bring you?' },
    items: [
      { nl: 'Beter zien wat er echt in je speelt', en: 'Seeing more clearly what is really going on in you' },
      { nl: 'Inzicht in patronen die steeds terugkomen', en: 'Insight into patterns that keep returning' },
      { nl: 'Duidelijker voelen wat je wel en niet wil', en: 'Feeling more clearly what you do and do not want' },
      { nl: 'Je grenzen herkennen en uitspreken', en: 'Recognising and voicing your boundaries' },
      { nl: 'Meer verbinding met jezelf en anderen', en: 'More connection with yourself and others' },
      { nl: 'Meer vrijheid in hoe je reageert', en: 'More freedom in how you respond' },
      { nl: 'Je begrijpt niet alleen wat je anders wil, je ervaart en oefent het ook.', en: 'You not only understand what you want differently, you also experience and practise it.' },
    ],
  },
  forWho: { heading: { nl: 'Voor wie?', en: 'Who is it for?' }, body: { nl: 'Niet alleen voor mensen die al bewust met persoonlijke ontwikkeling bezig zijn, maar juist ook voor wie voelt: er moet iets veranderen, al weet ik nog niet precies wat. Vanaf 18 jaar; voor jongeren is er Tiener Insight.', en: 'Not only for people already consciously working on personal development, but especially for those who feel: something has to change, even if I don\u2019t yet know exactly what. From 18 years; for young people there is Teen Insight.' } },
  story: {
    heading: { nl: 'Ons verhaal', en: 'Our story' },
    paragraphs: [
      { nl: 'Insight werd in 1978 opgericht door John-Roger en Russell Bishop, om mensen praktische tools te geven om bewuster en vanuit hun hart te leven. Wereldwijd namen al meer dan een miljoen mensen deel.', en: 'Insight was founded in 1978 by John-Roger and Russell Bishop, to give people practical tools to live more consciously and from the heart. More than a million people worldwide have taken part.' },
      { nl: 'Tussen 1993 en 2001 vonden er al Insight-seminars plaats in België, met honderden deelnemers. Jaren later namen enkele van hen de draad weer op, samen met mensen die Insight in het buitenland hadden leren kennen.', en: 'Between 1993 and 2001 Insight seminars already took place in Belgium, with hundreds of participants. Years later some of them picked up the thread again, together with people who had come to know Insight abroad.' },
      { nl: 'Intussen bundelen de Belgische en Nederlandse teams hun krachten. De seminars vinden plaats in België, en deelnemers uit Nederland zijn van harte welkom.', en: 'Meanwhile the Belgian and Dutch teams are joining forces. The seminars take place in Belgium, and participants from the Netherlands are very welcome.' },
    ],
  },
  teamIntro: { nl: 'Ons team bestaat uit vrijwilligers die zelf ervaren hebben wat Insight in beweging kan zetten.', en: 'Our team consists of volunteers who have themselves experienced what Insight can set in motion.' },
  facilitatorsIntro: { nl: 'De seminars worden geleid door ervaren Insight-facilitators.', en: 'The seminars are led by experienced Insight facilitators.' },
  support: { heading: { nl: 'Steun Insight', en: 'Support Insight' }, body: { nl: 'Insight Seminars België werkt zonder winstoogmerk. Met een gift help je om seminars in België mogelijk te maken. Je kan een bedrag overschrijven naar {iban} op naam van {accountHolder}, met als mededeling "gift". Dank je wel!', en: 'Insight Seminars België is a non-profit. With a gift you help make seminars in Belgium possible. You can transfer an amount to {iban} in the name of {accountHolder}, with "gift" as the reference. Thank you!' } },
  closing: { heading: { nl: 'Klaar om te beginnen?', en: 'Ready to begin?' } },
  seo: {
    title: { nl: 'Over Insight | Persoonlijke groei en zelfkennis', en: 'About Insight | Personal growth and self-knowledge' },
    description: { nl: 'Wat Insight is, hoe de training werkt en wie het in België mogelijk maakt.', en: 'What Insight is, how the training works and who makes it possible in Belgium.' },
  },
}

export const teensPage: TeensPage = {
  hero: {
    title: { nl: 'Jouw leven, jouw keuzes', en: 'Your life, your choices' },
    lead: { nl: 'Tiener Insight is een paar dagen samen met andere jongeren van 14 tot 19. Je leert jezelf beter kennen, zeggen wat je denkt, en kiezen wat bij jou past. Zonder preken, met veel doen.', en: 'Teen Insight is a few days together with other young people aged 14 to 19. You get to know yourself better, say what you think, and choose what suits you. No preaching, lots of doing.' },
    points: [
      { nl: 'Meer zelfvertrouwen', en: 'More self-confidence' },
      { nl: 'Beter omgaan met druk van buitenaf', en: 'Better at handling outside pressure' },
      { nl: 'Nieuwe vrienden die je echt snappen', en: 'New friends who really get you' },
    ],
  },
  media: {
    image: {
      src: '/images/teens-hero.png',
      alt: {
        nl: 'Jongeren lachen samen tijdens een Tiener Insight-workshop',
        en: 'Teenagers laughing together during a Teen Insight workshop',
      },
    },
  },
  parents: {
    heading: { nl: 'Voor ouders en voogden', en: 'For parents and guardians' },
    lead: { nl: 'Je tiener kiest voor een intensieve ervaring. We vertellen je graag precies wat er gebeurt.', en: 'Your teenager is choosing an intensive experience. We are happy to tell you exactly what happens.' },
    blocks: [
      { title: { nl: 'Wat gebeurt er?', en: 'What happens?' }, text: { nl: 'Oefeningen, gesprekken in kleine groepen en momenten van reflectie, aangepast aan de leeftijd.', en: 'Exercises, small-group conversations and moments of reflection, adapted to their age.' } },
      { title: { nl: 'Wie begeleidt?', en: 'Who supervises?' }, text: { nl: 'Een ervaren facilitator en een team van volwassen vrijwilligers.', en: 'An experienced facilitator and a team of adult volunteers.' } },
      { title: { nl: 'Overnachting', en: 'Overnight stay' }, text: { nl: 'Per seminar is er een formule met of zonder overnachting.', en: 'Each seminar offers an option with or without an overnight stay.' } },
      { title: { nl: 'Kosten', en: 'Costs' }, text: { nl: 'De prijs staat bij elke datum. Vraag gerust naar de mogelijkheden als de kostprijs een drempel is.', en: 'The price is listed with each date. Do ask about the options if the cost is a barrier.' } },
      { title: { nl: 'Inschrijven', en: 'Registering' }, text: { nl: 'Je vult het formulier in en geeft online toestemming, of je uploadt een ondertekend formulier.', en: 'You fill in the form and give consent online, or you upload a signed form.' } },
    ],
  },
  seo: {
    title: { nl: 'Tiener Insight | Voor jongeren van 14 tot 19 jaar', en: 'Teen Insight | For young people aged 14 to 19' },
    description: { nl: 'Een paar dagen om jezelf beter te leren kennen, in een veilige en begeleide groep. Voor tieners en hun ouders.', en: 'A few days to get to know yourself better, in a safe and guided group. For teens and their parents.' },
  },
}

export const contactPage: ContactPage = {
  hero: { title: { nl: 'Contact', en: 'Contact' }, lead: { nl: 'Heb je een vraag over een seminar, een inschrijving of Tiener Insight? Stuur ons een bericht, we helpen je graag verder.', en: 'Do you have a question about a seminar, a registration or Teen Insight? Send us a message, we are happy to help.' } },
  sections: {
    direct: { nl: 'Rechtstreeks contact', en: 'Direct contact' },
    venue: { nl: 'Waar de seminars plaatsvinden', en: 'Where the seminars take place' },
    follow: { nl: 'Volg ons', en: 'Follow us' },
  },
  seo: {
    title: { nl: 'Contact | Insight Seminars België', en: 'Contact | Insight Seminars België' },
    description: { nl: 'Stel je vraag over seminars, inschrijvingen of Tiener Insight.', en: 'Ask your question about seminars, registrations or Teen Insight.' },
  },
}

export const legalPages: LegalPage[] = [
  { kind: 'privacy', title: { nl: 'Privacyverklaring', en: 'Privacy statement' }, version: '2026-09', updatedAt: '2026-09-16', body: { nl: [] } },
  { kind: 'terms', title: { nl: 'Algemene voorwaarden', en: 'Terms and conditions' }, version: '2026-09', updatedAt: '2026-09-16', body: { nl: [] } },
  { kind: 'safeguarding', title: { nl: 'Veiligheid en gedragscode', en: 'Safeguarding and code of conduct' }, version: '2026-09', updatedAt: '2026-09-16', body: { nl: [] } },
]
