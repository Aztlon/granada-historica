import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  featureCollectionSchema,
  sourceRegistrySchema,
  type HistoricalFeature,
} from '../src/data/schema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const dataFiles = [
  { path: 'data/geo/points.geojson', types: ['Point', 'MultiPoint'] },
  { path: 'data/geo/lines.geojson', types: ['LineString', 'MultiLineString'] },
  { path: 'data/geo/areas.geojson', types: ['Polygon', 'MultiPolygon'] },
] as const

async function readJson(relativePath: string): Promise<unknown> {
  const contents = await readFile(resolve(repositoryRoot, relativePath), 'utf8')
  try {
    return JSON.parse(contents)
  } catch (error) {
    throw new Error(`${relativePath} no contiene JSON válido.`, { cause: error })
  }
}

function formatIssues(path: string, issues: { path: PropertyKey[]; message: string }[]) {
  return issues
    .map((issue) => `  - ${path}:${issue.path.join('.') || '<raíz>'}: ${issue.message}`)
    .join('\n')
}

async function validate() {
  const errors: string[] = []
  const sourceResult = sourceRegistrySchema.safeParse(await readJson('data/sources.json'))
  if (!sourceResult.success) {
    errors.push(formatIssues('data/sources.json', sourceResult.error.issues))
  }

  const sources = sourceResult.success ? sourceResult.data : []
  const sourceIds = new Set<string>()
  for (const source of sources) {
    if (sourceIds.has(source.id)) errors.push(`  - Fuente duplicada: ${source.id}`)
    sourceIds.add(source.id)
  }

  const features: HistoricalFeature[] = []
  for (const file of dataFiles) {
    const result = featureCollectionSchema.safeParse(await readJson(file.path))
    if (!result.success) {
      errors.push(formatIssues(file.path, result.error.issues))
      continue
    }

    for (const feature of result.data.features) {
      if (!(file.types as readonly string[]).includes(feature.geometry.type)) {
        errors.push(`  - ${file.path}: ${feature.id} tiene geometría ${feature.geometry.type}.`)
      }
      features.push(feature)
    }
  }

  const featureIds = new Set<string>()
  for (const feature of features) {
    if (featureIds.has(feature.id)) errors.push(`  - Entidad duplicada: ${feature.id}`)
    featureIds.add(feature.id)

    const referencedSources = [
      ...feature.properties.geometry_source_refs,
      ...feature.properties.citations.map((citation) => citation.source_id),
    ]
    for (const sourceId of referencedSources) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`  - ${feature.id} referencia una fuente inexistente: ${sourceId}`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`La validación de datos ha fallado:\n${errors.join('\n')}`)
  }

  const publishableCount = features.filter(
    (feature) => feature.properties.publication_status === 'publishable',
  ).length
  console.log(
    `Datos válidos: ${features.length} entidades (${publishableCount} publicables) y ${sources.length} fuentes.`,
  )
}

validate().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
