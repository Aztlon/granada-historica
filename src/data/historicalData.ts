import areasRaw from '../../data/geo/areas.geojson?raw'
import geometryAuditJson from '../../data/geometry-audit.json'
import linesRaw from '../../data/geo/lines.geojson?raw'
import pointsRaw from '../../data/geo/points.geojson?raw'
import sourcesJson from '../../data/sources.json'
import {
  featureCollectionSchema,
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
