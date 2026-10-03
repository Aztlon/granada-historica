import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import auditsJson from '../../data/research/c1550/geometry-audit.json'
import inventoryJson from '../../data/research/c1550-inventory.json'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import reviewJson from '../../data/research/c1550/m10.3-review.json'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import sourcesJson from '../../data/sources.json'
import { sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550ResearchInventorySchema,
  c1550VerticalSliceReviewSchema,
  M10_3_FEATURE_IDS,
  M10_5_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
} from './temporalSchema'

const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const review = c1550VerticalSliceReviewSchema.parse(reviewJson)
const inventory = c1550ResearchInventorySchema.parse(inventoryJson)
const sources = sourceRegistrySchema.parse(sourcesJson)
const features = [pointsRaw, linesRaw, areasRaw]
  .flatMap((raw) => periodFeatureCollectionSchema.parse(JSON.parse(raw)).features)
const audits = periodGeometryAuditSchema.parse(auditsJson)

describe('M10.5 c. 1550 candidate', () => {
  it('assembles the exact 39-feature mapped candidate without promoting it', () => {
    expect(candidate.feature_ids).toEqual(M10_5_FEATURE_IDS)
    expect(candidate.items).toHaveLength(39)
    expect(candidate.status).toBe('ready_for_specialist_review')
    expect(candidate.public_application_import).toBe(false)
    expect(candidate.promotion_gate.public_ready).toBe(false)
    expect(candidate.signoffs).toHaveLength(6)
    expect(candidate.signoffs.every(({ status }) => status === 'pending')).toBe(true)
  })

  it('keeps every mapped feature cited, bilingual and aligned with its audit', () => {
    const sourceIds = new Set(sources.map(({ id }) => id))
    const featuresById = new Map(features.map((feature) => [feature.id, feature]))
    const auditsById = new Map(audits.map((audit) => [audit.feature_id, audit]))
    for (const item of candidate.items) {
      expect(item.content.es.summary.length).toBeGreaterThan(20)
      expect(item.content.en.summary.length).toBeGreaterThan(20)
      expect(item.claims.length).toBeGreaterThanOrEqual(2)
      expect(featuresById.has(item.feature_id)).toBe(true)
      expect(auditsById.get(item.feature_id)?.status).toBe(item.geometry_review.audit_status)
      for (const claim of item.claims) {
        expect(claim.citations.every(({ source_id }) => sourceIds.has(source_id))).toBe(true)
      }
    }
  })

  it('preserves the M10.3 reviewed content while remapping its two clusters', () => {
    for (const featureId of M10_3_FEATURE_IDS) {
      const earlier = review.items.find((item) => item.feature_id === featureId)
      const current = candidate.items.find((item) => item.feature_id === featureId)
      expect(current?.content).toEqual(earlier?.content)
      expect(current?.claims).toEqual(earlier?.claims)
      expect(current?.relationships).toEqual(earlier?.relationships)
      expect(current?.geometry_review).toEqual(earlier?.geometry_review)
    }
  })

  it('records a decision for every anchor, high and medium inventory entity', () => {
    const expected = new Set([
      ...inventory.existing_entity_triage
        .filter(({ priority }) => priority !== 'defer')
        .map(({ feature_id }) => feature_id),
      ...inventory.candidate_entities
        .filter(({ priority }) => priority !== 'defer')
        .map(({ proposed_id }) => proposed_id),
    ])
    const actual = new Set(candidate.inventory_decisions.map(({ feature_id }) => feature_id))
    expect(actual).toEqual(expected)
  })

  it('defers unsupported citywide and sensitive polygons with reproducible methods', () => {
    expect(candidate.analytical_layers.map(({ layer_id }) => layer_id)).toEqual(expect.arrayContaining([
      'analysis.public-squares',
      'analysis.parish-boundaries',
      'analysis.population-geography',
      'analysis.citywide-extent',
    ]))
    expect(candidate.analytical_layers.every(({ status }) => status === 'deferred')).toBe(true)
    expect(candidate.themes.find(({ theme_id }) => theme_id === 'population_geography')?.feature_ids).toEqual([])
  })

  it('rejects a release candidate while specialist review or geometry verification is pending', () => {
    expect(() => c1550M10_5CandidateSchema.parse({
      ...candidate,
      status: 'release_candidate',
      promotion_gate: { public_ready: true, blockers: [] },
    })).toThrow()
  })
})
