import legacyAreasRaw from '../../data/geo/areas.geojson?raw'
import legacyLinesRaw from '../../data/geo/lines.geojson?raw'
import legacyPointsRaw from '../../data/geo/points.geojson?raw'
import areasRaw from '../../data/research/c1550/areas.geojson?raw'
import auditsJson from '../../data/research/c1550/geometry-audit.json'
import candidateJson from '../../data/research/c1550/m10.5-candidate.json'
import waveJson from '../../data/research/c1550/m10.5-geometry-wave-2.json'
import linesRaw from '../../data/research/c1550/lines.geojson?raw'
import pointsRaw from '../../data/research/c1550/points.geojson?raw'
import sourcesJson from '../../data/sources.json'
import { featureCollectionSchema, sourceRegistrySchema } from './schema'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5GeometryWave2Schema,
  M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
} from './temporalSchema'

const wave = c1550M10_5GeometryWave2Schema.parse(waveJson)
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

describe('M10.5 second controlled geometry wave', () => {
  it('promotes exactly six private hypotheses and leaves eight entities deferred', () => {
    expect(wave.feature_ids).toEqual(M10_5_GEOMETRY_WAVE_2_FEATURE_IDS)
    expect(wave.deferred_feature_ids).toEqual(M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS)
    expect(wave.items).toHaveLength(6)
    expect(wave.selection_decisions).toHaveLength(14)
    expect(wave.control_registers).toHaveLength(6)
    expect(wave.public_application_import).toBe(false)
    expect(collections.map((collection) => collection.features.length)).toEqual([25, 10, 4])

    for (const featureId of M10_5_GEOMETRY_WAVE_2_FEATURE_IDS) {
      expect(featureById.get(featureId)?.properties.publication_status).toBe('research')
      expect(auditById.get(featureId)?.status).toBe('in_review')
      expect(candidate.inventory_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('internal_candidate')
      expect(wave.selection_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('promote_in_review')
    }

    for (const featureId of M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS) {
      expect(featureById.has(featureId)).toBe(false)
      expect(candidate.inventory_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('content_ready_geometry_deferred')
      expect(wave.selection_decisions.find((decision) => decision.feature_id === featureId)?.decision)
        .toBe('remain_deferred')
    }
  })

  it('retains only the inherited point or main axis as a reviewable c. 1550 variant', () => {
    expect(featureById.get('gate.fajalauza')?.geometry.type).toBe('Point')
    for (const featureId of M10_5_GEOMETRY_WAVE_2_FEATURE_IDS) {
      const feature = featureById.get(featureId)
      expect(feature?.geometry).toEqual(legacyById.get(featureId)?.geometry)
      expect(feature?.properties.geometry_variant_id).toBe(`c1550.${featureId}`)
    }
    for (const featureId of M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.filter(
      (featureId) => featureId.startsWith('water.'),
    )) {
      expect(['LineString', 'MultiLineString']).toContain(featureById.get(featureId)?.geometry.type)
    }
  })

  it('binds every promotion to multiple controls and explicit excluded components', () => {
    const sourceIds = new Set(sourceRegistrySchema.parse(sourcesJson).map((source) => source.id))
    for (const register of wave.control_registers) {
      expect(register.controls.length).toBeGreaterThanOrEqual(2)
      expect(register.excluded_components.length).toBeGreaterThanOrEqual(1)
      expect(register.inherited_geometry_variant_id).toBe(`c1492.${register.feature_id}`)
      for (const control of register.controls) {
        expect(control.source_refs.length).toBeGreaterThan(0)
        expect(control.source_refs.every((sourceId) => sourceIds.has(sourceId))).toBe(true)
      }
    }
    for (const decision of wave.selection_decisions) {
      expect(decision.source_refs.every((sourceId) => sourceIds.has(sourceId))).toBe(true)
    }
  })
})
