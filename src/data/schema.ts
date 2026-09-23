import { z } from 'zod'

export const FEATURE_CATEGORIES = [
  'urban_structure',
  'walls_gates',
  'religion_learning',
  'commerce_civic',
  'water_infrastructure',
  'royal_elite',
  'burial_other',
] as const

export const CONFIDENCE_VALUES = [
  'secure',
  'probable',
  'approximate',
  'disputed',
] as const

export const EVIDENCE_BASIS_VALUES = [
  'surviving_fabric',
  'archaeology',
  'documentary',
  'historical_cartography',
  'toponymy',
  'parcel_morphology',
  'scholarly_reconstruction',
  'later_description',
  'other',
] as const

export const GEOMETRY_METHOD_VALUES = [
  'surviving_footprint',
  'archaeological_plan',
  'traced_georeferenced_map',
  'reconstructed_from_multiple_sources',
  'approximate_area',
  'representative_point',
  'modern_reference_location',
] as const

const featureIdSchema = z
  .string()
  .min(3)
  .regex(/^[a-z][a-z0-9-]*\.[a-z0-9-]+$/, 'Debe ser un identificador permanente con prefijo.')

const positionSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])

const linearRingSchema = z
  .array(positionSchema)
  .min(4)
  .superRefine((ring, context) => {
    const first = ring[0]
    const last = ring.at(-1)
    if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
      context.addIssue({
        code: 'custom',
        message: 'El primer y el último punto de un anillo deben coincidir.',
      })
    }
  })

export const geometrySchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Point'), coordinates: positionSchema }),
  z.object({ type: z.literal('MultiPoint'), coordinates: z.array(positionSchema).min(1) }),
  z.object({ type: z.literal('LineString'), coordinates: z.array(positionSchema).min(2) }),
  z.object({
    type: z.literal('MultiLineString'),
    coordinates: z.array(z.array(positionSchema).min(2)).min(1),
  }),
  z.object({ type: z.literal('Polygon'), coordinates: z.array(linearRingSchema).min(1) }),
  z.object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(z.array(linearRingSchema).min(1)).min(1),
  }),
])

const precisionSchema = z.enum(['exact', 'year', 'decade', 'century', 'circa', 'unknown'])

export const citationSchema = z.object({
  source_id: z.string().min(1),
  locator: z.string().min(1),
  supports: z.string().min(1),
})

export const historicalPropertiesSchema = z.object({
  id: featureIdSchema,
  name: z.string().min(1),
  historical_name: z.string().min(1).nullable(),
  modern_name: z.string().min(1).nullable(),
  aliases: z.array(z.string().min(1)),
  modern_search_terms: z.array(z.string().min(1)),
  category: z.enum(FEATURE_CATEGORIES),
  subtype: z.string().min(1),
  period: z.object({
    from_year: z.number().int().nullable(),
    to_year: z.number().int().nullable(),
    from_precision: precisionSchema,
    to_precision: precisionSchema,
    note: z.string(),
  }),
  present_c1492: z.enum(CONFIDENCE_VALUES),
  confidence: z.object({
    location: z.enum(CONFIDENCE_VALUES),
    time: z.enum(CONFIDENCE_VALUES),
  }),
  evidence_basis: z.array(z.enum(EVIDENCE_BASIS_VALUES)).min(1),
  summary: z.string().min(20),
  context_1492: z.string().min(20),
  after_1492: z.string().min(20),
  today: z.string().min(20),
  evidence_note: z.string().min(20),
  geometry_method: z.enum(GEOMETRY_METHOD_VALUES),
  geometry_source_refs: z.array(z.string().min(1)).min(1),
  citations: z.array(citationSchema),
  publication_status: z.enum(['research', 'reviewed', 'publishable']),
})

export const historicalFeatureSchema = z
  .object({
    type: z.literal('Feature'),
    id: featureIdSchema,
    properties: historicalPropertiesSchema,
    geometry: geometrySchema,
  })
  .superRefine((feature, context) => {
    if (feature.id !== feature.properties.id) {
      context.addIssue({
        code: 'custom',
        path: ['properties', 'id'],
        message: 'El id de la propiedad debe coincidir con el id de la entidad.',
      })
    }
    if (feature.properties.publication_status === 'publishable' && feature.properties.citations.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['properties', 'citations'],
        message: 'Una entidad publicable debe tener al menos una cita.',
      })
    }
  })

export const featureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(historicalFeatureSchema),
})

export const sourceSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int().nullable(),
  publisher: z.string().min(1),
  type: z.string().min(1),
  url: z.url().or(z.literal('')),
  identifier: z.string(),
  reuse_status: z.string().min(1),
  notes: z.string(),
})

export const sourceRegistrySchema = z.array(sourceSchema)

export const geometryAuditEntrySchema = z
  .object({
    feature_id: featureIdSchema,
    status: z.enum(['unverified', 'in_review', 'verified']),
    reviewed_on: z.iso.date().nullable(),
    geometry_source_refs: z.array(z.string().min(1)),
    check_method: z.string(),
    notes: z.string().min(1),
  })
  .superRefine((entry, context) => {
    if (entry.status === 'verified') {
      if (!entry.reviewed_on) {
        context.addIssue({
          code: 'custom',
          path: ['reviewed_on'],
          message: 'Una geometría verificada debe indicar la fecha de revisión.',
        })
      }
      if (entry.geometry_source_refs.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['geometry_source_refs'],
          message: 'Una geometría verificada debe indicar al menos una fuente geométrica.',
        })
      }
      if (entry.check_method.length < 20) {
        context.addIssue({
          code: 'custom',
          path: ['check_method'],
          message: 'Una geometría verificada debe documentar el método de comprobación.',
        })
      }
    }
  })

export const geometryAuditSchema = z.array(geometryAuditEntrySchema)

export const GAZETTEER_ENTITY_TYPES = [
  'quarter',
  'gate',
  'wall',
  'waterway',
  'bridge',
  'route',
  'building',
  'sector',
  'cemetery',
  'interpretation',
] as const

export const INVENTORY_STATUS_VALUES = [
  'mapped',
  'candidate',
  'disputed',
  'rejected',
  'unlocated',
] as const

export const NAME_ATTESTATION_VALUES = [
  'contemporary_documentary',
  'near_contemporary',
  'later_documentary',
  'modern_conventional',
  'reconstructed',
  'uncertain',
] as const

export const SURVIVAL_STATUS_VALUES = [
  'surviving',
  'partial',
  'lost',
  'buried',
  'landscape_continuity',
  'unknown',
  'not_applicable',
] as const

export const gazetteerEntrySchema = z
  .object({
    id: z.string().min(3).regex(/^gaz\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$/),
    canonical_name: z.string().min(1),
    entity_type: z.enum(GAZETTEER_ENTITY_TYPES),
    inventory_status: z.enum(INVENTORY_STATUS_VALUES),
    feature_id: featureIdSchema.nullable(),
    name_attestation: z.object({
      status: z.enum(NAME_ATTESTATION_VALUES),
      attested_name: z.string().min(1).nullable(),
      date_note: z.string().min(1),
      note: z.string().min(1),
      source_refs: z.array(z.string().min(1)).min(1),
    }),
    survival: z.object({
      status: z.enum(SURVIVAL_STATUS_VALUES),
      note: z.string().min(1),
    }),
    parent_ids: z.array(z.string().min(1)).default([]),
    related_ids: z.array(z.string().min(1)).default([]),
    source_refs: z.array(z.string().min(1)).min(1),
    notes: z.string().min(1),
    defensive_context: z
      .object({
        phase: z.string().min(1),
        role: z.enum(['outer_enclosure', 'inner_enclosure', 'palatine_enclosure', 'unknown']),
        in_use_c1492: z.enum(CONFIDENCE_VALUES),
        relationship_note: z.string().min(1),
      })
      .optional(),
  })
  .superRefine((entry, context) => {
    if (entry.inventory_status === 'mapped' && !entry.feature_id) {
      context.addIssue({
        code: 'custom',
        path: ['feature_id'],
        message: 'Una entrada cartografiada debe enlazar una entidad.',
      })
    }
    if (entry.inventory_status !== 'mapped' && entry.feature_id) {
      context.addIssue({
        code: 'custom',
        path: ['feature_id'],
        message: 'Una entrada no cartografiada no puede enlazar una geometría pública.',
      })
    }
  })

export const gazetteerSchema = z.array(gazetteerEntrySchema)

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number]
export type Confidence = (typeof CONFIDENCE_VALUES)[number]
export type EvidenceBasis = (typeof EVIDENCE_BASIS_VALUES)[number]
export type GeometryMethod = (typeof GEOMETRY_METHOD_VALUES)[number]
export type HistoricalFeature = z.infer<typeof historicalFeatureSchema>
export type HistoricalFeatureCollection = z.infer<typeof featureCollectionSchema>
export type HistoricalSource = z.infer<typeof sourceSchema>
export type GeometryAuditEntry = z.infer<typeof geometryAuditEntrySchema>
export type GazetteerEntry = z.infer<typeof gazetteerEntrySchema>
export type InventoryStatus = (typeof INVENTORY_STATUS_VALUES)[number]
export type NameAttestation = (typeof NAME_ATTESTATION_VALUES)[number]
export type SurvivalStatus = (typeof SURVIVAL_STATUS_VALUES)[number]
