import researchAreasRaw from '../../data/research/c1550/areas.geojson?raw'
import researchAuditJson from '../../data/research/c1550/geometry-audit.json'
import researchLinesRaw from '../../data/research/c1550/lines.geojson?raw'
import researchManifestJson from '../../data/research/c1550/manifest.json'
import researchPointsRaw from '../../data/research/c1550/points.geojson?raw'
import legacyAreasRaw from '../../data/geo/areas.geojson?raw'
import legacyLinesRaw from '../../data/geo/lines.geojson?raw'
import { describe, expect, it } from 'vitest'
import { allHistoricalFeatureCollection } from './historicalData'
import { featureCollectionSchema } from './schema'
import {
  c1550ResearchPackageManifestSchema,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
} from './temporalSchema'

const researchCollections = [researchPointsRaw, researchLinesRaw, researchAreasRaw]
  .map((raw) => periodFeatureCollectionSchema.parse(JSON.parse(raw)))
const researchFeatures = researchCollections.flatMap((collection) => collection.features)
const researchById = new Map(researchFeatures.map((feature) => [feature.id, feature]))

describe('paquete GIS privado c. 1550 de M10.5', () => {
  it('contiene puntos, líneas y áreas sin ninguna ruta de publicación', () => {
    expect(researchCollections.map((collection) => collection.features.length)).toEqual([25, 10, 4])
    expect(researchFeatures).toHaveLength(39)
    expect(researchFeatures.every((feature) => feature.properties.period_id === 'c1550')).toBe(true)
    expect(researchFeatures.every((feature) => feature.properties.publication_status === 'research')).toBe(true)
    expect(researchFeatures.every((feature) => Boolean(feature.properties.spatial_confidence))).toBe(true)

    const publicIds = new Set(allHistoricalFeatureCollection.features.map((feature) => feature.id))
    for (const newFeatureId of [
      'religious.cathedral-granada',
      'religious.royal-chapel',
      'civic.lonja-mercaderes',
      'civic.university-curia',
      'royal.palace-charles-v',
      'gate.puerta-granadas',
    ]) {
      expect(publicIds.has(newFeatureId)).toBe(false)
    }
  })

  it('mantiene las fases activas como puntos y no como plantas terminadas', () => {
    for (const featureId of [
      'religious.cathedral-granada',
      'civic.real-chancilleria',
      'civic.hospital-real',
      'royal.palace-charles-v',
      'gate.puerta-granadas',
      'religious.san-miguel-bajo',
      'religious.san-cristobal',
    ]) {
      expect(researchById.get(featureId)?.geometry.type, featureId).toBe('Point')
    }
    expect(researchById.get('royal.palace-charles-v')?.properties.physical_state)
      .toBe('under_construction')
    expect(researchById.get('religious.san-miguel-bajo')?.properties.physical_state)
      .toBe('partially_in_use')
  })

  it('reutiliza solo geometrías heredadas acotadas y les asigna auditoría temporal nueva', () => {
    const legacyLines = featureCollectionSchema.parse(JSON.parse(legacyLinesRaw)).features
    const legacyAreas = featureCollectionSchema.parse(JSON.parse(legacyAreasRaw)).features
    const legacyById = new Map([...legacyLines, ...legacyAreas].map((feature) => [feature.id, feature]))

    for (const featureId of ['walls.alhambra-perimeter', 'royal.alhambra', 'civic.maristan']) {
      expect(researchById.get(featureId)?.geometry).toEqual(legacyById.get(featureId)?.geometry)
    }

    const audit = periodGeometryAuditSchema.parse(researchAuditJson)
    expect(audit).toHaveLength(researchFeatures.length)
    expect(audit.every((entry) => entry.period_id === 'c1550')).toBe(true)
    expect(audit.every((entry) => entry.status === 'in_review')).toBe(true)
    expect(new Set(audit.map((entry) => `${entry.period_id}:${entry.feature_id}`)).size)
      .toBe(audit.length)
  })

  it('aplaza expresamente la precisión todavía no sustentada', () => {
    const manifest = c1550ResearchPackageManifestSchema.parse(researchManifestJson)
    const deferrals = new Set(manifest.deferred_geometry.map((entry) => entry.scope_id))

    expect(manifest.public_application_import).toBe(false)
    expect(manifest.included_feature_ids).toHaveLength(researchFeatures.length)
    expect(deferrals).toEqual(new Set([
      'defer.active-building-footprints',
      'defer.completed-centre-footprints',
      'defer.public-squares',
      'defer.citywide-population',
      'defer.parish-boundaries',
      'defer.infrastructure-change',
    ]))
  })
})
