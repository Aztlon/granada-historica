import { describe, expect, it } from 'vitest'
import { historicalFeatureCollection, sourcesById } from './historicalData'

describe('datos históricos', () => {
  it('carga las geometrías publicables de puntos, líneas y áreas', () => {
    const geometryTypes = historicalFeatureCollection.features.map(
      (feature) => feature.geometry.type,
    )

    expect(geometryTypes).toContain('Point')
    expect(geometryTypes).toContain('LineString')
    expect(geometryTypes).toContain('Polygon')
    expect(historicalFeatureCollection.features).toHaveLength(21)
  })

  it('resuelve todas las referencias bibliográficas', () => {
    for (const feature of historicalFeatureCollection.features) {
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
      historicalFeatureCollection.features.some(
        (feature) => feature.properties.confidence.location === 'approximate',
      ),
    ).toBe(true)
  })

  it('incluye la morfología urbana necesaria para M3', () => {
    const featureIds = new Set(
      historicalFeatureCollection.features.map((feature) => feature.id),
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
