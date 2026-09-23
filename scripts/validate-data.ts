import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  featureCollectionSchema,
  gazetteerSchema,
  geometryAuditSchema,
  sourceRegistrySchema,
  type HistoricalFeature,
} from '../src/data/schema'

import { auditSpatialRelationships } from '../src/data/spatialAudit'

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

  errors.push(...auditSpatialRelationships(features).map((error) => `  - ${error}`))

  const gazetteerResult = gazetteerSchema.safeParse(await readJson('data/gazetteer.json'))
  if (!gazetteerResult.success) {
    errors.push(formatIssues('data/gazetteer.json', gazetteerResult.error.issues))
  } else {
    const gazetteerIds = new Set<string>()
    const mappedFeatureIds = new Set<string>()

    for (const entry of gazetteerResult.data) {
      if (gazetteerIds.has(entry.id)) errors.push(`  - Entrada de nomenclátor duplicada: ${entry.id}`)
      gazetteerIds.add(entry.id)

      if (entry.feature_id) {
        if (!featureIds.has(entry.feature_id)) {
          errors.push(`  - ${entry.id} enlaza una entidad inexistente: ${entry.feature_id}`)
        }
        if (mappedFeatureIds.has(entry.feature_id)) {
          errors.push(`  - Entidad duplicada en el nomenclátor: ${entry.feature_id}`)
        }
        mappedFeatureIds.add(entry.feature_id)
      }

      for (const sourceId of new Set([
        ...entry.source_refs,
        ...entry.name_attestation.source_refs,
      ])) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - ${entry.id} referencia una fuente inexistente: ${sourceId}`)
        }
      }
    }

    for (const entry of gazetteerResult.data) {
      for (const relatedId of [...entry.parent_ids, ...entry.related_ids]) {
        if (!gazetteerIds.has(relatedId)) {
          errors.push(`  - ${entry.id} relaciona una entrada inexistente: ${relatedId}`)
        }
      }
    }

    for (const featureId of featureIds) {
      if (!mappedFeatureIds.has(featureId)) {
        errors.push(`  - Falta la entrada de nomenclátor para ${featureId}`)
      }
    }
  }

  const auditResult = geometryAuditSchema.safeParse(await readJson('data/geometry-audit.json'))
  if (!auditResult.success) {
    errors.push(formatIssues('data/geometry-audit.json', auditResult.error.issues))
  } else {
    const auditedFeatureIds = new Set<string>()
    for (const entry of auditResult.data) {
      if (auditedFeatureIds.has(entry.feature_id)) {
        errors.push(`  - Revisión geométrica duplicada: ${entry.feature_id}`)
      }
      auditedFeatureIds.add(entry.feature_id)

      if (!featureIds.has(entry.feature_id)) {
        errors.push(`  - La revisión geométrica referencia una entidad inexistente: ${entry.feature_id}`)
      }
      for (const sourceId of entry.geometry_source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - ${entry.feature_id} usa una fuente geométrica inexistente: ${sourceId}`)
        }
      }
    }

    for (const featureId of featureIds) {
      if (!auditedFeatureIds.has(featureId)) {
        errors.push(`  - Falta la revisión geométrica de ${featureId}`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`La validación de datos ha fallado:\n${errors.join('\n')}`)
  }

  const publishableCount = features.filter(
    (feature) => feature.properties.publication_status === 'publishable',
  ).length
  const verifiedCount = auditResult.success
    ? auditResult.data.filter((entry) => entry.status === 'verified').length
    : 0
  console.log(
    `Datos válidos: ${features.length} entidades (${publishableCount} publicables, ${verifiedCount} con geometría verificada), ${gazetteerResult.success ? gazetteerResult.data.length : 0} entradas de nomenclátor y ${sources.length} fuentes.`,
  )
}

validate().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
