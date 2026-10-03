import { z } from 'zod'
import publicRegistryJson from '../../data/entity-presentations.json'
import type { Locale } from './pilotSchema'
import { featureIdSchema } from './schema'

const localizedOptionalEnglishSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1).optional(),
})

const generalDescriptionSchema = localizedOptionalEnglishSchema.superRefine((value, context) => {
  for (const [locale, description] of Object.entries(value)) {
    if (!description) continue
    if (description.length > 220) {
      context.addIssue({
        code: 'custom',
        path: [locale],
        message: 'La descripción general no puede superar los 220 caracteres.',
      })
    }
    if (/\r|\n/.test(description)) {
      context.addIssue({
        code: 'custom',
        path: [locale],
        message: 'La descripción general debe ocupar un solo párrafo.',
      })
    }
    const sentenceEndings = description.match(/[.!?](?:\s|$)/g)?.length ?? 0
    if (sentenceEndings !== 1 || !/[.!?]$/.test(description)) {
      context.addIssue({
        code: 'custom',
        path: [locale],
        message: 'La descripción general debe ser una sola oración completa.',
      })
    }
    if (/\b(?:14|15|16|17|18|19|20)\d{2}\b|no aprobado|aprobaciones|confianza|en construcción|en ampliación|hacia\s+(?:14|15|16|17|18|19|20)\d{2}/i.test(description)) {
      context.addIssue({
        code: 'custom',
        path: [locale],
        message: 'La descripción general no puede contener estado de revisión, obra o fecha de corte.',
      })
    }
  }
})

export const entityPresentationSchema = z.object({
  entity_id: featureIdSchema,
  canonical_name: localizedOptionalEnglishSchema,
  general_description: generalDescriptionSchema,
  source_refs: z.array(z.string().min(1)).min(1),
})

export const entityPresentationRegistrySchema = z.object({
  schema_version: z.literal(1),
  scope: z.enum(['public', 'research_c1550']),
  presentations: z.array(entityPresentationSchema),
})

const localizedRequiredSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
})

export const periodTitleDecisionSchema = z.discriminatedUnion('usage', [
  z.object({
    feature_id: featureIdSchema,
    usage: z.literal('canonical'),
    title: localizedRequiredSchema,
    rationale: z.null(),
    source_refs: z.array(z.string().min(1)).max(0),
  }),
  z.object({
    feature_id: featureIdSchema,
    usage: z.literal('historical_variant'),
    title: localizedRequiredSchema,
    rationale: localizedRequiredSchema,
    source_refs: z.array(z.string().min(1)).min(1),
  }),
])

export const periodTitleDecisionRegistrySchema = z.object({
  schema_version: z.literal(1),
  period_id: z.literal('c1550'),
  decisions: z.array(periodTitleDecisionSchema),
})

export type EntityPresentation = z.infer<typeof entityPresentationSchema>
export type LocalizedEntityPresentation = {
  entityId: string
  canonicalName: string
  generalDescription: string
  isLanguageFallback: boolean
}
export type PeriodTitleDecision = z.infer<typeof periodTitleDecisionSchema>

const publicRegistry = entityPresentationRegistrySchema.parse(publicRegistryJson)

if (publicRegistry.scope !== 'public') {
  throw new Error('El registro público de presentación debe declarar scope public.')
}

export const publicEntityPresentations = publicRegistry.presentations
export const publicEntityPresentationsById = new Map(
  publicEntityPresentations.map((presentation) => [presentation.entity_id, presentation]),
)

export function localizeEntityPresentation(
  presentation: EntityPresentation,
  locale: Locale,
): LocalizedEntityPresentation {
  const translatedDescription = locale === 'en' ? presentation.general_description.en : undefined
  return {
    entityId: presentation.entity_id,
    canonicalName: locale === 'en'
      ? presentation.canonical_name.en ?? presentation.canonical_name.es
      : presentation.canonical_name.es,
    generalDescription: translatedDescription ?? presentation.general_description.es,
    isLanguageFallback: locale === 'en' && translatedDescription === undefined,
  }
}
