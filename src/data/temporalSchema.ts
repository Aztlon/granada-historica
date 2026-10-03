import { z } from 'zod'
import {
  CONFIDENCE_VALUES,
  EVIDENCE_BASIS_VALUES,
  FEATURE_CATEGORIES,
  GAZETTEER_ENTITY_TYPES,
  GEOMETRY_METHOD_VALUES,
  INVENTORY_STATUS_VALUES,
  NAME_ATTESTATION_VALUES,
  SURVIVAL_STATUS_VALUES,
  citationSchema,
  featureIdSchema,
  geometryAuditEntrySchema,
  geometrySchema,
  historicalPropertiesSchema,
} from './schema'

export const PERIOD_STATUS_VALUES = ['published', 'research', 'retired'] as const
export const PERIOD_PRESENCE_VALUES = ['present', 'absent', 'unknown', 'not_applicable'] as const
export const PERIOD_CHANGE_VALUES = [
  'not_applicable',
  'retained',
  'altered',
  'converted',
  'replaced',
  'demolished',
  'newly_built',
  'unknown',
] as const
export const PHYSICAL_STATE_VALUES = [
  'planned',
  'under_construction',
  'partially_in_use',
  'complete',
  'ruinous',
  'demolished',
  'unknown',
] as const
export const RESEARCH_STATUS_VALUES = [
  'not_started',
  'initial_sources',
  'ready_for_review',
  'reviewed',
] as const
export const RESEARCH_PRIORITY_VALUES = ['anchor', 'high', 'medium', 'defer'] as const
export const GEOMETRY_ACTION_VALUES = [
  'reuse_then_verify',
  'review_existing',
  'reconstruct_variant',
  'create_new',
  'none',
] as const

export const periodIdSchema = z.string().regex(/^c[0-9]{3,4}$/)

const localizedLabelSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
})

export const periodDefinitionSchema = z
  .object({
    id: periodIdSchema,
    representative_year: z.number().int(),
    evidence_window: z.object({
      from_year: z.number().int(),
      to_year: z.number().int(),
    }),
    status: z.enum(PERIOD_STATUS_VALUES),
    label: localizedLabelSchema,
    short_label: localizedLabelSchema,
    interpretation: localizedLabelSchema,
  })
  .superRefine((period, context) => {
    if (period.evidence_window.from_year > period.evidence_window.to_year) {
      context.addIssue({
        code: 'custom',
        path: ['evidence_window'],
        message: 'La ventana documental debe comenzar antes de terminar.',
      })
    }
    if (
      period.representative_year < period.evidence_window.from_year
      || period.representative_year > period.evidence_window.to_year
    ) {
      context.addIssue({
        code: 'custom',
        path: ['representative_year'],
        message: 'El año representativo debe quedar dentro de la ventana documental.',
      })
    }
  })

export const periodRegistrySchema = z.object({
  periods: z.array(periodDefinitionSchema).min(1),
})

export const featurePeriodStateSchema = z.object({
  period_id: periodIdSchema,
  presence: z.enum(PERIOD_PRESENCE_VALUES),
  temporal_confidence: z.enum(CONFIDENCE_VALUES),
  spatial_confidence: z.enum(CONFIDENCE_VALUES),
  change_from_previous: z.enum(PERIOD_CHANGE_VALUES),
  physical_state: z.enum(PHYSICAL_STATE_VALUES),
  name: z.string().min(1),
  function: z.string().min(1),
  summary: z.string().min(20),
  evidence_note: z.string().min(20),
  geometry_variant_id: z.string().min(1).nullable(),
  citations: z.array(citationSchema).min(1),
})

export const periodHistoricalPropertiesSchema = featurePeriodStateSchema.extend({
  id: featureIdSchema,
  aliases: z.array(z.string().min(1)),
  modern_search_terms: z.array(z.string().min(1)),
  category: z.enum(FEATURE_CATEGORIES),
  subtype: z.string().min(1),
  evidence_basis: z.array(z.enum(EVIDENCE_BASIS_VALUES)).min(1),
  geometry_method: z.enum(GEOMETRY_METHOD_VALUES),
  geometry_source_refs: z.array(z.string().min(1)).min(1),
  publication_status: z.enum(['research', 'reviewed', 'publishable']),
})

export const periodHistoricalFeatureSchema = z
  .object({
    type: z.literal('Feature'),
    id: featureIdSchema,
    properties: periodHistoricalPropertiesSchema,
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
  })

export const periodFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  period_id: periodIdSchema,
  features: z.array(periodHistoricalFeatureSchema),
})

export const compatibilityPeriodPropertiesSchema = historicalPropertiesSchema.extend({
  period_id: periodIdSchema,
  period_state: featurePeriodStateSchema,
})

export const compatibilityPeriodFeatureSchema = z
  .object({
    type: z.literal('Feature'),
    id: featureIdSchema,
    properties: compatibilityPeriodPropertiesSchema,
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
    if (feature.properties.period_id !== feature.properties.period_state.period_id) {
      context.addIssue({
        code: 'custom',
        path: ['properties', 'period_state', 'period_id'],
        message: 'El estado y la entidad deben pertenecer al mismo periodo.',
      })
    }
  })

export const compatibilityPeriodFeatureCollectionSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    period_id: periodIdSchema,
    features: z.array(compatibilityPeriodFeatureSchema),
  })
  .superRefine((collection, context) => {
    collection.features.forEach((feature, index) => {
      if (feature.properties.period_id !== collection.period_id) {
        context.addIssue({
          code: 'custom',
          path: ['features', index, 'properties', 'period_id'],
          message: 'La entidad debe pertenecer al periodo de la colección.',
        })
      }
    })
  })

export const periodGeometryAuditEntrySchema = z.intersection(
  z.object({ period_id: periodIdSchema }),
  geometryAuditEntrySchema,
)

export const periodGeometryAuditSchema = z.array(periodGeometryAuditEntrySchema)

const stableEntityIdSchema = z
  .string()
  .min(3)
  .regex(/^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/)

export const stableEntitySchema = z.object({
  id: stableEntityIdSchema,
  gazetteer_id: z.string().regex(/^gaz\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$/),
  feature_id: featureIdSchema.nullable(),
  canonical_name: z.string().min(1),
  entity_type: z.enum(GAZETTEER_ENTITY_TYPES),
  inventory_status: z.enum(INVENTORY_STATUS_VALUES),
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
  parent_ids: z.array(stableEntityIdSchema),
  related_ids: z.array(stableEntityIdSchema),
  source_refs: z.array(z.string().min(1)).min(1),
  notes: z.string().min(1),
})

export const stableEntityCatalogSchema = z.object({
  schema_version: z.literal(1),
  generated_from: z.literal('data/gazetteer.json'),
  entities: z.array(stableEntitySchema),
})

const sourceRefListSchema = z.array(z.string().min(1))

export const M10_3_FEATURE_IDS = [
  'religious.medina-great-mosque',
  'religious.cathedral-granada',
  'religious.royal-chapel',
  'civic.lonja-mercaderes',
  'religious.madraza-yusufiyya',
  'civic.university-curia',
  'royal.palace-charles-v',
  'gate.puerta-granadas',
] as const

export const M10_3_REVIEW_DISCIPLINES = [
  'historical',
  'architectural',
  'geometry',
  'translation',
] as const

export const M10_5_SUPPLEMENT_FEATURE_IDS = [
  'civic.real-chancilleria',
  'civic.hospital-real',
  'water.pilar-carlos-v',
  'religious.san-miguel-bajo',
  'religious.san-cristobal',
  'gate.alhambra-justice',
  'walls.alhambra-perimeter',
  'royal.alhambra',
  'civic.maristan',
] as const

export const M10_5_GEOMETRY_WAVE_1_FEATURE_IDS = [
  'religious.santa-cruz-real',
  'religious.san-jeronimo',
  'religious.san-jose',
  'religious.san-juan-reyes',
  'religious.san-matias',
  'religious.san-luis',
  'gate.elvira',
  'gate.monaita',
  'gate.alhambra-arms',
  'gate.alhambra-seven-floors',
  'commerce.corral-carbon',
  'water.banuelo',
  'water.darro',
  'water.genil',
  'route.elvira-axis',
  'bridge.carbon',
] as const

export const M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS = [
  'water.acequia-real-alhambra',
  'royal.casa-castril',
  'royal.casa-tiros',
  'gate.fajalauza',
  'gate.mawrur',
  'walls.albaicin-north',
  'walls.medina-lower',
  'water.acequia-aynadamar',
  'water.acequia-gorda',
  'royal.generalife',
  'gate.alhambra-arrabal',
  'bridge.cadi',
  'water.acequia-cadi',
  'water.acequia-romayla',
] as const

export const M10_5_GEOMETRY_WAVE_2_FEATURE_IDS = [
  'gate.fajalauza',
  'water.acequia-real-alhambra',
  'water.acequia-aynadamar',
  'water.acequia-gorda',
  'water.acequia-cadi',
  'water.acequia-romayla',
] as const

export const M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS = [
  'royal.casa-castril',
  'royal.casa-tiros',
  'gate.mawrur',
  'walls.albaicin-north',
  'walls.medina-lower',
  'royal.generalife',
  'gate.alhambra-arrabal',
  'bridge.cadi',
] as const

export const M10_5_GEOMETRY_FEATURE_IDS = [
  ...M10_5_GEOMETRY_WAVE_1_FEATURE_IDS,
  ...M10_5_GEOMETRY_WAVE_2_FEATURE_IDS,
] as const

export const M10_5_FEATURE_IDS = [
  ...M10_3_FEATURE_IDS,
  ...M10_5_SUPPLEMENT_FEATURE_IDS,
  ...M10_5_GEOMETRY_FEATURE_IDS,
] as const

export const M10_5_CLUSTER_IDS = [
  'parish_city',
  'civic_centre',
  'imperial_alhambra',
  'public_spaces',
  'inherited_systems',
  'quarters',
  'population_geography',
] as const

export const M10_5_REVIEW_DISCIPLINES = [
  'historical',
  'architectural',
  'geometry',
  'translation',
  'morisco_history',
  'population_geography',
] as const

export const M10_5_SOURCE_REVIEW_FEATURE_IDS = [
  'commerce.corral-carbon',
  'religious.santa-cruz-real',
  'water.acequia-real-alhambra',
  'religious.san-jeronimo',
  'religious.san-jose',
  'religious.san-juan-reyes',
  'religious.san-matias',
  'royal.casa-castril',
  'royal.casa-tiros',
  'religious.san-luis',
] as const

export const M10_5_SOURCE_REVIEW_2_FEATURE_IDS = [
  'gate.elvira',
  'gate.fajalauza',
  'gate.monaita',
  'gate.mawrur',
  'walls.albaicin-north',
  'walls.medina-lower',
  'water.acequia-aynadamar',
  'water.acequia-gorda',
  'water.darro',
  'route.elvira-axis',
] as const

export const M10_5_SOURCE_REVIEW_3_FEATURE_IDS = [
  'royal.generalife',
  'water.banuelo',
  'gate.alhambra-arms',
  'gate.alhambra-arrabal',
  'gate.alhambra-seven-floors',
  'bridge.cadi',
  'bridge.carbon',
  'water.genil',
  'water.acequia-cadi',
  'water.acequia-romayla',
] as const

export const M10_5_SOURCE_REVIEW_4_FEATURE_IDS = [
  'gate.alfajjarin',
  'gate.guadix',
  'gate.molinos',
  'gate.pescado',
  'walls.alcazaba-qadima-inner',
  'walls.axares-inner',
  'walls.mauror-realejo-inner',
  'water.acequia-axares',
  'water.acequia-realejo',
  'route.molinos-sierra-axis',
] as const

export const M10_5_EVIDENCE_WORKSTREAM_IDS = [
  'evidence.parish-jurisdictions',
  'evidence.public-spaces',
  'evidence.population-corpus',
  'evidence.citywide-extent',
] as const

export const M10_5_ANALYTICAL_LAYER_IDS = [
  'analysis.parish-boundaries',
  'analysis.public-squares',
  'analysis.population-geography',
  'analysis.citywide-extent',
] as const

export const M10_5_PUBLIC_SPACE_FEATURE_IDS = [
  'urban.plaza-bib-rambla',
  'urban.campo-principe',
  'urban.plaza-nueva',
] as const

const localizedReviewTextSchema = z.object({
  es: z.string().min(20),
  en: z.string().min(20),
})

const m10_3LocalizedContentSchema = z.object({
  name: z.string().min(1),
  function: z.string().min(1),
  summary: z.string().min(20),
  evidence_note: z.string().min(20),
  change_note: z.string().min(20),
})

const m10_3ClaimSchema = z.object({
  claim_id: z.string().regex(/^claim\.[a-z0-9-]+$/),
  topic: z.enum(['chronology', 'function', 'transformation', 'geometry', 'interpretation']),
  text: localizedReviewTextSchema,
  citations: z.array(citationSchema).min(1),
})

const m10_3RelationshipSchema = z.object({
  relation: z.enum([
    'adjacent_to',
    'attached_to',
    'contained_by',
    'replaces_function_of',
    'routes_toward',
    'shares_site_with',
    'transformed_from',
  ]),
  target_id: featureIdSchema,
  note: localizedReviewTextSchema,
})

const m10_3GeometryReviewSchema = z.object({
  representation: z.enum(['reference_point', 'retained_site_point']),
  audit_status: z.enum(['in_review', 'verified']),
  decision: localizedReviewTextSchema,
  overlap_resolution: localizedReviewTextSchema,
})

const m10_3ReviewItemSchema = z.object({
  feature_id: featureIdSchema,
  cluster: z.enum(['cathedral_precinct', 'imperial_access']),
  readiness: z.enum(['ready_for_specialist_review', 'reviewed']),
  content: z.object({
    es: m10_3LocalizedContentSchema,
    en: m10_3LocalizedContentSchema,
  }),
  claims: z.array(m10_3ClaimSchema).min(2),
  relationships: z.array(m10_3RelationshipSchema).min(1),
  geometry_review: m10_3GeometryReviewSchema,
})

const m10_5RelationshipSchema = m10_3RelationshipSchema.extend({
  relation: z.enum([
    'adjacent_to',
    'attached_to',
    'contained_by',
    'near',
    'overlaps',
    'part_of_program_with',
    'replaces_function_of',
    'retains',
    'routes_toward',
    'shares_site_with',
    'transformed_from',
  ]),
})

const m10_5ReviewItemSchema = m10_3ReviewItemSchema.extend({
  cluster: z.enum(M10_5_CLUSTER_IDS),
  relationships: z.array(m10_5RelationshipSchema).min(1),
  geometry_review: z.object({
    representation: z.enum([
      'reference_point',
      'retained_site_point',
      'retained_line',
      'retained_area',
    ]),
    audit_status: z.enum(['in_review', 'verified']),
    decision: localizedReviewTextSchema,
    overlap_resolution: localizedReviewTextSchema,
  }),
})

const m10_5ThemeSchema = z.object({
  theme_id: z.enum(M10_5_CLUSTER_IDS),
  status: z.enum(['mapped_candidate', 'context_only', 'deferred']),
  title: localizedLabelSchema,
  summary: localizedReviewTextSchema,
  caveat: localizedReviewTextSchema,
  feature_ids: z.array(featureIdSchema),
  source_refs: sourceRefListSchema.min(1),
})

const m10_5AnalyticalLayerSchema = z.object({
  layer_id: z.enum(M10_5_ANALYTICAL_LAYER_IDS),
  evidence_preparation_ref: z.enum(M10_5_EVIDENCE_WORKSTREAM_IDS),
  status: z.literal('deferred'),
  theme_id: z.enum(M10_5_CLUSTER_IDS),
  affected_feature_ids: z.array(featureIdSchema).min(1),
  proposed_method: localizedReviewTextSchema,
  blocker: localizedReviewTextSchema,
  release_condition: localizedReviewTextSchema,
  source_refs: sourceRefListSchema.min(1),
})

const m10_5EvidenceInputSchema = z
  .object({
    input_id: z.string().regex(/^input\.[a-z0-9-]+$/),
    input_type: z.enum([
      'archival_finding_aid',
      'parish_record',
      'habices_record',
      'fiscal_record',
      'household_record',
      'property_record',
      'institutional_plan',
      'historical_cartography',
      'archaeology',
      'parcel_morphology',
      'street_alignment',
      'toponymy',
      'secondary_synthesis',
      'derived_dependency',
    ]),
    availability: z.enum(['registered_source', 'repository_target', 'not_located']),
    source_refs: sourceRefListSchema,
    repository_or_target: z.string().min(3),
    date_range: z.object({
      from_year: z.number().int().nullable(),
      to_year: z.number().int().nullable(),
      precision: z.enum(['exact', 'range', 'series', 'unknown']),
    }),
    spatial_unit: z.enum([
      'building',
      'site',
      'street',
      'frontage',
      'parcel',
      'parish',
      'quarter',
      'city',
      'unknown',
    ]),
    role: z.enum(['control', 'constraint', 'context', 'negative_evidence', 'candidate_observation']),
    biases: z.array(z.string().min(20)).min(1),
    limitations: z.array(z.string().min(20)).min(1),
    next_action: z.string().min(20),
  })
  .superRefine((input, context) => {
    if (input.availability === 'registered_source' && input.source_refs.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['source_refs'],
        message: 'Una entrada disponible debe enlazar al menos una fuente registrada.',
      })
    }
    if (input.date_range.from_year !== null && input.date_range.to_year !== null
      && input.date_range.from_year > input.date_range.to_year) {
      context.addIssue({
        code: 'custom',
        path: ['date_range'],
        message: 'El intervalo documental no puede terminar antes de comenzar.',
      })
    }
  })

const m10_5EvidenceCriterionSchema = z.object({
  criterion_id: z.string().regex(/^criterion\.[a-z0-9-]+$/),
  description: z.string().min(20),
  status: z.enum(['met', 'partial', 'unmet']),
  evidence_input_ids: z.array(z.string().regex(/^input\.[a-z0-9-]+$/)),
})

const m10_5PublicSpaceSubjectSchema = z.object({
  feature_id: z.enum(M10_5_PUBLIC_SPACE_FEATURE_IDS),
  documented_change: localizedReviewTextSchema,
  current_assessment: localizedReviewTextSchema,
  supporting_input_ids: z.array(z.string().regex(/^input\.[a-z0-9-]+$/)).min(1),
  missing_inputs: z.array(z.string().min(20)).min(1),
  derivability: z.literal('not_derivable'),
})

const m10_5CorpusFieldSchema = z.object({
  field_id: z.string().regex(/^[a-z][a-z0-9_]+$/),
  description: z.string().min(20),
  required: z.boolean(),
  controlled_values: z.array(z.string().min(1)),
})

const m10_5EvidenceWorkstreamSchema = z.object({
  workstream_id: z.enum(M10_5_EVIDENCE_WORKSTREAM_IDS),
  analytical_layer_id: z.enum(M10_5_ANALYTICAL_LAYER_IDS),
  status: z.literal('inputs_catalogued'),
  title: localizedLabelSchema,
  research_question: localizedReviewTextSchema,
  target_feature_ids: z.array(featureIdSchema).min(1),
  inputs: z.array(m10_5EvidenceInputSchema).min(2),
  derivation_protocol: z.array(z.string().min(20)).min(3),
  uncertainty_model: z.object({
    unit: z.enum(['edge_segment', 'space_envelope', 'record_observation', 'composite_extent']),
    minimum_support: z.string().min(20),
    conflict_rule: z.string().min(20),
    absence_rule: z.string().min(20),
    visual_expression: z.string().min(20),
  }),
  non_goals: z.array(z.string().min(20)).min(1),
  public_space_subjects: z.array(m10_5PublicSpaceSubjectSchema)
    .length(M10_5_PUBLIC_SPACE_FEATURE_IDS.length)
    .optional(),
  corpus_model: z.object({
    fields: z.array(m10_5CorpusFieldSchema).min(8),
    identity_rule: z.string().min(20),
    spatial_linkage_rule: z.string().min(20),
    aggregation_guardrails: z.array(z.string().min(20)).min(3),
  }).optional(),
  dependency_workstream_ids: z.array(z.enum(M10_5_EVIDENCE_WORKSTREAM_IDS)),
  readiness_gate: z.object({
    ready: z.literal(false),
    criteria: z.array(m10_5EvidenceCriterionSchema).min(3),
    blockers: z.array(z.string().min(20)).min(1),
  }),
})

export const c1550M10_5EvidencePreparationSchema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    package: z.literal('evidence-preparation-1'),
    period_id: z.literal('c1550'),
    status: z.literal('inputs_catalogued'),
    public_application_import: z.literal(false),
    geometry_created: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    workstreams: z.array(m10_5EvidenceWorkstreamSchema).length(M10_5_EVIDENCE_WORKSTREAM_IDS.length),
  })
  .superRefine((dossier, context) => {
    const workstreamIds = new Set(dossier.workstreams.map((workstream) => workstream.workstream_id))
    if (workstreamIds.size !== M10_5_EVIDENCE_WORKSTREAM_IDS.length
      || M10_5_EVIDENCE_WORKSTREAM_IDS.some((workstreamId) => !workstreamIds.has(workstreamId))) {
      context.addIssue({
        code: 'custom',
        path: ['workstreams'],
        message: 'La preparación M10.5 debe cubrir exactamente los cuatro frentes analíticos aplazados.',
      })
    }

    const layerIds = new Set(dossier.workstreams.map((workstream) => workstream.analytical_layer_id))
    if (layerIds.size !== M10_5_ANALYTICAL_LAYER_IDS.length
      || M10_5_ANALYTICAL_LAYER_IDS.some((layerId) => !layerIds.has(layerId))) {
      context.addIssue({
        code: 'custom',
        path: ['workstreams'],
        message: 'Cada capa analítica aplazada debe tener un único paquete de preparación.',
      })
    }

    const expectedLayerByWorkstream = new Map([
      ['evidence.parish-jurisdictions', 'analysis.parish-boundaries'],
      ['evidence.public-spaces', 'analysis.public-squares'],
      ['evidence.population-corpus', 'analysis.population-geography'],
      ['evidence.citywide-extent', 'analysis.citywide-extent'],
    ])
    const globalInputIds = new Set<string>()
    const globalCriterionIds = new Set<string>()
    dossier.workstreams.forEach((workstream, workstreamIndex) => {
      if (expectedLayerByWorkstream.get(workstream.workstream_id) !== workstream.analytical_layer_id) {
        context.addIssue({
          code: 'custom',
          path: ['workstreams', workstreamIndex, 'analytical_layer_id'],
          message: 'El frente de evidencia no corresponde a la capa analítica declarada.',
        })
      }
      if (new Set(workstream.target_feature_ids).size !== workstream.target_feature_ids.length) {
        context.addIssue({
          code: 'custom',
          path: ['workstreams', workstreamIndex, 'target_feature_ids'],
          message: 'Las entidades objetivo de un frente no pueden repetirse.',
        })
      }
      const localInputIds = new Set(workstream.inputs.map((input) => input.input_id))
      workstream.inputs.forEach((input, inputIndex) => {
        if (globalInputIds.has(input.input_id)) {
          context.addIssue({
            code: 'custom',
            path: ['workstreams', workstreamIndex, 'inputs', inputIndex, 'input_id'],
            message: 'Los identificadores de entrada deben ser únicos en todo el dossier.',
          })
        }
        globalInputIds.add(input.input_id)
      })
      workstream.readiness_gate.criteria.forEach((criterion, criterionIndex) => {
        if (globalCriterionIds.has(criterion.criterion_id)) {
          context.addIssue({
            code: 'custom',
            path: ['workstreams', workstreamIndex, 'readiness_gate', 'criteria', criterionIndex, 'criterion_id'],
            message: 'Los identificadores de criterio deben ser únicos en todo el dossier.',
          })
        }
        globalCriterionIds.add(criterion.criterion_id)
        criterion.evidence_input_ids.forEach((inputId) => {
          if (!localInputIds.has(inputId)) {
            context.addIssue({
              code: 'custom',
              path: ['workstreams', workstreamIndex, 'readiness_gate', 'criteria', criterionIndex],
              message: `El criterio referencia una entrada ajena o inexistente: ${inputId}.`,
            })
          }
        })
      })
      if (workstream.workstream_id !== 'evidence.public-spaces' && workstream.public_space_subjects) {
        context.addIssue({
          code: 'custom',
          path: ['workstreams', workstreamIndex, 'public_space_subjects'],
          message: 'Solo el frente de espacios públicos puede declarar las tres plazas.',
        })
      }
      if (workstream.workstream_id !== 'evidence.population-corpus' && workstream.corpus_model) {
        context.addIssue({
          code: 'custom',
          path: ['workstreams', workstreamIndex, 'corpus_model'],
          message: 'Solo el frente de población puede declarar el modelo de corpus.',
        })
      }
    })

    const publicSpaces = dossier.workstreams.find(
      (workstream) => workstream.workstream_id === 'evidence.public-spaces',
    )
    const publicSpaceIds = new Set(publicSpaces?.public_space_subjects?.map((subject) => subject.feature_id) ?? [])
    if (publicSpaceIds.size !== M10_5_PUBLIC_SPACE_FEATURE_IDS.length
      || M10_5_PUBLIC_SPACE_FEATURE_IDS.some((featureId) => !publicSpaceIds.has(featureId))) {
      context.addIssue({
        code: 'custom',
        path: ['workstreams'],
        message: 'La preparación de espacios públicos debe inventariar exactamente Bib-Rambla, Campo del Príncipe y Plaza Nueva.',
      })
    }

    const population = dossier.workstreams.find(
      (workstream) => workstream.workstream_id === 'evidence.population-corpus',
    )
    if (!population?.corpus_model) {
      context.addIssue({
        code: 'custom',
        path: ['workstreams'],
        message: 'La geografía de población requiere un modelo de corpus antes de recopilar observaciones.',
      })
    } else {
      const fieldIds = population.corpus_model.fields.map((field) => field.field_id)
      if (new Set(fieldIds).size !== fieldIds.length) {
        context.addIssue({
          code: 'custom',
          path: ['workstreams'],
          message: 'Los campos del corpus de población deben ser únicos.',
        })
      }
    }
  })

const m10_5InventoryDecisionSchema = z.object({
  feature_id: featureIdSchema,
  cluster: z.enum(M10_5_CLUSTER_IDS),
  priority: z.enum(RESEARCH_PRIORITY_VALUES),
  decision: z.enum([
    'internal_candidate',
    'content_ready_geometry_deferred',
    'deferred_analytical_geometry',
    'deferred_sensitive_spatial_claim',
    'source_review_needed',
    'research_not_started',
  ]),
  source_refs: sourceRefListSchema,
  blocker: z.string().min(20),
})

const m10_5SignoffSchema = z
  .object({
    discipline: z.enum(M10_5_REVIEW_DISCIPLINES),
    status: z.enum(['pending', 'approved', 'changes_requested']),
    reviewer_name: z.string().min(1).nullable(),
    reviewer_role: z.string().min(1).nullable(),
    reviewed_on: z.iso.date().nullable(),
    notes: z.string().min(20),
  })
  .superRefine((signoff, context) => {
    if (signoff.status === 'approved'
      && (!signoff.reviewer_name || !signoff.reviewer_role || !signoff.reviewed_on)) {
      context.addIssue({
        code: 'custom',
        message: 'Una aprobación M10.5 debe identificar responsable, función y fecha.',
      })
    }
  })

const m10_5SourceReviewItemSchema = z.object({
  feature_id: featureIdSchema,
  cluster: z.enum(M10_5_CLUSTER_IDS),
  readiness: z.literal('ready_for_content_review'),
  period_assessment: z.object({
    presence: z.enum(PERIOD_PRESENCE_VALUES),
    temporal_confidence: z.enum(CONFIDENCE_VALUES),
    change_from_1492: z.enum(PERIOD_CHANGE_VALUES),
    physical_state: z.enum(PHYSICAL_STATE_VALUES),
  }),
  content: z.object({
    es: m10_3LocalizedContentSchema,
    en: m10_3LocalizedContentSchema,
  }),
  claims: z.array(m10_3ClaimSchema).min(2),
  relationships: z.array(m10_5RelationshipSchema).min(1),
  geometry_decision: z.object({
    status: z.literal('deferred'),
    action: z.enum([
      'retain_existing_only_after_audit',
      'create_reference_point_after_site_audit',
      'no_geometry_until_chronology_resolved',
    ]),
    rationale: localizedReviewTextSchema,
    release_condition: localizedReviewTextSchema,
    source_refs: sourceRefListSchema.min(1),
  }),
})

export const c1550M10_5SourceReviewSchema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    tranche: z.literal('source-review-1'),
    period_id: z.literal('c1550'),
    status: z.literal('ready_for_content_review'),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    feature_ids: z.array(featureIdSchema).length(M10_5_SOURCE_REVIEW_FEATURE_IDS.length),
    items: z.array(m10_5SourceReviewItemSchema).length(M10_5_SOURCE_REVIEW_FEATURE_IDS.length),
  })
  .superRefine((tranche, context) => {
    const expectedIds = new Set<string>(M10_5_SOURCE_REVIEW_FEATURE_IDS)
    const featureIds = new Set(tranche.feature_ids)
    const itemIds = new Set(tranche.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'El tramo de fuentes M10.5 debe contener exactamente las diez entidades acordadas.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'El tramo de fuentes M10.5 requiere una ficha única por entidad.',
      })
    }
    const claimIds = new Set<string>()
    tranche.items.forEach((item, itemIndex) => {
      item.claims.forEach((claim, claimIndex) => {
        if (claimIds.has(claim.claim_id)) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'claims', claimIndex, 'claim_id'],
            message: 'Los identificadores de afirmación del tramo de fuentes deben ser únicos.',
          })
        }
        claimIds.add(claim.claim_id)
      })
    })
  })

export const c1550M10_5SourceReview2Schema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    tranche: z.literal('source-review-2'),
    period_id: z.literal('c1550'),
    status: z.literal('ready_for_content_review'),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    feature_ids: z.array(featureIdSchema).length(M10_5_SOURCE_REVIEW_2_FEATURE_IDS.length),
    items: z.array(m10_5SourceReviewItemSchema).length(M10_5_SOURCE_REVIEW_2_FEATURE_IDS.length),
  })
  .superRefine((tranche, context) => {
    const expectedIds = new Set<string>(M10_5_SOURCE_REVIEW_2_FEATURE_IDS)
    const featureIds = new Set(tranche.feature_ids)
    const itemIds = new Set(tranche.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'El segundo tramo de fuentes M10.5 debe contener exactamente los diez sistemas heredados acordados.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'El segundo tramo de fuentes M10.5 requiere una ficha única por sistema heredado.',
      })
    }
    const claimIds = new Set<string>()
    tranche.items.forEach((item, itemIndex) => {
      item.claims.forEach((claim, claimIndex) => {
        if (claimIds.has(claim.claim_id)) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'claims', claimIndex, 'claim_id'],
            message: 'Los identificadores de afirmación del segundo tramo deben ser únicos.',
          })
        }
        claimIds.add(claim.claim_id)
      })
    })
  })

export const c1550M10_5SourceReview3Schema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    tranche: z.literal('source-review-3'),
    period_id: z.literal('c1550'),
    status: z.literal('ready_for_content_review'),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    feature_ids: z.array(featureIdSchema).length(M10_5_SOURCE_REVIEW_3_FEATURE_IDS.length),
    items: z.array(m10_5SourceReviewItemSchema).length(M10_5_SOURCE_REVIEW_3_FEATURE_IDS.length),
  })

  .superRefine((tranche, context) => {
    const expectedIds = new Set<string>(M10_5_SOURCE_REVIEW_3_FEATURE_IDS)
    const featureIds = new Set(tranche.feature_ids)
    const itemIds = new Set(tranche.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'El tercer tramo de fuentes M10.5 debe contener exactamente las diez entidades acordadas.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'El tercer tramo de fuentes M10.5 requiere una ficha única por entidad.',
      })
    }
    const claimIds = new Set<string>()
    tranche.items.forEach((item, itemIndex) => {
      item.claims.forEach((claim, claimIndex) => {
        if (claimIds.has(claim.claim_id)) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'claims', claimIndex, 'claim_id'],
            message: 'Los identificadores de afirmación del tercer tramo deben ser únicos.',
          })
        }
        claimIds.add(claim.claim_id)
      })
    })
  })

export const c1550M10_5SourceReview4Schema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    tranche: z.literal('source-review-4'),
    period_id: z.literal('c1550'),
    status: z.literal('ready_for_content_review'),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    feature_ids: z.array(featureIdSchema).length(M10_5_SOURCE_REVIEW_4_FEATURE_IDS.length),
    items: z.array(m10_5SourceReviewItemSchema).length(M10_5_SOURCE_REVIEW_4_FEATURE_IDS.length),
  })
  .superRefine((tranche, context) => {
    const expectedIds = new Set<string>(M10_5_SOURCE_REVIEW_4_FEATURE_IDS)
    const featureIds = new Set(tranche.feature_ids)
    const itemIds = new Set(tranche.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'El cuarto tramo de fuentes M10.5 debe contener exactamente las diez entidades acordadas.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'El cuarto tramo de fuentes M10.5 requiere una ficha única por entidad.',
      })
    }
    const claimIds = new Set<string>()
    tranche.items.forEach((item, itemIndex) => {
      item.claims.forEach((claim, claimIndex) => {
        if (claimIds.has(claim.claim_id)) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'claims', claimIndex, 'claim_id'],
            message: 'Los identificadores de afirmación del cuarto tramo deben ser únicos.',
          })
        }
        claimIds.add(claim.claim_id)
      })
    })
  })

export const c1550M10_5GeometryWave1Schema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    wave: z.literal('geometry-wave-1'),
    period_id: z.literal('c1550'),
    status: z.literal('ready_for_specialist_review'),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    source_review_paths: z.tuple([
      z.literal('data/research/c1550/m10.5-source-review.json'),
      z.literal('data/research/c1550/m10.5-source-review-2.json'),
      z.literal('data/research/c1550/m10.5-source-review-3.json'),
    ]),
    feature_ids: z.array(featureIdSchema).length(M10_5_GEOMETRY_WAVE_1_FEATURE_IDS.length),
    items: z.array(m10_5ReviewItemSchema).length(M10_5_GEOMETRY_WAVE_1_FEATURE_IDS.length),
    deferred_feature_ids: z.array(featureIdSchema)
      .length(M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS.length),
  })
  .superRefine((wave, context) => {
    const expectedIds = new Set<string>(M10_5_GEOMETRY_WAVE_1_FEATURE_IDS)
    const featureIds = new Set(wave.feature_ids)
    const itemIds = new Set(wave.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'La primera ola geométrica M10.5 debe contener exactamente las dieciséis entidades de bajo riesgo.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'La primera ola geométrica M10.5 requiere una ficha única por entidad promovida.',
      })
    }
    const expectedDeferredIds = new Set<string>(M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS)
    const deferredIds = new Set(wave.deferred_feature_ids)
    if (deferredIds.size !== expectedDeferredIds.size
      || [...expectedDeferredIds].some((id) => !deferredIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['deferred_feature_ids'],
        message: 'La ola debe conservar exactamente las catorce entidades complejas o no resueltas sin geometría.',
      })
    }
  })

const m10_5GeometryWave2ControlSchema = z.object({
  control_id: z.string().regex(/^control\.[a-z0-9-]+$/),
  kind: z.enum([
    'surviving_fabric',
    'near_period_documentary',
    'historical_cartography',
    'archaeological_context',
    'topographic_alignment',
  ]),
  applies_to: z.string().min(10),
  confidence: z.enum(CONFIDENCE_VALUES),
  source_refs: sourceRefListSchema.min(1),
  note: localizedReviewTextSchema,
})

const m10_5GeometryWave2DecisionSchema = z.object({
  feature_id: featureIdSchema,
  decision: z.enum(['promote_in_review', 'remain_deferred']),
  rationale: localizedReviewTextSchema,
  next_requirement: localizedReviewTextSchema,
  source_refs: sourceRefListSchema.min(1),
})

const m10_5GeometryWave2ControlRegisterSchema = z.object({
  feature_id: featureIdSchema,
  representation: z.enum(['retained_site_point', 'retained_line']),
  inherited_geometry_variant_id: z.string().regex(/^c1492\.[a-z0-9-]+(?:\.[a-z0-9-]+)*$/),
  audit_status: z.literal('in_review'),
  controls: z.array(m10_5GeometryWave2ControlSchema).min(2),
  excluded_components: z.array(localizedReviewTextSchema).min(1),
})

export const c1550M10_5GeometryWave2Schema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    wave: z.literal('geometry-wave-2'),
    period_id: z.literal('c1550'),
    status: z.literal('ready_for_specialist_review'),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    source_wave_path: z.literal('data/research/c1550/m10.5-geometry-wave-1.json'),
    source_review_paths: z.tuple([
      z.literal('data/research/c1550/m10.5-source-review.json'),
      z.literal('data/research/c1550/m10.5-source-review-2.json'),
      z.literal('data/research/c1550/m10.5-source-review-3.json'),
    ]),
    feature_ids: z.array(featureIdSchema).length(M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.length),
    deferred_feature_ids: z.array(featureIdSchema)
      .length(M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS.length),
    items: z.array(m10_5ReviewItemSchema).length(M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.length),
    selection_decisions: z.array(m10_5GeometryWave2DecisionSchema)
      .length(M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS.length),
    control_registers: z.array(m10_5GeometryWave2ControlRegisterSchema)
      .length(M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.length),
  })
  .superRefine((wave, context) => {
    const expectedPromoted = new Set<string>(M10_5_GEOMETRY_WAVE_2_FEATURE_IDS)
    const expectedDeferred = new Set<string>(M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS)
    const expectedConsidered = new Set<string>(M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS)
    const featureIds = new Set(wave.feature_ids)
    const deferredIds = new Set(wave.deferred_feature_ids)
    const itemIds = new Set(wave.items.map((item) => item.feature_id))
    const registerIds = new Set(wave.control_registers.map((register) => register.feature_id))
    const decisionIds = new Set(wave.selection_decisions.map((decision) => decision.feature_id))
    const exact = (actual: Set<string>, expected: Set<string>) =>
      actual.size === expected.size && [...expected].every((id) => actual.has(id))

    if (!exact(featureIds, expectedPromoted) || !exact(itemIds, expectedPromoted)
      || !exact(registerIds, expectedPromoted)) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'La segunda ola debe promover exactamente Fajalauza y los cinco ejes hidráulicos auditados.',
      })
    }
    if (!exact(deferredIds, expectedDeferred)) {
      context.addIssue({
        code: 'custom',
        path: ['deferred_feature_ids'],
        message: 'La segunda ola debe mantener exactamente ocho entidades complejas sin geometría.',
      })
    }
    if (!exact(decisionIds, expectedConsidered)) {
      context.addIssue({
        code: 'custom',
        path: ['selection_decisions'],
        message: 'La segunda ola debe registrar una decisión para cada uno de los catorce aplazamientos de la primera.',
      })
    }
    for (const decision of wave.selection_decisions) {
      const expectedDecision = expectedPromoted.has(decision.feature_id)
        ? 'promote_in_review'
        : 'remain_deferred'
      if (decision.decision !== expectedDecision) {
        context.addIssue({
          code: 'custom',
          path: ['selection_decisions'],
          message: `${decision.feature_id} no coincide con la selección acordada para la segunda ola.`,
        })
      }
    }
    const controlIds = wave.control_registers.flatMap((register) =>
      register.controls.map((control) => control.control_id))
    if (new Set(controlIds).size !== controlIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['control_registers'],
        message: 'Los controles espaciales de la segunda ola deben ser únicos.',
      })
    }
  })

export const c1550M10_5SupplementSchema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    period_id: z.literal('c1550'),
    updated_on: z.iso.date(),
    feature_ids: z.array(featureIdSchema).length(M10_5_SUPPLEMENT_FEATURE_IDS.length),
    items: z.array(m10_5ReviewItemSchema).length(M10_5_SUPPLEMENT_FEATURE_IDS.length),
    themes: z.array(m10_5ThemeSchema).length(M10_5_CLUSTER_IDS.length),
    analytical_layers: z.array(m10_5AnalyticalLayerSchema).min(3),
  })
  .superRefine((supplement, context) => {
    const expectedIds = new Set<string>(M10_5_SUPPLEMENT_FEATURE_IDS)
    const featureIds = new Set(supplement.feature_ids)
    const itemIds = new Set(supplement.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'El suplemento M10.5 debe contener exactamente las nueve entidades adicionales.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'El suplemento M10.5 requiere una ficha única por entidad adicional.',
      })
    }
    const themeIds = new Set(supplement.themes.map((theme) => theme.theme_id))
    if (themeIds.size !== M10_5_CLUSTER_IDS.length
      || M10_5_CLUSTER_IDS.some((themeId) => !themeIds.has(themeId))) {
      context.addIssue({
        code: 'custom',
        path: ['themes'],
        message: 'El suplemento M10.5 debe definir una vez los siete conjuntos temáticos.',
      })
    }
  })

export const c1550M10_5CandidateSchema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.5'),
    period_id: z.literal('c1550'),
    status: z.enum(['assembling', 'ready_for_specialist_review', 'release_candidate']),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    feature_ids: z.array(featureIdSchema).length(M10_5_FEATURE_IDS.length),
    items: z.array(m10_5ReviewItemSchema).length(M10_5_FEATURE_IDS.length),
    themes: z.array(m10_5ThemeSchema).length(M10_5_CLUSTER_IDS.length),
    analytical_layers: z.array(m10_5AnalyticalLayerSchema).min(3),
    inventory_decisions: z.array(m10_5InventoryDecisionSchema).min(1),
    coverage: z.object({
      mapped_candidate_features: z.number().int().nonnegative(),
      inventory_decisions: z.number().int().nonnegative(),
      themes: z.number().int().nonnegative(),
      deferred_analytical_layers: z.number().int().nonnegative(),
    }),
    signoffs: z.array(m10_5SignoffSchema).length(M10_5_REVIEW_DISCIPLINES.length),
    promotion_gate: z.object({
      public_ready: z.boolean(),
      blockers: z.array(z.string().min(20)),
    }),
  })
  .superRefine((candidate, context) => {
    const expectedIds = new Set<string>(M10_5_FEATURE_IDS)
    const featureIds = new Set(candidate.feature_ids)
    const itemIds = new Set(candidate.items.map((item) => item.feature_id))
    if (featureIds.size !== expectedIds.size || [...expectedIds].some((id) => !featureIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'M10.5 debe contener exactamente las geometrías candidatas auditables declaradas.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((id) => !itemIds.has(id))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'M10.5 requiere una ficha única para cada geometría candidata.',
      })
    }
    const claimIds = new Set<string>()
    candidate.items.forEach((item, itemIndex) => {
      item.claims.forEach((claim, claimIndex) => {
        if (claimIds.has(claim.claim_id)) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'claims', claimIndex, 'claim_id'],
            message: 'Los identificadores de afirmación M10.5 deben ser únicos.',
          })
        }
        claimIds.add(claim.claim_id)
      })
      item.relationships.forEach((relationship, relationshipIndex) => {
        if (relationship.target_id === item.feature_id) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'relationships', relationshipIndex, 'target_id'],
            message: 'Una relación M10.5 no puede apuntar a la misma entidad.',
          })
        }
      })
    })
    const themes = new Set(candidate.themes.map((theme) => theme.theme_id))
    if (themes.size !== M10_5_CLUSTER_IDS.length
      || M10_5_CLUSTER_IDS.some((theme) => !themes.has(theme))) {
      context.addIssue({
        code: 'custom',
        path: ['themes'],
        message: 'M10.5 debe cubrir los siete conjuntos temáticos.',
      })
    }
    const disciplines = new Set(candidate.signoffs.map((signoff) => signoff.discipline))
    if (disciplines.size !== M10_5_REVIEW_DISCIPLINES.length
      || M10_5_REVIEW_DISCIPLINES.some((discipline) => !disciplines.has(discipline))) {
      context.addIssue({
        code: 'custom',
        path: ['signoffs'],
        message: 'M10.5 requiere una decisión para cada disciplina de revisión.',
      })
    }
    const decisionIds = new Set(candidate.inventory_decisions.map((decision) => decision.feature_id))
    if (decisionIds.size !== candidate.inventory_decisions.length) {
      context.addIssue({
        code: 'custom',
        path: ['inventory_decisions'],
        message: 'M10.5 solo admite una decisión de inventario por entidad.',
      })
    }
    const analyticalLayerIds = new Set(candidate.analytical_layers.map((layer) => layer.layer_id))
    if (analyticalLayerIds.size !== candidate.analytical_layers.length) {
      context.addIssue({
        code: 'custom',
        path: ['analytical_layers'],
        message: 'Las capas analíticas M10.5 deben tener identificadores únicos.',
      })
    }
    if (candidate.coverage.mapped_candidate_features !== candidate.items.length
      || candidate.coverage.inventory_decisions !== candidate.inventory_decisions.length
      || candidate.coverage.themes !== candidate.themes.length
      || candidate.coverage.deferred_analytical_layers !== candidate.analytical_layers.length) {
      context.addIssue({
        code: 'custom',
        path: ['coverage'],
        message: 'Los totales de cobertura M10.5 no coinciden con el dossier.',
      })
    }
    if (candidate.status === 'release_candidate') {
      if (!candidate.promotion_gate.public_ready || candidate.promotion_gate.blockers.length > 0) {
        context.addIssue({
          code: 'custom',
          path: ['promotion_gate'],
          message: 'Un release candidate no puede conservar bloqueos de publicación.',
        })
      }
      if (candidate.signoffs.some((signoff) => signoff.status !== 'approved')
        || candidate.items.some((item) => item.readiness !== 'reviewed'
          || item.geometry_review.audit_status !== 'verified')) {
        context.addIssue({
          code: 'custom',
          message: 'M10.5 solo alcanza release_candidate con contenido, geometría y firmas aprobados.',
        })
      }
    } else if (candidate.promotion_gate.public_ready) {
      context.addIssue({
        code: 'custom',
        path: ['promotion_gate', 'public_ready'],
        message: 'Un dossier no aprobado no puede declararse listo para publicación.',
      })
    }
  })

const m10_3SignoffSchema = z
  .object({
    discipline: z.enum(M10_3_REVIEW_DISCIPLINES),
    status: z.enum(['pending', 'approved', 'changes_requested']),
    reviewer_name: z.string().min(1).nullable(),
    reviewer_role: z.string().min(1).nullable(),
    reviewed_on: z.iso.date().nullable(),
    notes: z.string().min(20),
  })
  .superRefine((signoff, context) => {
    if (signoff.status === 'approved') {
      if (!signoff.reviewer_name || !signoff.reviewer_role || !signoff.reviewed_on) {
        context.addIssue({
          code: 'custom',
          message: 'Una aprobación M10.3 debe identificar responsable, función y fecha.',
        })
      }
    } else if (signoff.reviewed_on && !signoff.reviewer_name) {
      context.addIssue({
        code: 'custom',
        path: ['reviewer_name'],
        message: 'Una revisión fechada debe identificar a la persona revisora.',
      })
    }
  })

export const c1550VerticalSliceReviewSchema = z
  .object({
    schema_version: z.literal(1),
    milestone: z.literal('M10.3'),
    period_id: z.literal('c1550'),
    status: z.enum(['ready_for_specialist_review', 'reviewed']),
    public_application_import: z.literal(false),
    updated_on: z.iso.date(),
    scope_note: z.string().min(20),
    feature_ids: z.array(featureIdSchema).length(M10_3_FEATURE_IDS.length),
    items: z.array(m10_3ReviewItemSchema).length(M10_3_FEATURE_IDS.length),
    signoffs: z.array(m10_3SignoffSchema).length(M10_3_REVIEW_DISCIPLINES.length),
  })
  .superRefine((review, context) => {
    const expectedIds = new Set<string>(M10_3_FEATURE_IDS)
    const featureIds = new Set(review.feature_ids)
    const itemIds = new Set(review.items.map((item) => item.feature_id))

    if (featureIds.size !== M10_3_FEATURE_IDS.length
      || M10_3_FEATURE_IDS.some((featureId) => !featureIds.has(featureId))) {
      context.addIssue({
        code: 'custom',
        path: ['feature_ids'],
        message: 'El corte M10.3 debe contener exactamente las ocho entidades aprobadas.',
      })
    }
    if (itemIds.size !== expectedIds.size || [...expectedIds].some((featureId) => !itemIds.has(featureId))) {
      context.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'Debe existir una ficha de revisión única para cada entidad M10.3.',
      })
    }

    const claimIds = new Set<string>()
    review.items.forEach((item, itemIndex) => {
      item.claims.forEach((claim, claimIndex) => {
        if (claimIds.has(claim.claim_id)) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'claims', claimIndex, 'claim_id'],
            message: 'Los identificadores de afirmación M10.3 deben ser únicos.',
          })
        }
        claimIds.add(claim.claim_id)
      })
      item.relationships.forEach((relationship, relationshipIndex) => {
        if (relationship.target_id === item.feature_id) {
          context.addIssue({
            code: 'custom',
            path: ['items', itemIndex, 'relationships', relationshipIndex, 'target_id'],
            message: 'Una relación M10.3 no puede apuntar a la misma entidad.',
          })
        }
      })
    })

    const disciplines = new Set(review.signoffs.map((signoff) => signoff.discipline))
    if (disciplines.size !== M10_3_REVIEW_DISCIPLINES.length
      || M10_3_REVIEW_DISCIPLINES.some((discipline) => !disciplines.has(discipline))) {
      context.addIssue({
        code: 'custom',
        path: ['signoffs'],
        message: 'M10.3 requiere una decisión para cada disciplina de revisión.',
      })
    }

    if (review.status === 'reviewed') {
      if (review.signoffs.some((signoff) => signoff.status !== 'approved')) {
        context.addIssue({
          code: 'custom',
          path: ['signoffs'],
          message: 'El corte no puede marcarse reviewed mientras quede una aprobación pendiente.',
        })
      }
      review.items.forEach((item, index) => {
        if (item.readiness !== 'reviewed' || item.geometry_review.audit_status !== 'verified') {
          context.addIssue({
            code: 'custom',
            path: ['items', index],
            message: 'Una ficha reviewed debe tener contenido revisado y geometría verificada.',
          })
        }
      })
    }
  })

export const existingEntityTriageSchema = z.object({
  feature_id: featureIdSchema,
  priority: z.enum(RESEARCH_PRIORITY_VALUES),
  research_status: z.enum(RESEARCH_STATUS_VALUES),
  expected_change: z.enum(PERIOD_CHANGE_VALUES),
  geometry_action: z.enum(GEOMETRY_ACTION_VALUES),
  source_refs: sourceRefListSchema,
  notes: z.string().min(1),
})

export const candidatePeriodEntitySchema = z.object({
  proposed_id: featureIdSchema,
  canonical_name: z.string().min(1),
  entity_type: z.enum(GAZETTEER_ENTITY_TYPES),
  category: z.enum(FEATURE_CATEGORIES),
  subtype: z.string().min(1),
  priority: z.enum(RESEARCH_PRIORITY_VALUES),
  presence: z.enum(PERIOD_PRESENCE_VALUES),
  temporal_confidence: z.enum(CONFIDENCE_VALUES),
  change_from_1492: z.enum(PERIOD_CHANGE_VALUES),
  physical_state: z.enum(PHYSICAL_STATE_VALUES),
  research_status: z.enum(RESEARCH_STATUS_VALUES),
  geometry_action: z.enum(GEOMETRY_ACTION_VALUES),
  summary: z.string().min(20),
  evidence_note: z.string().min(20),
  source_refs: sourceRefListSchema.min(1),
})

export const c1550ChangeThemeSchema = z.object({
  id: z.string().regex(/^theme\.[a-z0-9-]+$/),
  title: localizedLabelSchema,
  summary: z.string().min(20),
  source_refs: sourceRefListSchema.min(1),
})

export const c1550ResearchInventorySchema = z.object({
  period_id: z.literal('c1550'),
  status: z.literal('research'),
  updated_on: z.iso.date(),
  scope_note: z.string().min(20),
  change_themes: z.array(c1550ChangeThemeSchema).min(1),
  existing_entity_triage: z.array(existingEntityTriageSchema),
  candidate_entities: z.array(candidatePeriodEntitySchema),
})

const researchLayerManifestSchema = z.object({
  geometry_type: z.enum(['point', 'line', 'area']),
  path: z.string().regex(/^data\/research\/c1550\/(points|lines|areas)\.geojson$/),
  feature_count: z.number().int().nonnegative(),
})

const deferredGeometrySchema = z.object({
  scope_id: z.string().regex(/^defer\.[a-z0-9-]+$/),
  affected_feature_ids: z.array(featureIdSchema),
  reason: z.string().min(20),
  release_condition: z.string().min(20),
})

export const c1550ResearchPackageManifestSchema = z.object({
  schema_version: z.literal(1),
  period_id: z.literal('c1550'),
  status: z.literal('research'),
  public_application_import: z.literal(false),
  updated_on: z.iso.date(),
  crs: z.literal('EPSG:4326'),
  scope_note: z.string().min(20),
  layers: z.array(researchLayerManifestSchema).length(3),
  audit_path: z.literal('data/research/c1550/geometry-audit.json'),
  review_path: z.literal('data/research/c1550/m10.3-review.json').optional(),
  candidate_path: z.literal('data/research/c1550/m10.5-candidate.json').optional(),
  source_review_path: z.literal('data/research/c1550/m10.5-source-review.json').optional(),
  source_review_2_path: z.literal('data/research/c1550/m10.5-source-review-2.json').optional(),
  source_review_3_path: z.literal('data/research/c1550/m10.5-source-review-3.json').optional(),
  source_review_4_path: z.literal('data/research/c1550/m10.5-source-review-4.json').optional(),
  geometry_wave_1_path: z.literal('data/research/c1550/m10.5-geometry-wave-1.json').optional(),
  geometry_wave_2_path: z.literal('data/research/c1550/m10.5-geometry-wave-2.json').optional(),
  evidence_preparation_path: z.literal('data/research/c1550/m10.5-evidence-preparation.json').optional(),
  included_feature_ids: z.array(featureIdSchema).min(1),
  geometry_rules: z.array(z.string().min(20)).min(3),
  deferred_geometry: z.array(deferredGeometrySchema).min(1),
})

export type PeriodDefinition = z.infer<typeof periodDefinitionSchema>
export type FeaturePeriodState = z.infer<typeof featurePeriodStateSchema>
export type PeriodHistoricalFeature = z.infer<typeof periodHistoricalFeatureSchema>
export type CompatibilityPeriodFeature = z.infer<typeof compatibilityPeriodFeatureSchema>
export type StableEntity = z.infer<typeof stableEntitySchema>
export type C1550ResearchInventory = z.infer<typeof c1550ResearchInventorySchema>
export type C1550ResearchPackageManifest = z.infer<typeof c1550ResearchPackageManifestSchema>
export type C1550VerticalSliceReview = z.infer<typeof c1550VerticalSliceReviewSchema>
export type C1550M10_5Supplement = z.infer<typeof c1550M10_5SupplementSchema>
export type C1550M10_5Candidate = z.infer<typeof c1550M10_5CandidateSchema>
export type C1550M10_5SourceReview = z.infer<typeof c1550M10_5SourceReviewSchema>
export type C1550M10_5SourceReview2 = z.infer<typeof c1550M10_5SourceReview2Schema>
export type C1550M10_5SourceReview3 = z.infer<typeof c1550M10_5SourceReview3Schema>
export type C1550M10_5SourceReview4 = z.infer<typeof c1550M10_5SourceReview4Schema>
export type C1550M10_5GeometryWave1 = z.infer<typeof c1550M10_5GeometryWave1Schema>
export type C1550M10_5GeometryWave2 = z.infer<typeof c1550M10_5GeometryWave2Schema>
export type C1550M10_5EvidencePreparation = z.infer<typeof c1550M10_5EvidencePreparationSchema>
