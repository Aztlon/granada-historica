import { z } from 'zod'
import { FEATURE_CATEGORIES, CONFIDENCE_VALUES, EVIDENCE_BASIS_VALUES, GEOMETRY_METHOD_VALUES } from './schema'

export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

const localizedTextSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
})

export const placeStopSchema = z.object({
  id: z.string().regex(/^place\.[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().positive(),
  focus: z.tuple([
    z.number().min(-3.7).max(-3.5),
    z.number().min(37.1).max(37.25),
  ]),
  primary_feature_id: z.string().min(3),
  related_feature_ids: z.array(z.string().min(3)).min(1),
  title: localizedTextSchema,
  introduction: localizedTextSchema,
  arrival_cue: localizedTextSchema,
})

export const pilotRouteSchema = z.object({
  id: z.string().regex(/^route\.[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(['preview', 'active']),
  title: localizedTextSchema,
  description: localizedTextSchema,
  stops: z.array(placeStopSchema).min(1),
})

const translatedFeatureSchema = z.object({
  name: z.string().min(1),
  historical_name: z.string().min(1).nullable(),
  modern_name: z.string().min(1).nullable(),
  aliases: z.array(z.string().min(1)),
  modern_search_terms: z.array(z.string().min(1)),
  period_note: z.string().min(20),
  summary: z.string().min(20),
  context_1492: z.string().min(20),
  after_1492: z.string().min(20),
  today: z.string().min(20),
  evidence_note: z.string().min(20),
  citation_supports: z.array(z.string().min(10)),
})

export const featureTranslationsSchema = z.object({
  features: z.record(z.string(), translatedFeatureSchema),
})

export type PilotRoute = z.infer<typeof pilotRouteSchema>
export type PlaceStop = z.infer<typeof placeStopSchema>
export type FeatureTranslation = z.infer<typeof translatedFeatureSchema>

export interface LocationFix {
  longitude: number
  latitude: number
  accuracy: number
  timestamp: number
}

export type LocalizedCategoryLabels = Record<(typeof FEATURE_CATEGORIES)[number], string>
export type LocalizedConfidenceLabels = Record<(typeof CONFIDENCE_VALUES)[number], string>
export type LocalizedEvidenceLabels = Record<(typeof EVIDENCE_BASIS_VALUES)[number], string>
export type LocalizedGeometryLabels = Record<(typeof GEOMETRY_METHOD_VALUES)[number], string>
