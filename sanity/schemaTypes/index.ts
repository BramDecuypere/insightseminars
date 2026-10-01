import type { SchemaTypeDefinition } from 'sanity'

import { localeRichText, localeString, localeText } from './locale'
import {
  announcement,
  benefitsBlock,
  forWhoBlock,
  heroBasic,
  imageWithAlt,
  internationalLink,
  linkItem,
  readMoreBlock,
  seo,
  situationItem,
  social,
  titledText,
} from './objects/shared'
import { priceOption } from './objects/priceOption'
import { videoClip } from './objects/videoClip'
import { program } from './documents/program'
import { event } from './documents/event'
import { person, venue } from './documents/people'
import { faq, internationalEvent, testimonial } from './documents/editorial'
import { aboutPage, contactPage, homePage, teensPage } from './documents/pages'
import { legalPage, siteSettings } from './documents/settings'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Locale wrappers (§5.1)
  localeString,
  localeText,
  localeRichText,
  // Shared objects
  imageWithAlt,
  seo,
  social,
  linkItem,
  internationalLink,
  announcement,
  titledText,
  readMoreBlock,
  situationItem,
  priceOption,
  videoClip,
  heroBasic,
  benefitsBlock,
  forWhoBlock,
  // Documents (§5.2)
  program,
  event,
  person,
  venue,
  faq,
  testimonial,
  internationalEvent,
  homePage,
  aboutPage,
  teensPage,
  contactPage,
  legalPage,
  siteSettings,
]
