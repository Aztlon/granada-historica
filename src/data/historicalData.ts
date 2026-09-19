import areasRaw from '../../data/geo/areas.geojson?raw'
import linesRaw from '../../data/geo/lines.geojson?raw'
import pointsRaw from '../../data/geo/points.geojson?raw'
import sourcesJson from '../../data/sources.json'
import {
  featureCollectionSchema,
  sourceRegistrySchema,
  type HistoricalFeatureCollection,
} from './schema'

const collections = [pointsRaw, linesRaw, areasRaw].map((raw) =>
  featureCollectionSchema.parse(JSON.parse(raw)),
)

export const sources = sourceRegistrySchema.parse(sourcesJson)
export const sourcesById = new Map(sources.map((source) => [source.id, source]))

export const historicalFeatureCollection: HistoricalFeatureCollection = {
  type: 'FeatureCollection',
  features: collections
    .flatMap((collection) => collection.features)
    .filter((feature) => feature.properties.publication_status === 'publishable'),
}
