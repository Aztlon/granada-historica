import legacyAreasRaw from '../../data/geo/areas.geojson?raw'
import legacyLinesRaw from '../../data/geo/lines.geojson?raw'
import legacyPointsRaw from '../../data/geo/points.geojson?raw'
import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import auditsJson from '../../data/research/c1550/geometry-audit.json'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import waveJson from '../../data/research/c1550/m10.5-geometry-wave-1.json'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import sourcesJson from '../../data/sources.json'
import { featureCollectionSchema, sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5GeometryWave1Schema,
  M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_1_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
} from './temporalSchema'

const wave = c1550M10_5GeometryWave1Schema.parse(waveJson)
const candidate = c1550M10_5CandidateSchema.parse(candidateJson)
const collections = [pointsRaw, linesRaw, areasRaw]
  .map((raw) => periodFeatureCollectionSchema.parse(JSON.parse(raw)))
const features = collections.flatMap((collection) => collection.features)
const featureById = new Map(features.map((feature) => [feature.id, feature]))
const auditById = new Map(periodGeometryAuditSchema.parse(auditsJson)
  .map((audit) => [audit.feature_id, audit]))
const legacyById = new Map([legacyPointsRaw, legacyLinesRaw, legacyAreasRaw]
  .flatMap((raw) => featureCollectionSchema.parse(JSON.parse(raw)).features)
  .map((feature) => [feature.id, feature]))

const referencePointIds = [
  'religious.santa-cruz-real',
  'religious.san-jeronimo',
  'religious.san-jose',
  'religious.san-juan-reyes',
  'religious.san-matias',
  'religious.san-luis',
] as const
const inheritedGeometryIds = M10_5_GEOMETRY_WAVE_1_FEATURE_IDS
  .filter((featureId) => !(referencePointIds as readonly string[]).includes(featureId))

describe('M10.5 first low-risk geometry wave', () => {
  it('adds exactly the agreed 16 private in-review geometries', () => {
    expect(wave.feature_ids).toEqual(M10_5_GEOMETRY_WAVE_1_FEATURE_IDS)
    expect(wave.items).toHaveLength(16)
    expect(wave.public_application_import).toBe(false)
    expect(collections.map((collection) => collection.features.length)).toEqual([25, 10, 4])

    for (const featureId of M10_5_GEOMETRY_WAVE_1_FEATURE_IDS) {
      expect(featureById.get(featureId)?.properties.publication_status).toBe('research')
      expect(auditById.get(featureId)?.status).toBe('in_review')
      expect(candidate.inventory_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('internal_candidate')
    }
  })

  it('uses six modern site points without inventing building footprints', () => {
    for (const featureId of referencePointIds) {
      const feature = featureById.get(featureId)
      expect(feature?.geometry.type).toBe('Point')
      expect(feature?.properties.geometry_method).toBe('modern_reference_location')
      expect(feature?.properties.geometry_source_refs).toEqual(expect.arrayContaining([
        'source.openstreetmap',
        'source.pnoa-andalucia-2022',
      ]))
      if (feature?.geometry.type === 'Point') {
        expect(feature.geometry.coordinates[0]).toBeGreaterThan(-3.61)
        expect(feature.geometry.coordinates[0]).toBeLessThan(-3.58)
        expect(feature.geometry.coordinates[1]).toBeGreaterThan(37.16)
        expect(feature.geometry.coordinates[1]).toBeLessThan(37.20)
      }
    }
  })

  it('retains inherited geometry exactly while assigning independent c. 1550 state', () => {
    for (const featureId of inheritedGeometryIds) {
      const feature = featureById.get(featureId)
      expect(feature?.geometry).toEqual(legacyById.get(featureId)?.geometry)
      expect(feature?.properties.geometry_variant_id).toBe(`c1550.${featureId}`)
      expect(feature?.properties.citations.length).toBeGreaterThan(0)
    }
  })

  it('records the original deferrals while allowing the separately controlled second wave', () => {
    expect(wave.deferred_feature_ids).toEqual(M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS)
    for (const featureId of M10_5_GEOMETRY_WAVE_2_FEATURE_IDS) {
      expect(featureById.has(featureId)).toBe(true)
      expect(candidate.inventory_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('internal_candidate')
    }
    for (const featureId of M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS) {
      expect(featureById.has(featureId)).toBe(false)
      expect(candidate.inventory_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('content_ready_geometry_deferred')
    }
  })

  it('resolves all geometry and claim source references', () => {
    const sourceIds = new Set(sourceRegistrySchema.parse(sourcesJson).map((source) => source.id))
    for (const featureId of M10_5_GEOMETRY_WAVE_1_FEATURE_IDS) {
      const feature = featureById.get(featureId)
      expect(feature?.properties.geometry_source_refs.every((sourceId) => sourceIds.has(sourceId))).toBe(true)
      expect(feature?.properties.citations.every((citation) => sourceIds.has(citation.source_id))).toBe(true)
    }
  })
})
