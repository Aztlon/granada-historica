import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Geometry, Position } from 'geojson'
import { sourceRegistrySchema } from '../src/data/schema'
import { periodFeatureCollectionSchema } from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layers = ['points', 'lines', 'areas'] as const
const jsonPropertyNames = [
  'aliases',
  'modern_search_terms',
  'citations',
  'evidence_basis',
  'geometry_source_refs',
] as const

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown
}

function restoreJsonProperties(properties: Record<string, unknown>) {
  const restored = { ...properties }
  for (const propertyName of jsonPropertyNames) {
    const value = restored[propertyName]
    if (typeof value !== 'string') continue
    try {
      restored[propertyName] = JSON.parse(value) as unknown
    } catch (error) {
      throw new Error(`El campo ${propertyName} no contiene JSON válido.`, { cause: error })
    }
  }
  return restored
}

const sources = sourceRegistrySchema.parse(
  await readJson(resolve(repositoryRoot, 'data/sources.json')),
)
const sourceIds = new Set(sources.map((source) => source.id))
const reprojectionTolerance = 5e-8

function positionsEquivalent(left: Position, right: Position) {
  return left.length === right.length
    && left.every((coordinate, index) => Math.abs(coordinate - right[index]) <= reprojectionTolerance)
}

function orderedPositionsEquivalent(left: Position[], right: Position[]) {
  return left.length === right.length
    && left.every((position, index) => positionsEquivalent(position, right[index]))
}

function ringsEquivalent(left: Position[], right: Position[]) {
  const leftOpen = left.length > 1 && positionsEquivalent(left[0], left.at(-1) as Position)
    ? left.slice(0, -1)
    : left
  const rightOpen = right.length > 1 && positionsEquivalent(right[0], right.at(-1) as Position)
    ? right.slice(0, -1)
    : right
  if (leftOpen.length !== rightOpen.length) return false
  return rightOpen.some((candidateStart, startIndex) => {
    if (!positionsEquivalent(leftOpen[0], candidateStart)) return false
    const forward = leftOpen.every((position, index) =>
      positionsEquivalent(position, rightOpen[(startIndex + index) % rightOpen.length]))
    const reverse = leftOpen.every((position, index) =>
      positionsEquivalent(position, rightOpen[(startIndex - index + rightOpen.length) % rightOpen.length]))
    return forward || reverse
  })
}

function polygonsEquivalent(left: Position[][], right: Position[][]) {
  return left.length === right.length
    && left.every((ring, index) => ringsEquivalent(ring, right[index]))
}

function geometriesEquivalent(left: Geometry, right: Geometry) {
  if (left.type !== right.type) return false
  switch (left.type) {
    case 'Point':
      return positionsEquivalent(left.coordinates, (right as typeof left).coordinates)
    case 'MultiPoint':
    case 'LineString':
      return orderedPositionsEquivalent(left.coordinates, (right as typeof left).coordinates)
    case 'MultiLineString':
      return left.coordinates.length === (right as typeof left).coordinates.length
        && left.coordinates.every((line, index) =>
          orderedPositionsEquivalent(line, (right as typeof left).coordinates[index]))
    case 'Polygon':
      return polygonsEquivalent(left.coordinates, (right as typeof left).coordinates)
    case 'MultiPolygon':
      return left.coordinates.length === (right as typeof left).coordinates.length
        && left.coordinates.every((polygon, index) =>
          polygonsEquivalent(polygon, (right as typeof left).coordinates[index]))
    default:
      return false
  }
}

const normalized = await Promise.all(layers.map(async (layer) => {
  const raw = await readJson(resolve(repositoryRoot, `gis/export/c1550-research/${layer}.geojson`))
  if (!raw || typeof raw !== 'object' || !('features' in raw) || !Array.isArray(raw.features)) {
    throw new Error(`La exportación c. 1550 de ${layer} no es una colección GeoJSON.`)
  }

  const candidate = {
    type: 'FeatureCollection' as const,
    period_id: 'c1550',
    features: raw.features.map((feature) => {
      if (!feature || typeof feature !== 'object' || !('properties' in feature)) {
        throw new Error(`La capa c. 1550 ${layer} contiene una entidad sin propiedades.`)
      }
      const properties = feature.properties
      if (!properties || typeof properties !== 'object' || !('id' in properties)) {
        throw new Error(`La capa c. 1550 ${layer} contiene una entidad sin id.`)
      }
      const restoredProperties = restoreJsonProperties(properties as Record<string, unknown>)
      return { ...feature, id: restoredProperties.id, properties: restoredProperties }
    }),
  }

  const collection = periodFeatureCollectionSchema.parse(candidate)
  const previous = periodFeatureCollectionSchema.parse(
    await readJson(resolve(repositoryRoot, `data/research/c1550/${layer}.geojson`)),
  )
  const previousById = new Map(previous.features.map((feature) => [feature.id, feature]))
  const stabilizedCollection = periodFeatureCollectionSchema.parse({
    ...collection,
    features: collection.features.map((feature) => {
      const previousFeature = previousById.get(feature.id)
      return previousFeature
        && geometriesEquivalent(feature.geometry as Geometry, previousFeature.geometry as Geometry)
        ? { ...feature, geometry: previousFeature.geometry }
        : feature
    }),
  })
  for (const feature of stabilizedCollection.features) {
    if (feature.properties.period_id !== 'c1550' || feature.properties.publication_status !== 'research') {
      throw new Error(`${feature.id} debe seguir siendo una geometría privada de investigación c. 1550.`)
    }
    for (const sourceId of [
      ...feature.properties.geometry_source_refs,
      ...feature.properties.citations.map((citation) => citation.source_id),
    ]) {
      if (!sourceIds.has(sourceId)) throw new Error(`${feature.id} referencia una fuente inexistente: ${sourceId}`)
    }
  }
  return { layer, collection: stabilizedCollection }
}))

for (const { layer, collection } of normalized) {
  const outputPath = resolve(repositoryRoot, `data/research/c1550/${layer}.geojson`)
  await writeFile(outputPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8')
}

console.log('Las capas c. 1550 se han normalizado dentro del área privada de investigación.')
