import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import sourceReviewJson from '../../data/research/c1550/m10.5-source-review-3.json'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import inventoryJson from '../../data/research/c1550-inventory.json'
import sourcesJson from '../../data/sources.json'
import { sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5SourceReview3Schema,
  c1550ResearchInventorySchema,
  M10_5_GEOMETRY_FEATURE_IDS,
  M10_5_SOURCE_REVIEW_3_FEATURE_IDS,
  periodFeatureCollectionSchema,
} from './temporalSchema'

const tranche = c1550M10_5SourceReview3Schema.parse(sourceReviewJson)
const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const inventory = c1550ResearchInventorySchema.parse(inventoryJson)
const sourceIds = new Set(sourceRegistrySchema.parse(sourcesJson).map(({ id }) => id))
const mappedIds = new Set([pointsRaw, linesRaw, areasRaw]
  .flatMap((raw) => periodFeatureCollectionSchema.parse(JSON.parse(raw)).features)
  .map(({ id }) => id))

describe('M10.5 third source-review tranche', () => {
  it('preserves the ten source-review records while the later wave promotes only its safe subset', () => {
    expect(tranche.feature_ids).toEqual(M10_5_SOURCE_REVIEW_3_FEATURE_IDS)
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

  it('advances every record to content readiness and reduces the unstarted inventory', () => {
    const inventoryStatusById = new Map<string, string>()
    inventory.existing_entity_triage.forEach((entry) => inventoryStatusById.set(entry.feature_id, entry.research_status))
    inventory.candidate_entities.forEach((entry) => inventoryStatusById.set(entry.proposed_id, entry.research_status))
    const decisionById = new Map(candidate.inventory_decisions.map((entry) => [entry.feature_id, entry.decision]))
    for (const featureId of M10_5_SOURCE_REVIEW_3_FEATURE_IDS) {
      expect(inventoryStatusById.get(featureId)).toBe('ready_for_review')
      const promoted = M10_5_GEOMETRY_FEATURE_IDS.includes(
        featureId as (typeof M10_5_GEOMETRY_FEATURE_IDS)[number],
      )
      expect(decisionById.get(featureId)).toBe(
        promoted ? 'internal_candidate' : 'content_ready_geometry_deferred',
      )
    }
    expect(candidate.inventory_decisions.filter(({ decision }) => decision === 'content_ready_geometry_deferred'))
      .toHaveLength(18)
    expect(candidate.inventory_decisions.filter(({ decision }) => decision === 'research_not_started'))
      .toHaveLength(0)
  })

  it('records the evidence-led corrections without overstating uncertain identity', () => {
    const byId = new Map(tranche.items.map((item) => [item.feature_id, item]))
    expect(byId.get('royal.generalife')?.period_assessment.change_from_1492).toBe('altered')
    expect(byId.get('water.banuelo')?.period_assessment.temporal_confidence).toBe('probable')
    expect(byId.get('water.banuelo')?.period_assessment.change_from_1492).toBe('retained')
    for (const featureId of ['gate.alhambra-arms', 'gate.alhambra-arrabal', 'gate.alhambra-seven-floors']) {
      expect(byId.get(featureId)?.period_assessment.change_from_1492).toBe('altered')
    }
    expect(byId.get('bridge.cadi')?.period_assessment.presence).toBe('unknown')
    expect(byId.get('bridge.cadi')?.geometry_decision.action).toBe('no_geometry_until_chronology_resolved')
    expect(byId.get('bridge.carbon')?.period_assessment.presence).toBe('present')
  })

  it('uses sixteenth-century evidence for the three hydraulic records', () => {
    const citationsFor = (featureId: string) => tranche.items
      .find((item) => item.feature_id === featureId)
      ?.claims.flatMap(({ citations }) => citations).map(({ source_id }) => source_id) ?? []
    expect(citationsFor('water.genil')).toContain('source.ugr-water-ordinances-2022')
    expect(citationsFor('water.acequia-cadi')).toContain('source.ugr-cadi-ordinances-2025')
    expect(citationsFor('water.acequia-romayla')).toContain('source.ugr-water-ordinances-2022')
  })
})
