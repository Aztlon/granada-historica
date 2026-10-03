import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import sourceReviewJson from '../../data/research/c1550/m10.5-source-review-4.json'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import inventoryJson from '../../data/research/c1550-inventory.json'
import sourcesJson from '../../data/sources.json'
import { sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5SourceReview4Schema,
  c1550ResearchInventorySchema,
  M10_5_SOURCE_REVIEW_4_FEATURE_IDS,
  periodFeatureCollectionSchema,
} from './temporalSchema'

const tranche = c1550M10_5SourceReview4Schema.parse(sourceReviewJson)
const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const inventory = c1550ResearchInventorySchema.parse(inventoryJson)
const sourceIds = new Set(sourceRegistrySchema.parse(sourcesJson).map(({ id }) => id))
const mappedIds = new Set([pointsRaw, linesRaw, areasRaw]
  .flatMap((raw) => periodFeatureCollectionSchema.parse(JSON.parse(raw)).features)
  .map(({ id }) => id))

describe('M10.5 fourth source-review tranche', () => {
  it('contains exactly the ten formerly untouched records without creating geometry', () => {
    expect(tranche.feature_ids).toEqual(M10_5_SOURCE_REVIEW_4_FEATURE_IDS)
    expect(tranche.items).toHaveLength(10)
    expect(tranche.public_application_import).toBe(false)
    for (const item of tranche.items) {
      expect(item.content.es.summary.length).toBeGreaterThan(20)
      expect(item.content.en.summary.length).toBeGreaterThan(20)
      expect(item.claims.length).toBeGreaterThanOrEqual(2)
      expect(item.geometry_decision.status).toBe('deferred')
      expect(mappedIds.has(item.feature_id)).toBe(false)
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

  it('advances the ten records and exhausts the M10.5 research-not-started queue', () => {
    const inventoryStatusById = new Map<string, string>()
    inventory.existing_entity_triage.forEach((entry) => inventoryStatusById.set(entry.feature_id, entry.research_status))
    inventory.candidate_entities.forEach((entry) => inventoryStatusById.set(entry.proposed_id, entry.research_status))
    const decisionById = new Map(candidate.inventory_decisions.map((entry) => [entry.feature_id, entry.decision]))
    for (const featureId of M10_5_SOURCE_REVIEW_4_FEATURE_IDS) {
      expect(inventoryStatusById.get(featureId)).toBe('ready_for_review')
      expect(decisionById.get(featureId)).toBe('content_ready_geometry_deferred')
    }
    expect(candidate.inventory_decisions.filter(({ decision }) => decision === 'content_ready_geometry_deferred'))
      .toHaveLength(18)
    expect(candidate.inventory_decisions.filter(({ decision }) => decision === 'research_not_started'))
      .toHaveLength(0)
  })

  it('preserves uncertainty where the 1540–1560 evidence is indirect', () => {
    const byId = new Map(tranche.items.map((item) => [item.feature_id, item]))
    for (const featureId of ['gate.alfajjarin', 'gate.guadix', 'walls.axares-inner', 'walls.mauror-realejo-inner', 'route.molinos-sierra-axis']) {
      expect(byId.get(featureId)?.period_assessment.temporal_confidence).toBe('probable')
    }
    expect(byId.get('gate.alfajjarin')?.geometry_decision.action).toBe('no_geometry_until_chronology_resolved')
    expect(byId.get('gate.guadix')?.geometry_decision.action).toBe('no_geometry_until_chronology_resolved')
    expect(byId.get('walls.axares-inner')?.geometry_decision.action).toBe('no_geometry_until_chronology_resolved')
  })

  it('uses near-period ordinances for both hydraulic systems', () => {
    for (const featureId of ['water.acequia-axares', 'water.acequia-realejo']) {
      const item = tranche.items.find((entry) => entry.feature_id === featureId)
      expect(item?.period_assessment.temporal_confidence).toBe('secure')
      expect(item?.claims.flatMap(({ citations }) => citations).map(({ source_id }) => source_id))
        .toContain('source.ugr-water-ordinances-2022')
    }
  })
})
