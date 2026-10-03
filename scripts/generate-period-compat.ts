import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  featureCollectionSchema,
  gazetteerSchema,
  geometryAuditSchema,
  type GazetteerEntry,
  type HistoricalFeatureCollection,
} from '../src/data/schema'
import {
  compatibilityPeriodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  stableEntityCatalogSchema,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const periodId = 'c1492' as const

const layerFiles = ['points.geojson', 'lines.geojson', 'areas.geojson'] as const

async function readJson(relativePath: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(repositoryRoot, relativePath), 'utf8'))
}

function serialise(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function stableId(entry: GazetteerEntry) {
  return entry.feature_id ?? entry.id.replace(/^gaz\./, '')
}

function buildEntityCatalog(gazetteer: GazetteerEntry[]) {
  const stableIdByGazetteerId = new Map(
    gazetteer.map((entry) => [entry.id, stableId(entry)]),
  )

  return stableEntityCatalogSchema.parse({
    schema_version: 1,
    generated_from: 'data/gazetteer.json',
    entities: gazetteer.map((entry) => ({
      id: stableId(entry),
      gazetteer_id: entry.id,
      feature_id: entry.feature_id,
      canonical_name: entry.canonical_name,
      entity_type: entry.entity_type,
      inventory_status: entry.inventory_status,
      name_attestation: entry.name_attestation,
      survival: entry.survival,
      parent_ids: entry.parent_ids.map((id) => stableIdByGazetteerId.get(id) ?? id),
      related_ids: entry.related_ids.map((id) => stableIdByGazetteerId.get(id) ?? id),
      source_refs: entry.source_refs,
      notes: entry.notes,
    })),
  })
}

function buildPeriodCollection(collection: HistoricalFeatureCollection) {
  return compatibilityPeriodFeatureCollectionSchema.parse({
    type: 'FeatureCollection',
    period_id: periodId,
    features: collection.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        period_id: periodId,
        period_state: {
          period_id: periodId,
          presence: 'present',
          temporal_confidence: feature.properties.present_c1492,
          spatial_confidence: feature.properties.confidence.location,
          change_from_previous: 'not_applicable',
          physical_state: 'unknown',
          name: feature.properties.name,
          function: feature.properties.subtype,
          summary: feature.properties.context_1492,
          evidence_note: feature.properties.evidence_note,
          geometry_variant_id: `${periodId}.${feature.id}`,
          citations: feature.properties.citations,
        },
      },
    })),
  })
}

async function emit(relativePath: string, value: unknown) {
  const absolutePath = resolve(repositoryRoot, relativePath)
  const expected = serialise(value)

  if (checkOnly) {
    let actual: string
    try {
      actual = await readFile(absolutePath, 'utf8')
    } catch {
      throw new Error(`${relativePath} no existe; ejecuta npm run periods:generate.`)
    }
    if (actual !== expected) {
      throw new Error(`${relativePath} está desactualizado; ejecuta npm run periods:generate.`)
    }
    return
  }

  await mkdir(dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, expected, 'utf8')
}

async function generate() {
  const gazetteer = gazetteerSchema.parse(await readJson('data/gazetteer.json'))
  await emit('data/entities.json', buildEntityCatalog(gazetteer))

  let featureCount = 0
  for (const layerFile of layerFiles) {
    const sourcePath = `data/geo/${layerFile}`
    const source = featureCollectionSchema.parse(await readJson(sourcePath))
    const periodCollection = buildPeriodCollection(source)
    featureCount += periodCollection.features.length
    await emit(`data/periods/${periodId}/${layerFile}`, periodCollection)
  }

  const legacyAudit = geometryAuditSchema.parse(await readJson('data/geometry-audit.json'))
  const periodAudit = periodGeometryAuditSchema.parse(
    legacyAudit.map((entry) => ({ period_id: periodId, ...entry })),
  )
  await emit('data/geometry-audit-periods.json', periodAudit)

  console.log(
    checkOnly
      ? `Compatibilidad ${periodId} al día: ${featureCount} geometrías y ${gazetteer.length} entidades estables.`
      : `Compatibilidad ${periodId} generada: ${featureCount} geometrías y ${gazetteer.length} entidades estables.`,
  )
}

generate().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
