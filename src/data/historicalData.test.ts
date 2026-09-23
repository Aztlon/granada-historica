import { describe, expect, it } from 'vitest'
import {
  allHistoricalFeatureCollection,
  geometryAudit,
  gazetteer,
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

  it('mantiene un nomenclátor completo sin convertir dudas en geometrías', () => {
    const mappedIds = gazetteer
      .filter((entry) => entry.inventory_status === 'mapped')
      .map((entry) => entry.feature_id)

    expect(mappedIds).toHaveLength(allHistoricalFeatureCollection.features.length)
    expect(mappedIds).toEqual(
      expect.arrayContaining(allHistoricalFeatureCollection.features.map((feature) => feature.id)),
    )
    expect(gazetteer.some((entry) => entry.inventory_status === 'candidate')).toBe(true)
    expect(gazetteer.some((entry) => entry.inventory_status === 'disputed')).toBe(true)
    expect(gazetteer.some((entry) => entry.inventory_status === 'rejected')).toBe(true)
    expect(gazetteer.some((entry) => entry.inventory_status === 'unlocated')).toBe(true)
    expect(
      gazetteer
        .filter((entry) => entry.inventory_status !== 'mapped')
        .every((entry) => entry.feature_id === null),
    ).toBe(true)
  })

  it('clasifica las cercas sucesivas como exteriores, interiores o palatinas', () => {
    const defensiveEntries = gazetteer.filter((entry) => entry.defensive_context)
    const roles = defensiveEntries.map((entry) => entry.defensive_context?.role)

    expect(roles).toEqual(expect.arrayContaining(['outer_enclosure', 'inner_enclosure', 'palatine_enclosure']))
  })
})
