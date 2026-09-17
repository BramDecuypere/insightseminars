'use client'

/**
 * Studio config (brief §5, §8.1). Embedded at /studio. Dutch UI via the
 * nl-NL locale bundle, field-level nl->en translation via @sanity/assist.
 */
import { assist } from '@sanity/assist'
import { visionTool } from '@sanity/vision'
import { nlNLLocale } from '@sanity/locale-nl-nl'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from '@/sanity/env'
import { schemaTypes } from '@/sanity/schemaTypes'
import { structure, SINGLETON_TYPES } from '@/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  title: 'Insight Seminars België',
  projectId: projectId || 'placeholder',
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons can't be created or duplicated from the "create new" menu.
    templates: (templates) =>
      templates.filter((t) => !SINGLETON_TYPES.includes(t.schemaType)),
  },
  document: {
    // Hide new/delete/duplicate for singletons (§5.3).
    actions: (input, context) =>
      SINGLETON_TYPES.includes(context.schemaType)
        ? input.filter(({ action }) =>
            action ? ['publish', 'discardChanges', 'restore'].includes(action) : false,
          )
        : input,
  },
  plugins: [
    structureTool({ structure }),
    // AI Assist: field-level translation nl -> en on every document type.
    // Activates once the project is on the non-profit or Growth plan (§5.1, §16).
    assist({
      translate: {
        field: {
          documentTypes: [
            'program',
            'event',
            'facilitator',
            'teamMember',
            'venue',
            'faq',
            'testimonial',
            'internationalEvent',
            'homePage',
            'aboutPage',
            'teensPage',
            'contactPage',
            'legalPage',
            'siteSettings',
          ],
          languages: [
            { id: 'nl', title: 'Nederlands' },
            { id: 'en', title: 'Engels' },
          ],
        },
      },
    }),
    // Dutch Studio UI (§5.1).
    nlNLLocale(),
    ...(process.env.NODE_ENV === 'development' ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
})
