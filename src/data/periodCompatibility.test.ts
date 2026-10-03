import entitiesJson from '../../data/entities.json'
import legacyAuditJson from '../../data/geometry-audit.json'
import periodAuditJson from '../../data/geometry-audit-periods.json'
import legacyAreasRaw from '../../data/geo/areas.geojson?raw'
import legacyLinesRaw from '../../data/geo/lines.geojson?raw'
import legacyPointsRaw from '../../data/geo/points.geojson?raw'
import periodAreasRaw from '../../data/periods/c1492/areas.geojson?raw'
import periodLinesRaw from '../../data/periods/c1492/lines.geojson?raw'
import periodPointsRaw from '../../data/periods/c1492/points.geojson?raw'
import { describe, expect, it } from 'vitest'
import {
  featureCollectionSchema,
  geometryAuditSchema,
  type HistoricalFeature,
} from './schema'
import { searchHistoricalFeatures } from './search'
import {
  compatibilityPeriodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  stableEntityCatalogSchema,
} from './temporalSchema'

const legacyFeatures = [legacyPointsRaw, legacyLinesRaw, legacyAreasRaw]
  .flatMap((raw) => featureCollectionSchema.parse(JSON.parse(raw)).features)
const periodFeatures = [periodPointsRaw, periodLinesRaw, periodAreasRaw]
  .flatMap((raw) => compatibilityPeriodFeatureCollectionSchema.parse(JSON.parse(raw)).features)

function fnv1a(value: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function legacyProperties(feature: (typeof periodFeatures)[number]) {
  return Object.fromEntries(
    Object.entries(feature.properties).filter(([key]) => key !== 'period_id' && key !== 'period_state'),
  )
}

describe('compatibilidad del periodo c. 1492', () => {
  it('conserva IDs, orden, recuentos y hashes geométricos', () => {
    expect(periodFeatures.map((feature) => feature.id)).toEqual(
      legacyFeatures.map((feature) => feature.id),
    )
    expect(periodFeatures.map((feature) => fnv1a(JSON.stringify(feature.geometry)))).toEqual(
      legacyFeatures.map((feature) => fnv1a(JSON.stringify(feature.geometry))),
    )
  })

  it('conserva literalmente etiquetas, búsqueda, publicación y citas', () => {
    expect(periodFeatures.map(legacyProperties)).toEqual(
      legacyFeatures.map((feature) => feature.properties),
    )
    for (const [index, feature] of periodFeatures.entries()) {
      expect(feature.properties.period_state.temporal_confidence).toBe(
        legacyFeatures[index].properties.present_c1492,
      )
      expect(feature.properties.period_state.spatial_confidence).toBe(
        legacyFeatures[index].properties.confidence.location,
      )
      expect(feature.properties.period_state.citations).toEqual(
        legacyFeatures[index].properties.citations,
      )
    }
  })

  it('devuelve los mismos resultados de búsqueda y el mismo conjunto renderizable', () => {
    for (const query of ['madraza', 'bib rambla', 'acequia', 'alhambra', 'catedral']) {
      const legacyResults = searchHistoricalFeatures(legacyFeatures, query)
      const periodResults = searchHistoricalFeatures(periodFeatures as HistoricalFeature[], query)
      expect(periodResults.map(({ feature, matchedOn, score }) => ({ id: feature.id, matchedOn, score })))
        .toEqual(legacyResults.map(({ feature, matchedOn, score }) => ({ id: feature.id, matchedOn, score })))
    }

    const legacyAudit = geometryAuditSchema.parse(legacyAuditJson)
    const verifiedIds = new Set(
      legacyAudit.filter((entry) => entry.status === 'verified').map((entry) => entry.feature_id),
    )
    const renderable = (features: readonly HistoricalFeature[]) => features
      .filter((feature) => feature.properties.publication_status === 'publishable' && verifiedIds.has(feature.id))
      .map((feature) => feature.id)

    expect(renderable(periodFeatures as HistoricalFeature[])).toEqual(renderable(legacyFeatures))
  })

  it('mantiene una identidad de auditoría compuesta sin cambiar el registro antiguo', () => {
    const legacyAudit = geometryAuditSchema.parse(legacyAuditJson)
    const periodAudit = periodGeometryAuditSchema.parse(periodAuditJson)
    const keys = periodAudit.map((entry) => `${entry.period_id}:${entry.feature_id}`)

    expect(new Set(keys).size).toBe(keys.length)
    expect(periodAudit.map((entry) => Object.fromEntries(
      Object.entries(entry).filter(([key]) => key !== 'period_id'),
    ))).toEqual(legacyAudit)
  })

  it('deriva un catálogo estable completo y enlaza cada geometría vigente', () => {
    const catalog = stableEntityCatalogSchema.parse(entitiesJson)
    const featureIds = new Set(periodFeatures.map((feature) => feature.id))

    expect(catalog.entities).toHaveLength(70)
    expect(catalog.entities.filter((entity) => entity.feature_id !== null)).toHaveLength(58)
    expect(catalog.entities.every((entity) => !entity.id.startsWith('gaz.'))).toBe(true)
    expect(catalog.entities.find((entity) => entity.gazetteer_id === 'gaz.gate.pesas')?.id)
      .toBe('gate.pesas')
    expect(
      catalog.entities
        .filter((entity) => entity.feature_id !== null)
        .every((entity) => featureIds.has(entity.feature_id as string)),
    ).toBe(true)
  })
})
