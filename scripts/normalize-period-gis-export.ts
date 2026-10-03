import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Geometry, Position } from 'geojson'
import {
  featureCollectionSchema,
  sourceRegistrySchema,
} from '../src/data/schema'
import { compatibilityPeriodFeatureCollectionSchema } from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const periodId = process.argv[2] ?? 'c1492'
if (periodId !== 'c1492') {
  throw new Error(`El exportador M10.1 solo admite c1492; periodo recibido: ${periodId}`)
}

const layers = ['points', 'lines', 'areas'] as const
const jsonPropertyNames = [
  'aliases',
  'modern_search_terms',
  'period',
  'confidence',
  'evidence_basis',
  'geometry_source_refs',
  'citations',
  'period_state',
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
      positionsEquivalent(
        position,
        rightOpen[(startIndex - index + rightOpen.length) % rightOpen.length],
      ))
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

const normalized = await Promise.all(
  layers.map(async (layer) => {
    const inputPath = resolve(repositoryRoot, `gis/export/${periodId}/${layer}.geojson`)
    const raw = await readJson(inputPath)
    if (!raw || typeof raw !== 'object' || !('features' in raw) || !Array.isArray(raw.features)) {
      throw new Error(`La exportación temporal de ${layer} no es una colección GeoJSON.`)
    }

    const candidate = {
      type: 'FeatureCollection' as const,
      period_id: periodId,
      features: raw.features.map((feature) => {
        if (!feature || typeof feature !== 'object' || !('properties' in feature)) {
          throw new Error(`La capa temporal ${layer} contiene una entidad sin propiedades.`)
        }
        const properties = feature.properties
        if (!properties || typeof properties !== 'object' || !('id' in properties)) {
          throw new Error(`La capa temporal ${layer} contiene una entidad sin id.`)
        }
        const restoredProperties = restoreJsonProperties(properties as Record<string, unknown>)
        return {
          ...feature,
          id: restoredProperties.id,
          properties: restoredProperties,
        }
      }),
    }

    const collection = compatibilityPeriodFeatureCollectionSchema.parse(candidate)
    const legacy = featureCollectionSchema.parse(
      await readJson(resolve(repositoryRoot, `data/geo/${layer}.geojson`)),
    )

    if (collection.features.length !== legacy.features.length) {
      throw new Error(`La capa temporal ${layer} no conserva el recuento vigente.`)
    }
    const parityFeatures = collection.features.map((feature, index) => {
      const legacyFeature = legacy.features[index]
      if (feature.id !== legacyFeature.id) {
        throw new Error(`La capa temporal ${layer} altera el ID u orden de ${legacyFeature.id}.`)
      }
      if (!geometriesEquivalent(feature.geometry as Geometry, legacyFeature.geometry as Geometry)) {
        throw new Error(`La capa temporal ${layer} altera la geometría de ${feature.id}; M10.1 exige paridad exacta.`)
      }
      const compatibleLegacyProperties = Object.fromEntries(
        Object.entries(feature.properties).filter(([key]) => key !== 'period_id' && key !== 'period_state'),
      )
      if (JSON.stringify(compatibleLegacyProperties) !== JSON.stringify(legacyFeature.properties)) {
        throw new Error(`La capa temporal ${layer} altera propiedades vigentes de ${feature.id}.`)
      }

      for (const sourceId of [
        ...feature.properties.geometry_source_refs,
        ...feature.properties.citations.map((citation) => citation.source_id),
        ...feature.properties.period_state.citations.map((citation) => citation.source_id),
      ]) {
        if (!sourceIds.has(sourceId)) {
          throw new Error(`${feature.id} referencia una fuente inexistente: ${sourceId}`)
        }
      }
      return { ...feature, geometry: legacyFeature.geometry }
    })

    return {
      layer,
      collection: compatibilityPeriodFeatureCollectionSchema.parse({
        ...collection,
        features: parityFeatures,
      }),
    }
  }),
)

for (const { layer, collection } of normalized) {
  const outputPath = resolve(repositoryRoot, `data/periods/${periodId}/${layer}.geojson`)
  await writeFile(outputPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8')
}

console.log(`Las tres capas ${periodId} mantienen la paridad M10.1 y han superado la validación temporal.`)
