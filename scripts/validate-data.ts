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
import { featureTranslationsSchema, pilotRouteSchema } from '../src/data/pilotSchema'
import {
  entityPresentationRegistrySchema,
  periodTitleDecisionRegistrySchema,
} from '../src/data/entityPresentation'
import {
  c1550ResearchInventorySchema,
  c1550ResearchPackageManifestSchema,
  c1550M10_5CandidateSchema,
  c1550M10_5EvidencePreparationSchema,
  c1550M10_5GeometryWave1Schema,
  c1550M10_5GeometryWave2Schema,
  c1550M10_5SourceReview2Schema,
  c1550M10_5SourceReview3Schema,
  c1550M10_5SourceReview4Schema,
  c1550M10_5SourceReviewSchema,
  c1550VerticalSliceReviewSchema,
  compatibilityPeriodFeatureCollectionSchema,
  M10_3_FEATURE_IDS,
  M10_5_FEATURE_IDS,
  M10_5_GEOMETRY_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_1_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  periodRegistrySchema,
  stableEntityCatalogSchema,
  type CompatibilityPeriodFeature,
  type PeriodHistoricalFeature,
} from '../src/data/temporalSchema'

import { auditSpatialRelationships } from '../src/data/spatialAudit'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const dataFiles = [
  { path: 'data/geo/points.geojson', types: ['Point', 'MultiPoint'] },
  { path: 'data/geo/lines.geojson', types: ['LineString', 'MultiLineString'] },
  { path: 'data/geo/areas.geojson', types: ['Polygon', 'MultiPolygon'] },
] as const

const compatibilityDataFiles = dataFiles.map((file) => ({
  ...file,
  path: file.path.replace('data/geo/', 'data/periods/c1492/'),
}))

const c1550ResearchDataFiles = [
  { path: 'data/research/c1550/points.geojson', geometryType: 'point', types: ['Point', 'MultiPoint'] },
  { path: 'data/research/c1550/lines.geojson', geometryType: 'line', types: ['LineString', 'MultiLineString'] },
  { path: 'data/research/c1550/areas.geojson', geometryType: 'area', types: ['Polygon', 'MultiPolygon'] },
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
  const periodResult = periodRegistrySchema.safeParse(await readJson('data/periods.json'))
  if (!periodResult.success) {
    errors.push(formatIssues('data/periods.json', periodResult.error.issues))
  }

  const periods = periodResult.success ? periodResult.data.periods : []
  const periodIds = new Set<string>()
  for (const period of periods) {
    if (periodIds.has(period.id)) errors.push(`  - Periodo duplicado: ${period.id}`)
    periodIds.add(period.id)
  }
  if (!periods.some((period) => period.id === 'c1492' && period.status === 'published')) {
    errors.push('  - El registro debe conservar c1492 como periodo publicado.')
  }
  if (!periods.some((period) => period.id === 'c1550' && period.status === 'research')) {
    errors.push('  - El registro debe conservar c1550 como periodo de investigación hasta su revisión.')
  }

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

  const entityCatalogResult = stableEntityCatalogSchema.safeParse(
    await readJson('data/entities.json'),
  )
  if (!entityCatalogResult.success) {
    errors.push(formatIssues('data/entities.json', entityCatalogResult.error.issues))
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
  const featureById = new Map<string, HistoricalFeature>()
  for (const feature of features) {
    if (featureIds.has(feature.id)) errors.push(`  - Entidad duplicada: ${feature.id}`)
    featureIds.add(feature.id)
    featureById.set(feature.id, feature)

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

  const compatibilityFeatures: CompatibilityPeriodFeature[] = []
  for (const file of compatibilityDataFiles) {
    const result = compatibilityPeriodFeatureCollectionSchema.safeParse(await readJson(file.path))
    if (!result.success) {
      errors.push(formatIssues(file.path, result.error.issues))
      continue
    }

    if (result.data.period_id !== 'c1492') {
      errors.push(`  - ${file.path} debe declarar el periodo c1492.`)
    }
    for (const feature of result.data.features) {
      if (!(file.types as readonly string[]).includes(feature.geometry.type)) {
        errors.push(`  - ${file.path}: ${feature.id} tiene geometría ${feature.geometry.type}.`)
      }
      compatibilityFeatures.push(feature)
    }
  }

  const compatibilityIds = new Set<string>()
  for (const feature of compatibilityFeatures) {
    if (compatibilityIds.has(feature.id)) {
      errors.push(`  - Entidad c1492 duplicada: ${feature.id}`)
    }
    compatibilityIds.add(feature.id)

    const legacyFeature = featureById.get(feature.id)
    if (!legacyFeature) {
      errors.push(`  - La compatibilidad c1492 contiene una entidad inexistente: ${feature.id}`)
      continue
    }

    if (JSON.stringify(feature.geometry) !== JSON.stringify(legacyFeature.geometry)) {
      errors.push(`  - La geometría c1492 de ${feature.id} no es idéntica a la vigente.`)
    }

    const periodState = feature.properties.period_state
    const legacyProperties = Object.fromEntries(
      Object.entries(feature.properties).filter(([key]) => key !== 'period_id' && key !== 'period_state'),
    )
    if (JSON.stringify(legacyProperties) !== JSON.stringify(legacyFeature.properties)) {
      errors.push(`  - Las propiedades c1492 de ${feature.id} alteran etiquetas, búsqueda, citas o publicación vigentes.`)
    }
    if (
      periodState.temporal_confidence !== legacyFeature.properties.present_c1492
      || periodState.spatial_confidence !== legacyFeature.properties.confidence.location
      || JSON.stringify(periodState.citations) !== JSON.stringify(legacyFeature.properties.citations)
    ) {
      errors.push(`  - El estado temporal c1492 de ${feature.id} no conserva confianza y citas vigentes.`)
    }
  }
  for (const featureId of featureIds) {
    if (!compatibilityIds.has(featureId)) {
      errors.push(`  - Falta la entidad ${featureId} en la compatibilidad c1492.`)
    }
  }

  const c1550CandidateIds = new Set<string>()
  const c1550Result = c1550ResearchInventorySchema.safeParse(
    await readJson('data/research/c1550-inventory.json'),
  )
  if (!c1550Result.success) {
    errors.push(formatIssues('data/research/c1550-inventory.json', c1550Result.error.issues))
  } else {
    if (!periodIds.has(c1550Result.data.period_id)) {
      errors.push(`  - El inventario c. 1550 referencia un periodo inexistente: ${c1550Result.data.period_id}`)
    }

    const triagedFeatureIds = new Set<string>()
    for (const entry of c1550Result.data.existing_entity_triage) {
      if (triagedFeatureIds.has(entry.feature_id)) {
        errors.push(`  - Entidad duplicada en el triaje c. 1550: ${entry.feature_id}`)
      }
      triagedFeatureIds.add(entry.feature_id)
      if (!featureIds.has(entry.feature_id)) {
        errors.push(`  - El triaje c. 1550 referencia una entidad inexistente: ${entry.feature_id}`)
      }
      if (entry.research_status === 'ready_for_review' && entry.source_refs.length === 0) {
        errors.push(`  - ${entry.feature_id} no puede estar listo para revisión sin fuentes iniciales.`)
      }
      for (const sourceId of entry.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - ${entry.feature_id} referencia una fuente c. 1550 inexistente: ${sourceId}`)
        }
      }
    }
    for (const featureId of featureIds) {
      if (!triagedFeatureIds.has(featureId)) {
        errors.push(`  - Falta el triaje c. 1550 de ${featureId}`)
      }
    }

    for (const candidate of c1550Result.data.candidate_entities) {
      if (c1550CandidateIds.has(candidate.proposed_id)) {
        errors.push(`  - Candidato c. 1550 duplicado: ${candidate.proposed_id}`)
      }
      c1550CandidateIds.add(candidate.proposed_id)
      if (featureIds.has(candidate.proposed_id)) {
        errors.push(`  - El candidato c. 1550 ya existe como entidad pública: ${candidate.proposed_id}`)
      }
      for (const sourceId of candidate.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - ${candidate.proposed_id} referencia una fuente c. 1550 inexistente: ${sourceId}`)
        }
      }
    }

    const themeIds = new Set<string>()
    for (const theme of c1550Result.data.change_themes) {
      if (themeIds.has(theme.id)) errors.push(`  - Tema c. 1550 duplicado: ${theme.id}`)
      themeIds.add(theme.id)
      for (const sourceId of theme.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - ${theme.id} referencia una fuente c. 1550 inexistente: ${sourceId}`)
        }
      }
    }
  }

  const c1550ManifestResult = c1550ResearchPackageManifestSchema.safeParse(
    await readJson('data/research/c1550/manifest.json'),
  )
  if (!c1550ManifestResult.success) {
    errors.push(formatIssues('data/research/c1550/manifest.json', c1550ManifestResult.error.issues))
  }

  const c1550ReviewResult = c1550VerticalSliceReviewSchema.safeParse(
    await readJson('data/research/c1550/m10.3-review.json'),
  )
  if (!c1550ReviewResult.success) {
    errors.push(formatIssues('data/research/c1550/m10.3-review.json', c1550ReviewResult.error.issues))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.review_path !== 'data/research/c1550/m10.3-review.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar el dossier M10.3.')
  }

  const c1550M10_5Result = c1550M10_5CandidateSchema.safeParse(
    await readJson('data/research/c1550/m10.5-candidate.json'),
  )
  if (!c1550M10_5Result.success) {
    errors.push(formatIssues('data/research/c1550/m10.5-candidate.json', c1550M10_5Result.error.issues))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.candidate_path !== 'data/research/c1550/m10.5-candidate.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar el candidato M10.5.')
  }

  const publicPresentationResult = entityPresentationRegistrySchema.safeParse(
    await readJson('data/entity-presentations.json'),
  )
  if (!publicPresentationResult.success) {
    errors.push(formatIssues('data/entity-presentations.json', publicPresentationResult.error.issues))
  } else if (publicPresentationResult.data.scope !== 'public') {
    errors.push('  - El registro de presentación público debe declarar scope public.')
  }

  const researchPresentationResult = entityPresentationRegistrySchema.safeParse(
    await readJson('data/research/c1550/entity-presentations.json'),
  )
  if (!researchPresentationResult.success) {
    errors.push(formatIssues(
      'data/research/c1550/entity-presentations.json',
      researchPresentationResult.error.issues,
    ))
  } else if (researchPresentationResult.data.scope !== 'research_c1550') {
    errors.push('  - El anexo de presentación c. 1550 debe declarar scope research_c1550.')
  }

  const titleDecisionResult = periodTitleDecisionRegistrySchema.safeParse(
    await readJson('data/research/c1550/period-title-decisions.json'),
  )
  if (!titleDecisionResult.success) {
    errors.push(formatIssues(
      'data/research/c1550/period-title-decisions.json',
      titleDecisionResult.error.issues,
    ))
  }

  const c1550M10_5SourceReviewResult = c1550M10_5SourceReviewSchema.safeParse(
    await readJson('data/research/c1550/m10.5-source-review.json'),
  )
  if (!c1550M10_5SourceReviewResult.success) {
    errors.push(formatIssues('data/research/c1550/m10.5-source-review.json', c1550M10_5SourceReviewResult.error.issues))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.source_review_path !== 'data/research/c1550/m10.5-source-review.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar el tramo de fuentes M10.5.')
  }

  const c1550M10_5SourceReview2Result = c1550M10_5SourceReview2Schema.safeParse(
    await readJson('data/research/c1550/m10.5-source-review-2.json'),
  )
  if (!c1550M10_5SourceReview2Result.success) {
    errors.push(formatIssues(
      'data/research/c1550/m10.5-source-review-2.json',
      c1550M10_5SourceReview2Result.error.issues,
    ))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.source_review_2_path
      !== 'data/research/c1550/m10.5-source-review-2.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar el segundo tramo de fuentes M10.5.')
  }

  const c1550M10_5SourceReview3Result = c1550M10_5SourceReview3Schema.safeParse(
    await readJson('data/research/c1550/m10.5-source-review-3.json'),
  )
  if (!c1550M10_5SourceReview3Result.success) {
    errors.push(formatIssues(
      'data/research/c1550/m10.5-source-review-3.json',
      c1550M10_5SourceReview3Result.error.issues,
    ))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.source_review_3_path
      !== 'data/research/c1550/m10.5-source-review-3.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar el tercer tramo de fuentes M10.5.')
  }

  const c1550M10_5SourceReview4Result = c1550M10_5SourceReview4Schema.safeParse(
    await readJson('data/research/c1550/m10.5-source-review-4.json'),
  )
  if (!c1550M10_5SourceReview4Result.success) {
    errors.push(formatIssues(
      'data/research/c1550/m10.5-source-review-4.json',
      c1550M10_5SourceReview4Result.error.issues,
    ))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.source_review_4_path
      !== 'data/research/c1550/m10.5-source-review-4.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar el cuarto tramo de fuentes M10.5.')
  }

  const c1550M10_5GeometryWave1Result = c1550M10_5GeometryWave1Schema.safeParse(
    await readJson('data/research/c1550/m10.5-geometry-wave-1.json'),
  )
  if (!c1550M10_5GeometryWave1Result.success) {
    errors.push(formatIssues(
      'data/research/c1550/m10.5-geometry-wave-1.json',
      c1550M10_5GeometryWave1Result.error.issues,
    ))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.geometry_wave_1_path
      !== 'data/research/c1550/m10.5-geometry-wave-1.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar la primera ola geométrica M10.5.')
  }

  const c1550M10_5GeometryWave2Result = c1550M10_5GeometryWave2Schema.safeParse(
    await readJson('data/research/c1550/m10.5-geometry-wave-2.json'),
  )
  if (!c1550M10_5GeometryWave2Result.success) {
    errors.push(formatIssues(
      'data/research/c1550/m10.5-geometry-wave-2.json',
      c1550M10_5GeometryWave2Result.error.issues,
    ))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.geometry_wave_2_path
      !== 'data/research/c1550/m10.5-geometry-wave-2.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar la segunda ola geométrica M10.5.')
  }

  const c1550M10_5EvidencePreparationResult = c1550M10_5EvidencePreparationSchema.safeParse(
    await readJson('data/research/c1550/m10.5-evidence-preparation.json'),
  )
  if (!c1550M10_5EvidencePreparationResult.success) {
    errors.push(formatIssues(
      'data/research/c1550/m10.5-evidence-preparation.json',
      c1550M10_5EvidencePreparationResult.error.issues,
    ))
  } else if (
    c1550ManifestResult.success
    && c1550ManifestResult.data.evidence_preparation_path
      !== 'data/research/c1550/m10.5-evidence-preparation.json'
  ) {
    errors.push('  - El manifiesto c. 1550 debe enlazar la preparación de evidencia M10.5.')
  }

  const c1550ResearchFeatures: PeriodHistoricalFeature[] = []
  for (const file of c1550ResearchDataFiles) {
    const result = periodFeatureCollectionSchema.safeParse(await readJson(file.path))
    if (!result.success) {
      errors.push(formatIssues(file.path, result.error.issues))
      continue
    }
    if (result.data.period_id !== 'c1550') {
      errors.push(`  - ${file.path} debe pertenecer a c1550.`)
    }
    if (c1550ManifestResult.success) {
      const layerManifest = c1550ManifestResult.data.layers.find(
        (layer) => layer.path === file.path && layer.geometry_type === file.geometryType,
      )
      if (!layerManifest) errors.push(`  - El manifiesto c. 1550 no registra ${file.path}.`)
      else if (layerManifest.feature_count !== result.data.features.length) {
        errors.push(`  - El recuento del manifiesto para ${file.path} no coincide con la capa.`)
      }
    }
    for (const feature of result.data.features) {
      if (!(file.types as readonly string[]).includes(feature.geometry.type)) {
        errors.push(`  - ${file.path}: ${feature.id} tiene geometría ${feature.geometry.type}.`)
      }
      c1550ResearchFeatures.push(feature)
    }
  }

  const c1550ResearchIds = new Set<string>()
  const geometryVariantIds = new Set<string>()
  const candidateById = new Map(
    c1550Result.success
      ? c1550Result.data.candidate_entities.map((candidate) => [candidate.proposed_id, candidate])
      : [],
  )
  const triageById = new Map(
    c1550Result.success
      ? c1550Result.data.existing_entity_triage.map((entry) => [entry.feature_id, entry])
      : [],
  )
  const m10_5ReviewById = new Map(
    c1550M10_5Result.success
      ? c1550M10_5Result.data.items.map((item) => [item.feature_id, item])
      : [],
  )

  const publicPresentations = publicPresentationResult.success
    ? publicPresentationResult.data.presentations
    : []
  const researchPresentations = researchPresentationResult.success
    ? researchPresentationResult.data.presentations
    : []
  const presentationIds = new Set<string>()
  for (const presentation of [...publicPresentations, ...researchPresentations]) {
    if (presentationIds.has(presentation.entity_id)) {
      errors.push(`  - Presentación de entidad duplicada: ${presentation.entity_id}`)
    }
    presentationIds.add(presentation.entity_id)
    for (const sourceId of presentation.source_refs) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`  - ${presentation.entity_id} referencia una fuente de presentación inexistente: ${sourceId}`)
      }
    }
  }
  const publicPresentationIds = new Set(publicPresentations.map(({ entity_id }) => entity_id))
  for (const featureId of featureIds) {
    if (!publicPresentationIds.has(featureId)) {
      errors.push(`  - Falta la presentación pública de ${featureId}.`)
    }
  }
  for (const featureId of publicPresentationIds) {
    if (!featureIds.has(featureId)) {
      errors.push(`  - El registro público filtra una entidad no publicada: ${featureId}.`)
    }
  }
  const expectedResearchPresentationIds = new Set(
    M10_5_FEATURE_IDS.filter((featureId) => !featureIds.has(featureId)),
  )
  const researchPresentationIds = new Set(researchPresentations.map(({ entity_id }) => entity_id))
  for (const featureId of expectedResearchPresentationIds) {
    if (!researchPresentationIds.has(featureId)) {
      errors.push(`  - Falta la presentación de investigación de ${featureId}.`)
    }
  }
  for (const featureId of researchPresentationIds) {
    if (!expectedResearchPresentationIds.has(featureId as (typeof M10_5_FEATURE_IDS)[number])) {
      errors.push(`  - El anexo de presentación incluye una entidad fuera del candidato M10.5: ${featureId}.`)
    }
  }

  if (titleDecisionResult.success) {
    const presentationsById = new Map(
      [...publicPresentations, ...researchPresentations].map((presentation) => [presentation.entity_id, presentation]),
    )
    const titleDecisionIds = new Set<string>()
    for (const decision of titleDecisionResult.data.decisions) {
      if (titleDecisionIds.has(decision.feature_id)) {
        errors.push(`  - Decisión de título c. 1550 duplicada: ${decision.feature_id}.`)
      }
      titleDecisionIds.add(decision.feature_id)
      const presentation = presentationsById.get(decision.feature_id)
      const reviewItem = m10_5ReviewById.get(decision.feature_id)
      const periodFeature = c1550ResearchFeatures.find(({ id }) => id === decision.feature_id)
      if (!presentation) {
        errors.push(`  - La decisión de título de ${decision.feature_id} no tiene presentación de entidad.`)
      } else if (
        decision.usage === 'canonical'
        && decision.title.es !== presentation.canonical_name.es
      ) {
        errors.push(`  - El título canónico de ${decision.feature_id} no coincide con su presentación estable.`)
      }
      if (
        !reviewItem
        || reviewItem.content.es.name !== decision.title.es
        || reviewItem.content.en.name !== decision.title.en
      ) {
        errors.push(`  - La decisión de título de ${decision.feature_id} no coincide con el contenido M10.5.`)
      }
      if (!periodFeature || periodFeature.properties.name !== decision.title.es) {
        errors.push(`  - La geometría c. 1550 de ${decision.feature_id} no usa el título de periodo aprobado.`)
      }
      for (const sourceId of decision.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - La decisión de título de ${decision.feature_id} referencia una fuente inexistente: ${sourceId}.`)
        }
      }
    }
    for (const featureId of M10_5_FEATURE_IDS) {
      if (!titleDecisionIds.has(featureId)) {
        errors.push(`  - Falta la decisión de título c. 1550 de ${featureId}.`)
      }
    }
    if (titleDecisionIds.size !== M10_5_FEATURE_IDS.length) {
      errors.push('  - Las decisiones de título c. 1550 deben cubrir exactamente las 39 entidades M10.5.')
    }
  }

  for (const feature of c1550ResearchFeatures) {
    if (c1550ResearchIds.has(feature.id)) errors.push(`  - Geometría de investigación c. 1550 duplicada: ${feature.id}`)
    c1550ResearchIds.add(feature.id)

    if (feature.properties.period_id !== 'c1550') {
      errors.push(`  - ${feature.id} declara un periodo distinto de c1550.`)
    }
    const m10_5ReviewItem = m10_5ReviewById.get(feature.id)
    const isApprovedM10_5Feature = c1550M10_5Result.success
      && c1550M10_5Result.data.status === 'release_candidate'
      && m10_5ReviewItem?.readiness === 'reviewed'
    const expectedPublicationStatus = isApprovedM10_5Feature ? 'reviewed' : 'research'
    if (feature.properties.publication_status !== expectedPublicationStatus) {
      errors.push(`  - ${feature.id} debe usar publication_status ${expectedPublicationStatus} según el candidato M10.5.`)
    }
    const variantId = feature.properties.geometry_variant_id
    if (!variantId || !variantId.startsWith('c1550.')) {
      errors.push(`  - ${feature.id} debe declarar una variante geométrica c1550.`)
    } else if (geometryVariantIds.has(variantId)) {
      errors.push(`  - Variante geométrica c. 1550 duplicada: ${variantId}`)
    } else {
      geometryVariantIds.add(variantId)
    }

    const candidate = candidateById.get(feature.id)
    if (candidate) {
      if (
        feature.properties.presence !== candidate.presence
        || feature.properties.temporal_confidence !== candidate.temporal_confidence
        || feature.properties.change_from_previous !== candidate.change_from_1492
        || feature.properties.physical_state !== candidate.physical_state
        || feature.properties.category !== candidate.category
        || feature.properties.subtype !== candidate.subtype
      ) {
        errors.push(`  - El estado geométrico de ${feature.id} no coincide con el inventario c. 1550.`)
      }
    } else if (!featureIds.has(feature.id) || !triageById.has(feature.id)) {
      errors.push(`  - ${feature.id} no pertenece al inventario nuevo ni al triaje existente de c. 1550.`)
    }

    for (const sourceId of [
      ...feature.properties.geometry_source_refs,
      ...feature.properties.citations.map((citation) => citation.source_id),
    ]) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`  - ${feature.id} referencia una fuente c. 1550 inexistente: ${sourceId}`)
      }
    }
  }

  if (c1550ReviewResult.success) {
    const knownResearchIds = new Set([...featureIds, ...c1550CandidateIds])
    for (const item of c1550ReviewResult.data.items) {
      const feature = c1550ResearchFeatures.find((candidate) => candidate.id === item.feature_id)
      if (!feature) {
        errors.push(`  - El dossier M10.3 no tiene geometría c. 1550 para ${item.feature_id}.`)
        continue
      }
      for (const field of ['name', 'function', 'summary', 'evidence_note'] as const) {
        if (feature.properties[field] !== item.content.es[field]) {
          errors.push(`  - ${item.feature_id} no coincide con el contenido español M10.3 en ${field}.`)
        }
      }
      for (const claim of item.claims) {
        for (const citation of claim.citations) {
          if (!sourceIds.has(citation.source_id)) {
            errors.push(`  - ${claim.claim_id} referencia una fuente inexistente: ${citation.source_id}`)
          }
        }
      }
      for (const relationship of item.relationships) {
        if (!knownResearchIds.has(relationship.target_id)) {
          errors.push(`  - ${item.feature_id} se relaciona con una entidad desconocida: ${relationship.target_id}`)
        }
      }
      const inventoryRecord = candidateById.get(item.feature_id) ?? triageById.get(item.feature_id)
      const expectedResearchStatus = item.readiness === 'reviewed' ? 'reviewed' : 'ready_for_review'
      if (!inventoryRecord || inventoryRecord.research_status !== expectedResearchStatus) {
        errors.push(`  - ${item.feature_id} debe figurar como ${expectedResearchStatus} en el inventario c. 1550.`)
      }
    }
    const dossierIds = new Set(c1550ReviewResult.data.feature_ids)
    if (M10_3_FEATURE_IDS.some((featureId) => !dossierIds.has(featureId))) {
      errors.push('  - El dossier M10.3 no contiene las ocho entidades del corte vertical.')
    }
  }


  if (c1550M10_5Result.success) {
    const knownResearchIds = new Set([...featureIds, ...c1550CandidateIds])
    const candidateIds = new Set(c1550M10_5Result.data.feature_ids)
    if (M10_5_FEATURE_IDS.some((featureId) => !candidateIds.has(featureId))) {
      errors.push('  - El candidato M10.5 no contiene exactamente las 39 entidades previstas.')
    }
    for (const item of c1550M10_5Result.data.items) {
      const feature = c1550ResearchFeatures.find((entry) => entry.id === item.feature_id)
      if (!feature) {
        errors.push(`  - El candidato M10.5 no tiene geometría c. 1550 para ${item.feature_id}.`)
        continue
      }
      if (M10_3_FEATURE_IDS.includes(item.feature_id as (typeof M10_3_FEATURE_IDS)[number])) {
        for (const field of ['name', 'function', 'summary', 'evidence_note'] as const) {
          if (feature.properties[field] !== item.content.es[field]) {
            errors.push(`  - ${item.feature_id} no conserva el contenido español revisado en M10.3 para ${field}.`)
          }
        }
      }
      for (const claim of item.claims) {
        for (const citation of claim.citations) {
          if (!sourceIds.has(citation.source_id)) {
            errors.push(`  - ${claim.claim_id} referencia una fuente inexistente: ${citation.source_id}`)
          }
        }
      }
      for (const relationship of item.relationships) {
        if (!knownResearchIds.has(relationship.target_id)) {
          errors.push(`  - ${item.feature_id} se relaciona con una entidad desconocida: ${relationship.target_id}`)
        }
      }
    }
    for (const record of [...c1550M10_5Result.data.themes, ...c1550M10_5Result.data.analytical_layers]) {
      for (const sourceId of record.source_refs) {
        if (!sourceIds.has(sourceId)) errors.push(`  - M10.5 referencia una fuente inexistente: ${sourceId}`)
      }
    }
    if (c1550Result.success) {
      const requiredDecisionIds = new Set([
        ...c1550Result.data.existing_entity_triage,
        ...c1550Result.data.candidate_entities.map((entry) => ({ ...entry, feature_id: entry.proposed_id })),
      ].filter((entry) => entry.priority !== 'defer').map((entry) => entry.feature_id))
      const decisionIds = new Set(c1550M10_5Result.data.inventory_decisions.map((entry) => entry.feature_id))
      for (const featureId of requiredDecisionIds) {
        if (!decisionIds.has(featureId)) errors.push(`  - M10.5 no decide el inventario prioritario ${featureId}.`)
      }
      if (decisionIds.size !== requiredDecisionIds.size) {
        errors.push('  - La matriz M10.5 debe contener una sola decisión por entidad prioritaria del inventario.')
      }
    }
  }

  if (c1550M10_5GeometryWave1Result.success) {
    const knownResearchIds = new Set([...featureIds, ...c1550CandidateIds])
    for (const item of c1550M10_5GeometryWave1Result.data.items) {
      const feature = c1550ResearchFeatures.find((entry) => entry.id === item.feature_id)
      if (!feature) {
        errors.push(`  - La primera ola geométrica M10.5 no tiene geometría c. 1550 para ${item.feature_id}.`)
        continue
      }
      for (const field of ['name', 'function', 'summary', 'evidence_note'] as const) {
        if (feature.properties[field] !== item.content.es[field]) {
          errors.push(`  - ${item.feature_id} no coincide con la ficha promovida en ${field}.`)
        }
      }
      for (const claim of item.claims) {
        for (const citation of claim.citations) {
          if (!sourceIds.has(citation.source_id)) {
            errors.push(`  - ${claim.claim_id} referencia una fuente inexistente: ${citation.source_id}`)
          }
        }
      }
      for (const relationship of item.relationships) {
        if (!knownResearchIds.has(relationship.target_id)) {
          errors.push(`  - ${item.feature_id} se relaciona con una entidad desconocida: ${relationship.target_id}`)
        }
      }
    }
    const waveIds = new Set(c1550M10_5GeometryWave1Result.data.feature_ids)
    if (M10_5_GEOMETRY_WAVE_1_FEATURE_IDS.some((featureId) => !waveIds.has(featureId))) {
      errors.push('  - La primera ola geométrica M10.5 no contiene las dieciséis entidades previstas.')
    }
  }

  if (c1550M10_5GeometryWave2Result.success) {
    const knownResearchIds = new Set([...featureIds, ...c1550CandidateIds])
    const decisionByFeatureId = new Map(
      c1550M10_5GeometryWave2Result.data.selection_decisions
        .map((decision) => [decision.feature_id, decision]),
    )
    for (const item of c1550M10_5GeometryWave2Result.data.items) {
      const feature = c1550ResearchFeatures.find((entry) => entry.id === item.feature_id)
      if (!feature) {
        errors.push(`  - La segunda ola geométrica M10.5 no tiene geometría c. 1550 para ${item.feature_id}.`)
        continue
      }
      for (const field of ['name', 'function', 'summary', 'evidence_note'] as const) {
        if (feature.properties[field] !== item.content.es[field]) {
          errors.push(`  - ${item.feature_id} no coincide con la ficha promovida en ${field}.`)
        }
      }
      for (const claim of item.claims) {
        for (const citation of claim.citations) {
          if (!sourceIds.has(citation.source_id)) {
            errors.push(`  - ${claim.claim_id} referencia una fuente inexistente: ${citation.source_id}`)
          }
        }
      }
      for (const relationship of item.relationships) {
        if (!knownResearchIds.has(relationship.target_id)) {
          errors.push(`  - ${item.feature_id} se relaciona con una entidad desconocida: ${relationship.target_id}`)
        }
      }
      if (decisionByFeatureId.get(item.feature_id)?.decision !== 'promote_in_review') {
        errors.push(`  - ${item.feature_id} necesita una decisión explícita de promoción en la segunda ola.`)
      }
    }
    for (const register of c1550M10_5GeometryWave2Result.data.control_registers) {
      const feature = c1550ResearchFeatures.find((entry) => entry.id === register.feature_id)
      const inheritedFeature = features.find((entry) => entry.id === register.feature_id)
      if (
        !feature
        || !inheritedFeature
        || register.inherited_geometry_variant_id !== `c1492.${register.feature_id}`
        || JSON.stringify(feature.geometry) !== JSON.stringify(inheritedFeature.geometry)
      ) {
        errors.push(`  - ${register.feature_id} no coincide con su variante geométrica controlada de la segunda ola.`)
      }
      for (const control of register.controls) {
        for (const sourceId of control.source_refs) {
          if (!sourceIds.has(sourceId)) {
            errors.push(`  - El control ${control.control_id} referencia una fuente inexistente: ${sourceId}`)
          }
        }
      }
    }
    for (const decision of c1550M10_5GeometryWave2Result.data.selection_decisions) {
      for (const sourceId of decision.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - La decisión geométrica de ${decision.feature_id} referencia una fuente inexistente: ${sourceId}`)
        }
      }
    }
    for (const featureId of M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS) {
      if (c1550ResearchIds.has(featureId)) {
        errors.push(`  - ${featureId} debe permanecer sin geometría después de la segunda ola M10.5.`)
      }
      if (decisionByFeatureId.get(featureId)?.decision !== 'remain_deferred') {
        errors.push(`  - ${featureId} necesita una decisión explícita de aplazamiento en la segunda ola.`)
      }
    }
    const waveIds = new Set(c1550M10_5GeometryWave2Result.data.feature_ids)
    if (M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.some((featureId) => !waveIds.has(featureId))) {
      errors.push('  - La segunda ola geométrica M10.5 no contiene las seis entidades previstas.')
    }
    const firstWaveDeferredIds = new Set(M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS)
    if (c1550M10_5GeometryWave2Result.data.selection_decisions.some(
      ({ feature_id }) => !firstWaveDeferredIds.has(
        feature_id as (typeof M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS)[number],
      ),
    )) {
      errors.push('  - La segunda ola geométrica solo puede decidir entidades aplazadas por la primera.')
    }
  }

  const sourceReviewTranches = [
    ...(c1550M10_5SourceReviewResult.success ? [c1550M10_5SourceReviewResult.data] : []),
    ...(c1550M10_5SourceReview2Result.success ? [c1550M10_5SourceReview2Result.data] : []),
    ...(c1550M10_5SourceReview3Result.success ? [c1550M10_5SourceReview3Result.data] : []),
    ...(c1550M10_5SourceReview4Result.success ? [c1550M10_5SourceReview4Result.data] : []),
  ]
  if (sourceReviewTranches.length > 0) {
    const knownResearchIds = new Set([...featureIds, ...c1550CandidateIds])
    const candidateDecisions = new Map(
      c1550M10_5Result.success
        ? c1550M10_5Result.data.inventory_decisions.map((entry) => [entry.feature_id, entry.decision])
        : [],
    )
    const reviewedFeatureIds = new Set<string>()
    for (const item of sourceReviewTranches.flatMap((tranche) => tranche.items)) {
      if (reviewedFeatureIds.has(item.feature_id)) {
        errors.push(`  - ${item.feature_id} no puede repetirse entre tramos de fuentes M10.5.`)
      }
      reviewedFeatureIds.add(item.feature_id)
      const promotedToGeometry = M10_5_GEOMETRY_FEATURE_IDS.includes(
        item.feature_id as (typeof M10_5_GEOMETRY_FEATURE_IDS)[number],
      )
      if (c1550ResearchIds.has(item.feature_id) && !promotedToGeometry) {
        errors.push(`  - ${item.feature_id} pertenece al tramo de fuentes y no debe tener todavía geometría c. 1550.`)
      } else if (!c1550ResearchIds.has(item.feature_id) && promotedToGeometry) {
        errors.push(`  - ${item.feature_id} fue seleccionado para una ola geométrica y debe tener geometría c. 1550.`)
      }
      for (const claim of item.claims) {
        for (const citation of claim.citations) {
          if (!sourceIds.has(citation.source_id)) {
            errors.push(`  - ${claim.claim_id} referencia una fuente inexistente: ${citation.source_id}`)
          }
        }
      }
      for (const sourceId of item.geometry_decision.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`  - La decisión geométrica de ${item.feature_id} referencia una fuente inexistente: ${sourceId}`)
        }
      }
      for (const relationship of item.relationships) {
        if (!knownResearchIds.has(relationship.target_id)) {
          errors.push(`  - ${item.feature_id} se relaciona con una entidad desconocida: ${relationship.target_id}`)
        }
      }
      const inventoryRecord = candidateById.get(item.feature_id) ?? triageById.get(item.feature_id)
      if (!inventoryRecord || inventoryRecord.research_status !== 'ready_for_review') {
        errors.push(`  - ${item.feature_id} debe figurar como ready_for_review tras completar su ficha de fuentes.`)
      }
      const inventoryChange = inventoryRecord && 'change_from_1492' in inventoryRecord
        ? inventoryRecord.change_from_1492
        : inventoryRecord?.expected_change
      if (inventoryChange !== item.period_assessment.change_from_1492) {
        errors.push(`  - ${item.feature_id} discrepa entre el inventario y la evaluación temporal del tramo de fuentes.`)
      }
      if (inventoryRecord && 'presence' in inventoryRecord && (
        inventoryRecord.presence !== item.period_assessment.presence
        || inventoryRecord.temporal_confidence !== item.period_assessment.temporal_confidence
        || inventoryRecord.physical_state !== item.period_assessment.physical_state
      )) {
        errors.push(`  - ${item.feature_id} no conserva presencia, confianza o estado físico del inventario.`)
      }
      const expectedDecision = promotedToGeometry
        ? 'internal_candidate'
        : 'content_ready_geometry_deferred'
      if (candidateDecisions.get(item.feature_id) !== expectedDecision) {
        errors.push(`  - ${item.feature_id} debe constar como ${expectedDecision} en M10.5.`)
      }
    }
  }

  if (c1550M10_5EvidencePreparationResult.success) {
    const knownResearchIds = new Set([...featureIds, ...c1550CandidateIds])
    const workstreamById = new Map(
      c1550M10_5EvidencePreparationResult.data.workstreams.map(
        (workstream) => [workstream.workstream_id, workstream],
      ),
    )
    for (const workstream of c1550M10_5EvidencePreparationResult.data.workstreams) {
      for (const featureId of workstream.target_feature_ids) {
        if (!knownResearchIds.has(featureId)) {
          errors.push(`  - ${workstream.workstream_id} prepara una entidad desconocida: ${featureId}.`)
        }
      }
      for (const input of workstream.inputs) {
        for (const sourceId of input.source_refs) {
          if (!sourceIds.has(sourceId)) {
            errors.push(`  - ${input.input_id} referencia una fuente inexistente: ${sourceId}.`)
          }
        }
      }
    }
    if (c1550M10_5Result.success) {
      for (const layer of c1550M10_5Result.data.analytical_layers) {
        const workstream = workstreamById.get(layer.evidence_preparation_ref)
        if (!workstream || workstream.analytical_layer_id !== layer.layer_id) {
          errors.push(`  - ${layer.layer_id} no coincide con su paquete ${layer.evidence_preparation_ref}.`)
        }
        if (!workstream || workstream.readiness_gate.ready) {
          errors.push(`  - ${layer.layer_id} no puede dejar de estar aplazada mientras su preparación no esté lista.`)
        }
      }
    }
  }

  if (c1550ManifestResult.success) {
    const manifestIds = c1550ManifestResult.data.included_feature_ids
    if (new Set(manifestIds).size !== manifestIds.length) {
      errors.push('  - El manifiesto c. 1550 contiene IDs incluidos duplicados.')
    }
    if (
      manifestIds.length !== c1550ResearchIds.size
      || manifestIds.some((featureId) => !c1550ResearchIds.has(featureId))
    ) {
      errors.push('  - El manifiesto c. 1550 no coincide exactamente con las geometrías incluidas.')
    }
    const requiredDeferrals = new Set([
      'defer.active-building-footprints',
      'defer.completed-centre-footprints',
      'defer.public-squares',
      'defer.citywide-population',
      'defer.parish-boundaries',
      'defer.infrastructure-change',
    ])
    for (const deferral of c1550ManifestResult.data.deferred_geometry) {
      requiredDeferrals.delete(deferral.scope_id)
      for (const featureId of deferral.affected_feature_ids) {
        if (!featureIds.has(featureId) && !c1550CandidateIds.has(featureId)) {
          errors.push(`  - ${deferral.scope_id} aplaza una entidad desconocida: ${featureId}`)
        }
      }
    }
    for (const scopeId of requiredDeferrals) {
      errors.push(`  - Falta el aplazamiento geométrico obligatorio ${scopeId}.`)
    }
  }

  const c1550AuditResult = periodGeometryAuditSchema.safeParse(
    await readJson('data/research/c1550/geometry-audit.json'),
  )
  if (!c1550AuditResult.success) {
    errors.push(formatIssues('data/research/c1550/geometry-audit.json', c1550AuditResult.error.issues))
  } else {
    const auditByFeatureId = new Map<string, (typeof c1550AuditResult.data)[number]>()
    for (const entry of c1550AuditResult.data) {
      if (entry.period_id !== 'c1550') errors.push(`  - La auditoría de ${entry.feature_id} no pertenece a c1550.`)
      if (auditByFeatureId.has(entry.feature_id)) {
        errors.push(`  - Auditoría geométrica c. 1550 duplicada: ${entry.feature_id}`)
      }
      auditByFeatureId.set(entry.feature_id, entry)
      const reviewItem = m10_5ReviewById.get(entry.feature_id)
      const expectedAuditStatus = c1550M10_5Result.success
        && c1550M10_5Result.data.status === 'release_candidate'
        && reviewItem?.readiness === 'reviewed'
        ? 'verified'
        : 'in_review'
      if (entry.status !== expectedAuditStatus) {
        errors.push(`  - La auditoría de ${entry.feature_id} debe estar ${expectedAuditStatus} según el candidato M10.5.`)
      }
      if (!c1550ResearchIds.has(entry.feature_id)) {
        errors.push(`  - La auditoría c. 1550 de ${entry.feature_id} no tiene geometría de investigación.`)
      }
    }
    for (const feature of c1550ResearchFeatures) {
      const audit = auditByFeatureId.get(feature.id)
      if (!audit) {
        errors.push(`  - Falta la auditoría geométrica c. 1550 de ${feature.id}.`)
      } else if (JSON.stringify(audit.geometry_source_refs) !== JSON.stringify(feature.properties.geometry_source_refs)) {
        errors.push(`  - Las fuentes geométricas de ${feature.id} no coinciden con su auditoría c. 1550.`)
      }
    }
    if (c1550ReviewResult.success) {
      for (const item of c1550ReviewResult.data.items) {
        const audit = auditByFeatureId.get(item.feature_id)
        if (audit && item.geometry_review.audit_status !== audit.status) {
          errors.push(`  - El dossier M10.3 y la auditoría discrepan sobre ${item.feature_id}.`)
        }
      }
    }
    if (c1550M10_5Result.success) {
      for (const item of c1550M10_5Result.data.items) {
        const audit = auditByFeatureId.get(item.feature_id)
        if (audit && item.geometry_review.audit_status !== audit.status) {
          errors.push(`  - El candidato M10.5 y la auditoría discrepan sobre ${item.feature_id}.`)
        }
      }
    }
  }

  const pilotResult = pilotRouteSchema.safeParse(await readJson('data/pilot-route.json'))
  if (!pilotResult.success) {
    errors.push(formatIssues('data/pilot-route.json', pilotResult.error.issues))
  } else {
    const slugs = new Set<string>()
    const orders = new Set<number>()
    const placeIds = new Set<string>()
    for (const stop of pilotResult.data.stops) {
      if (slugs.has(stop.slug)) errors.push(`  - Slug de parada duplicado: ${stop.slug}`)
      if (orders.has(stop.order)) errors.push(`  - Orden de parada duplicado: ${stop.order}`)
      if (placeIds.has(stop.id)) errors.push(`  - ID de parada duplicado: ${stop.id}`)
      slugs.add(stop.slug)
      orders.add(stop.order)
      placeIds.add(stop.id)
      for (const featureId of [stop.primary_feature_id, ...stop.related_feature_ids]) {
        const feature = featureById.get(featureId)
        if (!feature) errors.push(`  - ${stop.id} referencia una entidad inexistente: ${featureId}`)
        else if (feature.properties.publication_status !== 'publishable') {
          errors.push(`  - ${stop.id} referencia una entidad no publicable: ${featureId}`)
        }
      }
    }
    const sortedOrders = [...orders].sort((left, right) => left - right)
    if (sortedOrders.some((order, index) => order !== index + 1)) {
      errors.push('  - Las paradas del piloto deben tener un orden continuo desde 1.')
    }
    const expectedSequence = [
      'gate.bib-rambla',
      'route.zacatin-axis',
      'commerce.alcaiceria',
      'religious.madraza-yusufiyya',
      'religious.medina-great-mosque',
    ]
    const actualSequence = [...pilotResult.data.stops]
      .sort((left, right) => left.order - right.order)
      .map((stop) => stop.primary_feature_id)
    if (actualSequence.join('|') !== expectedSequence.join('|')) {
      errors.push('  - El orden del piloto M7 no coincide con la secuencia editorial aprobada.')
    }
    const madrazaPlace = pilotResult.data.stops.find((stop) => stop.slug === 'madraza')
    if (!madrazaPlace
      || madrazaPlace.title.es !== 'Palacio de la Madraza'
      || madrazaPlace.title.en !== 'Palacio de la Madraza'
      || madrazaPlace.primary_feature_id !== 'religious.madraza-yusufiyya') {
      errors.push('  - La parada Madraza debe distinguir el Palacio de la Madraza actual de la entidad histórica Yusufiyya.')
    }
  }

  const translationsResult = featureTranslationsSchema.safeParse(await readJson('data/translations/en.json'))
  if (!translationsResult.success) {
    errors.push(formatIssues('data/translations/en.json', translationsResult.error.issues))
  } else {
    const requiredTranslationIds = new Set([
      'gate.bib-rambla',
      'route.zacatin-axis',
      'commerce.alcaiceria',
      'religious.madraza-yusufiyya',
      'religious.medina-great-mosque',
      'walls.medina-lower',
    ])
    for (const featureId of requiredTranslationIds) {
      const translation = translationsResult.data.features[featureId]
      const feature = featureById.get(featureId)
      if (!translation) errors.push(`  - Falta la traducción inglesa completa de ${featureId}`)
      else if (feature && translation.citation_supports.length !== feature.properties.citations.length) {
        errors.push(`  - ${featureId} debe traducir exactamente ${feature.properties.citations.length} apoyos de cita.`)
      }
    }
    for (const featureId of Object.keys(translationsResult.data.features)) {
      if (!featureIds.has(featureId)) errors.push(`  - Traducción de una entidad inexistente: ${featureId}`)
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

    if (entityCatalogResult.success) {
      const stableIdByGazetteerId = new Map(
        gazetteerResult.data.map((entry) => [
          entry.id,
          entry.feature_id ?? entry.id.replace(/^gaz\./, ''),
        ]),
      )
      const entityByGazetteerId = new Map(
        entityCatalogResult.data.entities.map((entity) => [entity.gazetteer_id, entity]),
      )
      const stableIds = new Set<string>()

      for (const entry of gazetteerResult.data) {
        const entity = entityByGazetteerId.get(entry.id)
        if (!entity) {
          errors.push(`  - Falta la entidad estable derivada de ${entry.id}`)
          continue
        }
        if (stableIds.has(entity.id)) errors.push(`  - Entidad estable duplicada: ${entity.id}`)
        stableIds.add(entity.id)

        const expectedEntity = {
          id: entry.feature_id ?? entry.id.replace(/^gaz\./, ''),
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
        }
        if (JSON.stringify(entity) !== JSON.stringify(expectedEntity)) {
          errors.push(`  - La entidad estable ${entity.id} no reproduce el nomenclátor vigente.`)
        }
      }

      if (entityCatalogResult.data.entities.length !== gazetteerResult.data.length) {
        errors.push('  - El catálogo estable debe contener exactamente una entidad por entrada de nomenclátor.')
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

  const periodAuditResult = periodGeometryAuditSchema.safeParse(
    await readJson('data/geometry-audit-periods.json'),
  )
  if (!periodAuditResult.success) {
    errors.push(formatIssues('data/geometry-audit-periods.json', periodAuditResult.error.issues))
  } else {
    const compositeKeys = new Set<string>()
    const periodAuditByFeatureId = new Map(
      periodAuditResult.data.map((entry) => [entry.feature_id, entry]),
    )

    for (const entry of periodAuditResult.data) {
      const key = `${entry.period_id}:${entry.feature_id}`
      if (compositeKeys.has(key)) errors.push(`  - Revisión geométrica temporal duplicada: ${key}`)
      compositeKeys.add(key)
      if (!compatibilityIds.has(entry.feature_id)) {
        errors.push(`  - La revisión ${key} no tiene geometría en su periodo.`)
      }
    }

    if (auditResult.success) {
      for (const legacyEntry of auditResult.data) {
        const periodEntry = periodAuditByFeatureId.get(legacyEntry.feature_id)
        if (!periodEntry) {
          errors.push(`  - Falta la revisión geométrica c1492 de ${legacyEntry.feature_id}`)
          continue
        }
        const periodEntryWithoutIdentity = Object.fromEntries(
          Object.entries(periodEntry).filter(([key]) => key !== 'period_id'),
        )
        if (JSON.stringify(periodEntryWithoutIdentity) !== JSON.stringify(legacyEntry)) {
          errors.push(`  - La revisión geométrica c1492 de ${legacyEntry.feature_id} altera el registro vigente.`)
        }
      }
      if (periodAuditResult.data.length !== auditResult.data.length) {
        errors.push('  - La revisión geométrica c1492 debe conservar exactamente todos los registros vigentes.')
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
    `Datos válidos: ${features.length} entidades (${publishableCount} publicables, ${verifiedCount} con geometría verificada), ${compatibilityFeatures.length} geometrías c1492 compatibles, ${entityCatalogResult.success ? entityCatalogResult.data.entities.length : 0} entidades estables, ${gazetteerResult.success ? gazetteerResult.data.length : 0} entradas de nomenclátor, ${sources.length} fuentes, ${periods.length} periodos, ${c1550Result.success ? c1550Result.data.candidate_entities.length : 0} candidatos, ${c1550ResearchFeatures.length} geometrías privadas c. 1550, ${sourceReviewTranches.reduce((count, tranche) => count + tranche.items.length, 0)} fichas de tramos de fuentes, ${c1550M10_5EvidencePreparationResult.success ? c1550M10_5EvidencePreparationResult.data.workstreams.length : 0} frentes de preparación de evidencia y ${c1550M10_5Result.success ? c1550M10_5Result.data.inventory_decisions.length : 0} decisiones M10.5.`,
  )
}

validate().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
