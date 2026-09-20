import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { featureCollectionSchema, sourceRegistrySchema } from '../src/data/schema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const layers = ['points', 'lines', 'areas'] as const
const jsonPropertyNames = [
  'aliases',
  'modern_search_terms',
  'period',
  'confidence',
  'evidence_basis',
  'geometry_source_refs',
  'citations',
] as const

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown
}

const sources = sourceRegistrySchema.parse(
  await readJson(resolve(repositoryRoot, 'data/sources.json')),
)
const sourceIds = new Set(sources.map((source) => source.id))

function restoreJsonProperties(properties: Record<string, unknown>) {
  const restored = { ...properties }
  for (const propertyName of jsonPropertyNames) {
    const value = restored[propertyName]
    if (typeof value !== 'string') continue
    try {
      restored[propertyName] = JSON.parse(value) as unknown
    } catch (error) {
      throw new Error(`El campo ${propertyName} no contiene JSON válido.`, {
        cause: error,
      })
    }
  }
  return restored
}

const normalized = await Promise.all(
  layers.map(async (layer) => {
    const inputPath = resolve(repositoryRoot, `gis/export/${layer}.geojson`)
    const raw = await readJson(inputPath)
    if (!raw || typeof raw !== 'object' || !('features' in raw) || !Array.isArray(raw.features)) {
      throw new Error(`La exportación de ${layer} no es una colección GeoJSON.`)
    }

    const candidate = {
      type: 'FeatureCollection' as const,
      features: raw.features.map((feature) => {
        if (!feature || typeof feature !== 'object' || !('properties' in feature)) {
          throw new Error(`La capa ${layer} contiene una entidad sin propiedades.`)
        }
        const properties = feature.properties
        if (!properties || typeof properties !== 'object' || !('id' in properties)) {
          throw new Error(`La capa ${layer} contiene una entidad sin id.`)
        }
        const restoredProperties = restoreJsonProperties(
          properties as Record<string, unknown>,
        )
        return {
          ...feature,
          id: restoredProperties.id,
          properties: restoredProperties,
        }
      }),
    }

    const collection = featureCollectionSchema.parse(candidate)
    for (const feature of collection.features) {
      for (const sourceId of [
        ...feature.properties.geometry_source_refs,
        ...feature.properties.citations.map((citation) => citation.source_id),
      ]) {
        if (!sourceIds.has(sourceId)) {
          throw new Error(`${feature.id} referencia una fuente inexistente: ${sourceId}`)
        }
      }
    }

    return { layer, collection }
  }),
)

for (const { layer, collection } of normalized) {
  const outputPath = resolve(repositoryRoot, `data/geo/${layer}.geojson`)
  await writeFile(outputPath, `${JSON.stringify(collection, null, 2)}\n`, 'utf8')
}

console.log('Las tres capas se han normalizado y validado antes de actualizar los datos públicos.')
