import { describe, expect, it } from 'vitest'
import { allHistoricalFeatureCollection } from './historicalData'
import type { HistoricalFeature } from './schema'
import { auditSpatialRelationships, lineIntersections } from './spatialAudit'

const baseline = allHistoricalFeatureCollection.features
function replace(id: string, geometry: HistoricalFeature['geometry']) {
  return baseline.map((f) => f.id === id ? { ...f, geometry } : f)
}

describe('auditoría de relaciones espaciales', () => {
  it('valida los canales, puentes y recintos revisados', () => {
    expect(auditSpatialRelationships(baseline)).toEqual([])
  })

  it.each(['water.acequia-aynadamar', 'water.acequia-romayla'])(
    'rechaza una acometida inventada de %s al Sagrario', (id) => {
      const features = replace(id, { type: 'LineString', coordinates: [
        [-3.596, 37.177], [-3.5990298, 37.1759292],
      ] })
      expect(auditSpatialRelationships(features)).toContain(`${id}: enlace no respaldado al Sagrario.`)
    },
  )

  it('detecta Axares desconectada de la mezquita', () => {
    const features = replace('water.acequia-axares', {
      type: 'LineString', coordinates: [[-3.59, 37.18], [-3.595, 37.18]],
    })
    expect(auditSpatialRelationships(features)).toContain('Axares debe alcanzar el ámbito de la Mezquita Mayor.')
  })

  it('rechaza Tarramonta que cruza aguas abajo y continúa al sureste', () => {
    const features = replace('water.acequia-tarramonta', {
      type: 'LineString', coordinates: [[-3.604, 37.17], [-3.604, 37.164], [-3.59, 37.16]],
    })
    expect(auditSpatialRelationships(features)).toContain(
      'tarramonta: se requiere un único cruce del Genil al este de la confluencia.',
    )
    expect(auditSpatialRelationships(features)).toContain(
      'tarramonta: falta la continuidad suroccidental tras el cruce.',
    )
  })

  it('rechaza el antiguo punto del Carbón fuera del río', () => {
    const features = replace('bridge.carbon', { type: 'Point', coordinates: [-3.6015, 37.176] })
    expect(auditSpatialRelationships(features)).toContain('bridge.carbon: el vano debe atravesar el Darro.')
    expect(auditSpatialRelationships(features)).toContain('Carbón: el puente debe coincidir con su calle, junto al Corral.')
  })

  it('detecta una Alcazaba separada de sus barrios vecinos y de su cerca', () => {
    const features = replace('quarter.alcazaba-qadima', {
      type: 'Polygon', coordinates: [[[-3.599, 37.186], [-3.598, 37.186],
        [-3.598, 37.187], [-3.599, 37.186]]],
    })
    expect(auditSpatialRelationships(features)).toContain('alcazaba-qadima/axares: falta un límite común continuo.')
    expect(auditSpatialRelationships(features)).toContain(
      'El recinto y la cerca de alcazaba-qadima deben expresar la misma hipótesis.',
    )
  })
})

describe('intersecciones de segmentos', () => {
  it('no confunde segmentos colineales separados con un cruce', () => {
    expect(lineIntersections([[[0, 0], [1, 1]]], [[[2, 2], [3, 3]]])).toEqual([])
  })
  it('cuenta una vez el cruce por un vértice compartido', () => {
    expect(lineIntersections([[[0, 0], [1, 1], [2, 2]]], [[[0, 2], [1, 1], [2, 0]]])).toEqual([[1, 1]])
  })
})
