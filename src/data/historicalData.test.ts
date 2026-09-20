import { describe, expect, it } from 'vitest'
import {
  allHistoricalFeatureCollection,
  geometryAudit,
  historicalFeatureCollection,
  sourcesById,
} from './historicalData'

describe('datos históricos', () => {
  it('solo carga en el mapa las geometrías publicables ya verificadas', () => {
    const geometryTypes = historicalFeatureCollection.features.map(
      (feature) => feature.geometry.type,
    )

    expect(geometryTypes).toContain('Point')
    expect(geometryTypes).toContain('LineString')
    expect(geometryTypes).toContain('Polygon')
    expect(historicalFeatureCollection.features).toHaveLength(
      geometryAudit.filter((entry) => entry.status === 'verified').length,
    )
    expect(
      geometryAudit.filter((entry) => entry.status === 'verified').map((entry) => entry.feature_id),
    ).toEqual(expect.arrayContaining(historicalFeatureCollection.features.map((feature) => feature.id)))
  })

  it('resuelve todas las referencias bibliográficas', () => {
    for (const feature of allHistoricalFeatureCollection.features) {
      expect(feature.properties.citations.length).toBeGreaterThan(0)
      for (const citation of feature.properties.citations) {
        expect(sourcesById.has(citation.source_id)).toBe(true)
      }
      for (const sourceId of feature.properties.geometry_source_refs) {
        expect(sourcesById.has(sourceId)).toBe(true)
      }
    }
  })

  it('incluye al menos una geometría aproximada', () => {
    expect(
      allHistoricalFeatureCollection.features.some(
        (feature) => feature.properties.confidence.location === 'approximate',
      ),
    ).toBe(true)
  })

  it('incluye la morfología urbana necesaria para M3', () => {
    const featureIds = new Set(
      allHistoricalFeatureCollection.features.map((feature) => feature.id),
    )

    for (const featureId of [
      'urban.albaicin',
      'urban.lower-medina',
      'urban.late-nasrid-extent',
      'royal.alhambra',
      'royal.generalife',
      'walls.albaicin-north',
      'walls.medina-lower',
      'walls.alhambra-perimeter',
      'water.darro',
      'water.genil',
    ]) {
      expect(featureIds.has(featureId), featureId).toBe(true)
    }
  })
})
