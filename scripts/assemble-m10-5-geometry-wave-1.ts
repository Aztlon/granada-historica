import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  featureCollectionSchema,
} from '../src/data/schema'
import {
  c1550M10_5GeometryWave1Schema,
  c1550M10_5SourceReview2Schema,
  c1550M10_5SourceReview3Schema,
  c1550M10_5SourceReviewSchema,
  c1550ResearchInventorySchema,
  c1550ResearchPackageManifestSchema,
  M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_1_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  type C1550M10_5GeometryWave1,
  type PeriodHistoricalFeature,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const updatedOn = '2026-10-02'
const wavePath = 'data/research/c1550/m10.5-geometry-wave-1.json'
const sourceReviewPaths = [
  'data/research/c1550/m10.5-source-review.json',
  'data/research/c1550/m10.5-source-review-2.json',
  'data/research/c1550/m10.5-source-review-3.json',
] as const

const layerPaths = {
  point: 'data/research/c1550/points.geojson',
  line: 'data/research/c1550/lines.geojson',
  area: 'data/research/c1550/areas.geojson',
} as const

const sourceLayerPaths = [
  'data/geo/points.geojson',
  'data/geo/lines.geojson',
  'data/geo/areas.geojson',
] as const

const referencePoints: Record<string, readonly [number, number]> = {
  'religious.santa-cruz-real': [-3.5945504, 37.1730264],
  'religious.san-jeronimo': [-3.604424, 37.179128],
  'religious.san-jose': [-3.59618, 37.17863],
  'religious.san-juan-reyes': [-3.59185, 37.1799194],
  'religious.san-matias': [-3.5965717, 37.173676],
  'religious.san-luis': [-3.591322, 37.185087],
}
const referenceMetadata: Record<string, {
  aliases: string[]
  modern_search_terms: string[]
  evidence_basis: PeriodHistoricalFeature['properties']['evidence_basis']
}> = {
  'religious.santa-cruz-real': {
    aliases: ['Convento de Santa Cruz la Real', 'Iglesia de Santo Domingo'],
    modern_search_terms: ['Plaza de Santo Domingo', 'Realejo', 'Santo Domingo Granada'],
    evidence_basis: ['surviving_fabric', 'documentary'],
  },
  'religious.san-jeronimo': {
    aliases: ['Monasterio de San Jerónimo', 'San Jerónimo'],
    modern_search_terms: ['Calle Rector López Argüeta', 'Monasterio de San Jerónimo Granada'],
    evidence_basis: ['surviving_fabric', 'documentary'],
  },
  'religious.san-jose': {
    aliases: ['Iglesia de San José', 'Antigua mezquita de al-Murabitin'],
    modern_search_terms: ['Calle San José', 'Placeta de San José', 'Albaicín'],
    evidence_basis: ['surviving_fabric', 'documentary'],
  },
  'religious.san-juan-reyes': {
    aliases: ['Iglesia de San Juan de los Reyes', 'Mezquita de los Conversos'],
    modern_search_terms: ['Calle San Juan de los Reyes', 'Albaicín'],
    evidence_basis: ['surviving_fabric', 'documentary'],
  },
  'religious.san-matias': {
    aliases: ['Iglesia Imperial de San Matías', 'Parroquia de San Matías'],
    modern_search_terms: ['Calle San Matías', 'Calle Coches de San Matías', 'Realejo'],
    evidence_basis: ['surviving_fabric', 'documentary'],
  },
  'religious.san-luis': {
    aliases: ['Iglesia de San Luis', 'Parroquia de San Luis'],
    modern_search_terms: ['Calle San Luis', 'Albaicín', 'Iglesia de San Luis Granada'],
    evidence_basis: ['surviving_fabric', 'documentary'],
  },
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(repositoryRoot, path), 'utf8'))
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(resolve(repositoryRoot, path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const sourceReview = c1550M10_5SourceReviewSchema.parse(await readJson(sourceReviewPaths[0]))
const sourceReview2 = c1550M10_5SourceReview2Schema.parse(await readJson(sourceReviewPaths[1]))
const sourceReview3 = c1550M10_5SourceReview3Schema.parse(await readJson(sourceReviewPaths[2]))
const inventory = c1550ResearchInventorySchema.parse(
  await readJson('data/research/c1550-inventory.json'),
)
const manifest = c1550ResearchPackageManifestSchema.parse(
  await readJson('data/research/c1550/manifest.json'),
)
const currentCollections = {
  point: periodFeatureCollectionSchema.parse(await readJson(layerPaths.point)),
  line: periodFeatureCollectionSchema.parse(await readJson(layerPaths.line)),
  area: periodFeatureCollectionSchema.parse(await readJson(layerPaths.area)),
}
const existingAudits = periodGeometryAuditSchema.parse(
  await readJson('data/research/c1550/geometry-audit.json'),
)

const publicFeatures = (
  await Promise.all(sourceLayerPaths.map(async (path) =>
    featureCollectionSchema.parse(await readJson(path)).features))
).flat()
const publicById = new Map(publicFeatures.map((feature) => [feature.id, feature]))
const sourceItemById = new Map(
  [...sourceReview.items, ...sourceReview2.items, ...sourceReview3.items]
    .map((item) => [item.feature_id, item]),
)
const candidateById = new Map(
  inventory.candidate_entities.map((candidate) => [candidate.proposed_id, candidate]),
)

const waveFeatures = M10_5_GEOMETRY_WAVE_1_FEATURE_IDS.map((featureId) => {
  const item = sourceItemById.get(featureId)
  if (!item) throw new Error(`Falta la ficha de fuentes para ${featureId}.`)
  const legacy = publicById.get(featureId)
  const candidate = candidateById.get(featureId)
  const geometry = legacy?.geometry ?? referenceGeometry(featureId)
  const metadata = legacy
    ? {
        aliases: legacy.properties.aliases,
        modern_search_terms: legacy.properties.modern_search_terms,
        category: legacy.properties.category,
        subtype: legacy.properties.subtype,
        evidence_basis: legacy.properties.evidence_basis,
        geometry_method: legacy.properties.geometry_method,
        geometry_source_refs: unique([
          ...legacy.properties.geometry_source_refs,
          ...item.geometry_decision.source_refs,
        ]),
        spatial_confidence: legacy.properties.confidence.location,
      }
    : {
        aliases: referenceMetadata[featureId]?.aliases ?? [],
        modern_search_terms: referenceMetadata[featureId]?.modern_search_terms ?? [],
        category: candidate?.category,
        subtype: candidate?.subtype,
        evidence_basis: referenceMetadata[featureId]?.evidence_basis,
        geometry_method: 'modern_reference_location' as const,
        geometry_source_refs: unique([
          ...item.geometry_decision.source_refs,
          'source.openstreetmap',
          'source.pnoa-andalucia-2022',
        ]),
        spatial_confidence: 'secure' as const,
      }
  if (!metadata.category || !metadata.subtype || !metadata.evidence_basis) {
    throw new Error(`Faltan metadatos espaciales para ${featureId}.`)
  }
  const citations = uniqueCitations(item.claims.flatMap((claim) => claim.citations))
  return {
    type: 'Feature',
    id: featureId,
    properties: {
      period_id: 'c1550',
      presence: item.period_assessment.presence,
      temporal_confidence: item.period_assessment.temporal_confidence,
      spatial_confidence: metadata.spatial_confidence,
      change_from_previous: item.period_assessment.change_from_1492,
      physical_state: item.period_assessment.physical_state,
      name: item.content.es.name,
      function: item.content.es.function,
      summary: item.content.es.summary,
      evidence_note: item.content.es.evidence_note,
      geometry_variant_id: `c1550.${featureId}`,
      citations,
      id: featureId,
      aliases: metadata.aliases,
      modern_search_terms: metadata.modern_search_terms,
      category: metadata.category,
      subtype: metadata.subtype,
      evidence_basis: metadata.evidence_basis,
      geometry_method: metadata.geometry_method,
      geometry_source_refs: metadata.geometry_source_refs,
      publication_status: 'research',
    },
    geometry,
  } satisfies PeriodHistoricalFeature
})

const waveFeatureById = new Map(waveFeatures.map((feature) => [feature.id, feature]))
const waveItems = M10_5_GEOMETRY_WAVE_1_FEATURE_IDS.map((featureId) => {
  const item = sourceItemById.get(featureId)
  const feature = waveFeatureById.get(featureId)
  if (!item || !feature) throw new Error(`Falta la promoción geométrica de ${featureId}.`)
  const representation = representationFor(feature.geometry.type, Boolean(referencePoints[featureId]))
  const contentItem = {
    feature_id: item.feature_id,
    cluster: item.cluster,
    content: item.content,
    claims: item.claims,
    relationships: item.relationships,
  }
  return {
    ...contentItem,
    readiness: 'ready_for_specialist_review' as const,
    geometry_review: geometryReviewFor(representation),
  }
})

const wave: C1550M10_5GeometryWave1 = c1550M10_5GeometryWave1Schema.parse({
  schema_version: 1,
  milestone: 'M10.5',
  wave: 'geometry-wave-1',
  period_id: 'c1550',
  status: 'ready_for_specialist_review',
  public_application_import: false,
  updated_on: updatedOn,
  scope_note: 'Primera ola geométrica de bajo riesgo: seis puntos de sitio, cuatro puntos de puertas conservadas, dos envolventes monumentales y cuatro ejes heredados; todo permanece privado y en revisión.',
  source_review_paths: sourceReviewPaths,
  feature_ids: M10_5_GEOMETRY_WAVE_1_FEATURE_IDS,
  items: waveItems,
  deferred_feature_ids: M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS,
})

const promotedIds = new Set<string>(M10_5_GEOMETRY_WAVE_1_FEATURE_IDS)
const nextCollections = {
  point: {
    ...currentCollections.point,
    features: upsertWaveFeatures(currentCollections.point.features, ['Point', 'MultiPoint']),
  },
  line: {
    ...currentCollections.line,
    features: upsertWaveFeatures(currentCollections.line.features, ['LineString', 'MultiLineString']),
  },
  area: {
    ...currentCollections.area,
    features: upsertWaveFeatures(currentCollections.area.features, ['Polygon', 'MultiPolygon']),
  },
}

const waveAudits = waveFeatures.map((feature) => ({
  period_id: 'c1550' as const,
  feature_id: feature.id,
  status: 'in_review' as const,
  reviewed_on: null,
  geometry_source_refs: feature.properties.geometry_source_refs,
  check_method: referencePoints[feature.id]
    ? 'Punto de referencia del sitio moderno contrastado con fuente institucional, OpenStreetMap y ortofoto; no se interpreta como huella edificada de 1550.'
    : 'Geometría pública heredada contrastada con la ficha de fuentes c. 1550; se conserva como hipótesis auditable y no como reconstrucción verificada.',
  notes: auditNoteFor(feature.id),
}))
const nextAudits = periodGeometryAuditSchema.parse([
  ...existingAudits.filter((audit) => !promotedIds.has(audit.feature_id)),
  ...waveAudits,
])

const includedFeatureIds = [
  ...nextCollections.point.features,
  ...nextCollections.line.features,
  ...nextCollections.area.features,
].map((feature) => feature.id)
const nextManifest = c1550ResearchPackageManifestSchema.parse({
  ...manifest,
  updated_on: updatedOn,
  scope_note: `Paquete GIS privado M10.5 con la primera ola geométrica ensamblada y ${includedFeatureIds.length} geometrías preservadas. Todas son candidatas internas en revisión y ninguna se considera verificada o publicable.`,
  layers: manifest.layers.map((layer) => ({
    ...layer,
    feature_count: nextCollections[layer.geometry_type].features.length,
  })),
  geometry_wave_1_path: wavePath,
  included_feature_ids: includedFeatureIds,
})

await Promise.all([
  writeJson(wavePath, wave),
  writeJson(layerPaths.point, nextCollections.point),
  writeJson(layerPaths.line, nextCollections.line),
  writeJson(layerPaths.area, nextCollections.area),
  writeJson('data/research/c1550/geometry-audit.json', nextAudits),
  writeJson('data/research/c1550/manifest.json', nextManifest),
])

console.log(
  `Ola geométrica M10.5.1 ensamblada: ${waveFeatures.length} geometrías nuevas; paquete c. 1550 con ${includedFeatureIds.length} geometrías (${nextCollections.point.features.length} puntos, ${nextCollections.line.features.length} líneas y ${nextCollections.area.features.length} áreas).`,
)

function referenceGeometry(featureId: string): PeriodHistoricalFeature['geometry'] {
  const coordinates = referencePoints[featureId]
  if (!coordinates) throw new Error(`No existe geometría pública ni punto de referencia para ${featureId}.`)
  return { type: 'Point', coordinates: [...coordinates] }
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

function uniqueCitations(
  citations: PeriodHistoricalFeature['properties']['citations'],
): PeriodHistoricalFeature['properties']['citations'] {
  return [...new Map(citations.map((citation) => [
    `${citation.source_id}|${citation.locator}|${citation.supports}`,
    citation,
  ])).values()]
}

function representationFor(
  geometryType: PeriodHistoricalFeature['geometry']['type'],
  isNewReferencePoint: boolean,
): C1550M10_5GeometryWave1['items'][number]['geometry_review']['representation'] {
  if (isNewReferencePoint) return 'reference_point'
  if (geometryType === 'Point' || geometryType === 'MultiPoint') return 'retained_site_point'
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') return 'retained_line'
  return 'retained_area'
}

function geometryReviewFor(
  representation: C1550M10_5GeometryWave1['items'][number]['geometry_review']['representation'],
): C1550M10_5GeometryWave1['items'][number]['geometry_review'] {
  if (representation === 'reference_point') {
    return {
      representation,
      audit_status: 'in_review',
      decision: {
        es: 'Se incorpora un punto del sitio moderno para hacer visible la entidad sin dibujar una planta arquitectónica no demostrada para 1550.',
        en: 'A modern site point is added to make the entity visible without drawing an architectural plan not demonstrated for 1550.',
      },
      overlap_resolution: {
        es: 'El punto identifica el conjunto y no resuelve iglesia, claustros, dependencias, parcela histórica ni contactos con edificios vecinos.',
        en: 'The point identifies the complex and does not resolve church, cloisters, dependencies, historical parcel or contacts with neighbouring buildings.',
      },
    }
  }
  if (representation === 'retained_site_point') {
    return {
      representation,
      audit_status: 'in_review',
      decision: {
        es: 'Se conserva el punto heredado como localizador del acceso superviviente, no como restitución del complejo fortificado hacia 1550.',
        en: 'The inherited point is retained as a locator for the surviving entrance, not as a reconstruction of the fortified complex around 1550.',
      },
      overlap_resolution: {
        es: 'El punto no afirma la extensión de torres, patios, barbacanas, ramales de muralla ni fases posteriores hoy perdidas o alteradas.',
        en: 'The point does not assert the extent of towers, courts, barbicans, wall branches or later phases now lost or altered.',
      },
    }
  }
  if (representation === 'retained_area') {
    return {
      representation,
      audit_status: 'in_review',
      decision: {
        es: 'Se retiene la envolvente del monumento conservado como referencia de sitio auditable, sin equipararla automáticamente con su fábrica exacta en 1550.',
        en: 'The surviving monument envelope is retained as an auditable site reference without automatically equating it with its exact fabric in 1550.',
      },
      overlap_resolution: {
        es: 'La envolvente incluye transformaciones y restauraciones posteriores; las fases internas permanecen sin segmentar hasta una lectura arquitectónica específica.',
        en: 'The envelope includes later transformations and restorations; internal phases remain unsegmented pending a specific architectural reading.',
      },
    }
  }
  return {
    representation,
    audit_status: 'in_review',
    decision: {
      es: 'Se importa el eje heredado como hipótesis de trazado revisable porque las fuentes sostienen la continuidad del elemento, no cada vértice de la línea.',
      en: 'The inherited axis is imported as a reviewable alignment hypothesis because the sources support continuity of the element, not every line vertex.',
    },
    overlap_resolution: {
      es: 'La línea no afirma anchura, márgenes, tablero, cubrimientos ni rectificaciones exactas hacia 1550 y conserva esas cuestiones para revisión geométrica.',
      en: 'The line does not assert exact width, banks, deck, vaulting or realignments around 1550 and leaves those questions for geometric review.',
    },
  }
}

function auditNoteFor(featureId: string): string {
  if (referencePoints[featureId]) {
    return 'Representación deliberadamente puntual: localiza el sitio actual y no reconstruye la huella, la parcela ni la fase construida hacia 1550.'
  }
  if (['commerce.corral-carbon', 'water.banuelo'].includes(featureId)) {
    return 'Envolvente conservada reutilizada como referencia de sitio; requiere lectura de fases antes de interpretar su perímetro como fábrica exacta de 1550.'
  }
  if (featureId.startsWith('gate.')) {
    return 'Punto del acceso conservado; no reconstruye el recinto defensivo completo ni las estructuras desaparecidas hacia 1550.'
  }
  return 'Eje heredado para revisión: sostiene localización general y continuidad, pero no prueba cada tramo, anchura o contacto en 1550.'
}

function upsertWaveFeatures(
  existingFeatures: PeriodHistoricalFeature[],
  acceptedTypes: PeriodHistoricalFeature['geometry']['type'][],
): PeriodHistoricalFeature[] {
  return [
    ...existingFeatures.filter((feature) => !promotedIds.has(feature.id)),
    ...waveFeatures.filter((feature) => acceptedTypes.includes(feature.geometry.type)),
  ]
}
