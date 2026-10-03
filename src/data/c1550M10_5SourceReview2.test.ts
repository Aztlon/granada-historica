import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import sourceReviewJson from '../../data/research/c1550/m10.5-source-review-2.json'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import inventoryJson from '../../data/research/c1550-inventory.json'
import sourcesJson from '../../data/sources.json'
import { sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5SourceReview2Schema,
  c1550ResearchInventorySchema,
  M10_5_GEOMETRY_FEATURE_IDS,
  M10_5_SOURCE_REVIEW_2_FEATURE_IDS,
  periodFeatureCollectionSchema,
} from './temporalSchema'

const tranche = c1550M10_5SourceReview2Schema.parse(sourceReviewJson)
const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const inventory = c1550ResearchInventorySchema.parse(inventoryJson)
const sourceIds = new Set(sourceRegistrySchema.parse(sourcesJson).map(({ id }) => id))
const mappedIds = new Set([pointsRaw, linesRaw, areasRaw]
  .flatMap((raw) => periodFeatureCollectionSchema.parse(JSON.parse(raw)).features)
  .map(({ id }) => id))

describe('M10.5 second source-review tranche', () => {
  it('preserves the ten inherited-system records while the later wave promotes only its safe subset', () => {
    expect(tranche.feature_ids).toEqual(M10_5_SOURCE_REVIEW_2_FEATURE_IDS)
    expect(tranche.items).toHaveLength(10)
    expect(tranche.public_application_import).toBe(false)
    for (const item of tranche.items) {
      expect(item.content.es.summary.length).toBeGreaterThan(20)
      expect(item.content.en.summary.length).toBeGreaterThan(20)
      expect(item.claims.length).toBeGreaterThanOrEqual(2)
      expect(item.geometry_decision.status).toBe('deferred')
      expect(mappedIds.has(item.feature_id)).toBe(
        M10_5_GEOMETRY_FEATURE_IDS.includes(
          item.feature_id as (typeof M10_5_GEOMETRY_FEATURE_IDS)[number],
        ),
      )
    }
  })

  it('resolves every source and relationship target', () => {
    const inventoryIds = new Set([
      ...inventory.existing_entity_triage.map(({ feature_id }) => feature_id),
      ...inventory.candidate_entities.map(({ proposed_id }) => proposed_id),
    ])
    for (const item of tranche.items) {
      expect(item.claims.flatMap(({ citations }) => citations)
        .every(({ source_id }) => sourceIds.has(source_id))).toBe(true)
      expect(item.geometry_decision.source_refs.every((sourceId) => sourceIds.has(sourceId))).toBe(true)
      expect(item.relationships.every(({ target_id }) => inventoryIds.has(target_id))).toBe(true)
    }
  })

  it('advances every system to content readiness while preserving uncertainty', () => {
    const inventoryStatusById = new Map<string, string>()
    inventory.existing_entity_triage.forEach((entry) => inventoryStatusById.set(entry.feature_id, entry.research_status))
    inventory.candidate_entities.forEach((entry) => inventoryStatusById.set(entry.proposed_id, entry.research_status))
    const decisionById = new Map(candidate.inventory_decisions.map((entry) => [entry.feature_id, entry.decision]))
    for (const featureId of M10_5_SOURCE_REVIEW_2_FEATURE_IDS) {
      expect(inventoryStatusById.get(featureId)).toBe('ready_for_review')
      const promoted = M10_5_GEOMETRY_FEATURE_IDS.includes(
        featureId as (typeof M10_5_GEOMETRY_FEATURE_IDS)[number],
      )
      expect(decisionById.get(featureId)).toBe(
        promoted ? 'internal_candidate' : 'content_ready_geometry_deferred',
      )
    }
    const mauror = tranche.items.find(({ feature_id }) => feature_id === 'gate.mawrur')
    expect(mauror?.period_assessment.presence).toBe('unknown')
    expect(mauror?.geometry_decision.action).toBe('no_geometry_until_chronology_resolved')
    expect(tranche.items.find(({ feature_id }) => feature_id === 'gate.fajalauza')
      ?.period_assessment.temporal_confidence).toBe('probable')
  })

  it('documents the water network and treats inherited walls as altered systems', () => {
    for (const featureId of ['water.acequia-aynadamar', 'water.acequia-gorda', 'water.darro']) {
      const item = tranche.items.find(({ feature_id }) => feature_id === featureId)
      expect(item?.claims.flatMap(({ citations }) => citations)
        .some(({ source_id }) => source_id === 'source.ugr-water-ordinances-2022')).toBe(true)
    }
    for (const featureId of ['walls.albaicin-north', 'walls.medina-lower']) {
      const item = tranche.items.find(({ feature_id }) => feature_id === featureId)
      expect(item?.period_assessment.change_from_1492).toBe('altered')
      expect(item?.period_assessment.physical_state).toBe('partially_in_use')
    }
  })
})
