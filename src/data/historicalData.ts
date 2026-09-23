import areasRaw from '../../data/geo/areas.geojson?raw'
import geometryAuditJson from '../../data/geometry-audit.json'
import gazetteerJson from '../../data/gazetteer.json'
import linesRaw from '../../data/geo/lines.geojson?raw'
import pointsRaw from '../../data/geo/points.geojson?raw'
import sourcesJson from '../../data/sources.json'
import {
  featureCollectionSchema,
  gazetteerSchema,
  geometryAuditSchema,
  sourceRegistrySchema,
  type HistoricalFeatureCollection,
} from './schema'

const collections = [pointsRaw, linesRaw, areasRaw].map((raw) =>
  featureCollectionSchema.parse(JSON.parse(raw)),
)

export const sources = sourceRegistrySchema.parse(sourcesJson)
export const sourcesById = new Map(sources.map((source) => [source.id, source]))
export const geometryAudit = geometryAuditSchema.parse(geometryAuditJson)
export const geometryAuditByFeatureId = new Map(
  geometryAudit.map((entry) => [entry.feature_id, entry]),
)
export const gazetteer = gazetteerSchema.parse(gazetteerJson)
export const gazetteerByFeatureId = new Map(
  gazetteer
    .filter((entry) => entry.feature_id !== null)
    .map((entry) => [entry.feature_id as string, entry]),
)

export const gazetteerSummary = {
  total: gazetteer.length,
  mapped: gazetteer.filter((entry) => entry.inventory_status === 'mapped').length,
  unresolved: gazetteer.filter((entry) => entry.inventory_status !== 'mapped').length,
}

export const allHistoricalFeatureCollection: HistoricalFeatureCollection = {
  type: 'FeatureCollection',
  features: collections.flatMap((collection) => collection.features),
}

export const historicalFeatureCollection: HistoricalFeatureCollection = {
  type: 'FeatureCollection',
  features: allHistoricalFeatureCollection.features.filter(
    (feature) =>
      feature.properties.publication_status === 'publishable' &&
      geometryAuditByFeatureId.get(feature.id)?.status === 'verified',
  ),
}

export const geometryAuditSummary = {
  total: geometryAudit.length,
  verified: geometryAudit.filter((entry) => entry.status === 'verified').length,
}
