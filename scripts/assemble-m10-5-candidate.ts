import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  c1550M10_5CandidateSchema,
  c1550M10_5EvidencePreparationSchema,
  c1550M10_5GeometryWave1Schema,
  c1550M10_5GeometryWave2Schema,
  c1550M10_5SourceReview2Schema,
  c1550M10_5SourceReview3Schema,
  c1550M10_5SourceReview4Schema,
  c1550M10_5SourceReviewSchema,
  c1550M10_5SupplementSchema,
  c1550ResearchInventorySchema,
  c1550VerticalSliceReviewSchema,
  M10_5_FEATURE_IDS,
  M10_5_REVIEW_DISCIPLINES,
  type C1550M10_5Candidate,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const candidatePath = 'data/research/c1550/m10.5-candidate.json'

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(repositoryRoot, path), 'utf8'))
}

const review = c1550VerticalSliceReviewSchema.parse(
  await readJson('data/research/c1550/m10.3-review.json'),
)
const supplement = c1550M10_5SupplementSchema.parse(
  await readJson('data/research/c1550/m10.5-supplement.json'),
)
const sourceReview = c1550M10_5SourceReviewSchema.parse(
  await readJson('data/research/c1550/m10.5-source-review.json'),
)
const sourceReview2 = c1550M10_5SourceReview2Schema.parse(
  await readJson('data/research/c1550/m10.5-source-review-2.json'),
)
const sourceReview3 = c1550M10_5SourceReview3Schema.parse(
  await readJson('data/research/c1550/m10.5-source-review-3.json'),
)
const sourceReview4 = c1550M10_5SourceReview4Schema.parse(
  await readJson('data/research/c1550/m10.5-source-review-4.json'),
)
const evidencePreparation = c1550M10_5EvidencePreparationSchema.parse(
  await readJson('data/research/c1550/m10.5-evidence-preparation.json'),
)
const geometryWave1 = c1550M10_5GeometryWave1Schema.parse(
  await readJson('data/research/c1550/m10.5-geometry-wave-1.json'),
)
const geometryWave2 = c1550M10_5GeometryWave2Schema.parse(
  await readJson('data/research/c1550/m10.5-geometry-wave-2.json'),
)
const inventory = c1550ResearchInventorySchema.parse(
  await readJson('data/research/c1550-inventory.json'),
)

const inheritedItems = review.items.map((item) => ({
  ...item,
  cluster: item.cluster === 'cathedral_precinct' ? 'civic_centre' as const : 'imperial_alhambra' as const,
}))
const itemsById = new Map(
  [...inheritedItems, ...supplement.items, ...geometryWave1.items, ...geometryWave2.items]
    .map((item) => [item.feature_id, item]),
)
const items = M10_5_FEATURE_IDS.map((featureId) => {
  const item = itemsById.get(featureId)
  if (!item) throw new Error(`Falta la ficha M10.5 de ${featureId}.`)
  return item
})

const evidenceWorkstreamIds = new Set(
  evidencePreparation.workstreams.map((workstream) => workstream.workstream_id),
)
for (const layer of supplement.analytical_layers) {
  if (!evidenceWorkstreamIds.has(layer.evidence_preparation_ref)) {
    throw new Error(`Falta la preparación de evidencia ${layer.evidence_preparation_ref} para ${layer.layer_id}.`)
  }
}

const mappedIds = new Set<string>(M10_5_FEATURE_IDS)
const contentReadyIds = new Set([
  ...sourceReview.feature_ids,
  ...sourceReview2.feature_ids,
  ...sourceReview3.feature_ids,
  ...sourceReview4.feature_ids,
])
const inventoryRecords = [
  ...inventory.existing_entity_triage.map((record) => ({
    feature_id: record.feature_id,
    priority: record.priority,
    research_status: record.research_status,
    geometry_action: record.geometry_action,
    source_refs: record.source_refs,
  })),
  ...inventory.candidate_entities.map((record) => ({
    feature_id: record.proposed_id,
    priority: record.priority,
    research_status: record.research_status,
    geometry_action: record.geometry_action,
    source_refs: record.source_refs,
  })),
].filter((record) => record.priority !== 'defer')

const inventoryDecisions = [...new Map(inventoryRecords.map((record) => [record.feature_id, record])).values()]
  .sort((left, right) => left.feature_id.localeCompare(right.feature_id))
  .map((record) => {
    const cluster = clusterFor(record.feature_id)
    const decision = mappedIds.has(record.feature_id)
      ? 'internal_candidate' as const
      : contentReadyIds.has(record.feature_id)
        ? 'content_ready_geometry_deferred' as const
      : cluster === 'population_geography'
        ? 'deferred_sensitive_spatial_claim' as const
        : record.geometry_action === 'reconstruct_variant'
            || ['public_spaces', 'quarters'].includes(cluster)
          ? 'deferred_analytical_geometry' as const
          : record.research_status === 'not_started'
            ? 'research_not_started' as const
            : 'source_review_needed' as const
    return {
      feature_id: record.feature_id,
      cluster,
      priority: record.priority,
      decision,
      source_refs: record.source_refs,
      blocker: blockerFor(decision),
    }
  })

const pendingSignoffNotes: Record<(typeof M10_5_REVIEW_DISCIPLINES)[number], string> = {
  historical: 'Pendiente de revisión explícita por la persona responsable de historia del proyecto; no depende de una entidad externa.',
  architectural: 'Pendiente de revisión arquitectónica de fases, contactos, obras activas y edificios transformados.',
  geometry: `Pendiente de auditoría geométrica especialista; las ${M10_5_FEATURE_IDS.length} geometrías conservan estado in_review.`,
  translation: 'Pendiente de revisión editorial bilingüe de nombres, funciones, afirmaciones y cautelas.',
  morisco_history: 'Pendiente de revisión especialista de conversión forzada, coerción, revuelta y desplazamientos posteriores.',
  population_geography: 'Pendiente de un corpus espacial y una revisión de método antes de representar geografía de población.',
}

const candidate: C1550M10_5Candidate = c1550M10_5CandidateSchema.parse({
  schema_version: 1,
  milestone: 'M10.5',
  period_id: 'c1550',
  status: 'ready_for_specialist_review',
  public_application_import: false,
  updated_on: '2026-10-02',
  scope_note: `Candidato interno M10.5 con ${M10_5_FEATURE_IDS.length} geometrías auditables, cobertura temática bilingüe e inventario priorizado; no es un lanzamiento público ni una reconstrucción completa de la ciudad.`,
  feature_ids: M10_5_FEATURE_IDS,
  items,
  themes: supplement.themes,
  analytical_layers: supplement.analytical_layers,
  inventory_decisions: inventoryDecisions,
  coverage: {
    mapped_candidate_features: items.length,
    inventory_decisions: inventoryDecisions.length,
    themes: supplement.themes.length,
    deferred_analytical_layers: supplement.analytical_layers.length,
  },
  signoffs: M10_5_REVIEW_DISCIPLINES.map((discipline) => ({
    discipline,
    status: 'pending' as const,
    reviewer_name: null,
    reviewer_role: null,
    reviewed_on: null,
    notes: pendingSignoffNotes[discipline],
  })),
  promotion_gate: {
    public_ready: false,
    blockers: [
      `Las ${M10_5_FEATURE_IDS.length} geometrías candidatas siguen en revisión y ninguna cuenta todavía con auditoría verificada.`,
      'Las seis funciones de revisión aún no tienen una decisión registrada; son funciones de competencia, no dependencias institucionales.',
      'Los límites parroquiales, plazas, geografía de población y extensión urbana continúan aplazados con métodos explícitos.',
    ],
  },
})

await writeFile(
  resolve(repositoryRoot, candidatePath),
  `${JSON.stringify(candidate, null, 2)}\n`,
  'utf8',
)

console.log(
  `M10.5 ensamblado: ${candidate.items.length} fichas, ${candidate.inventory_decisions.length} decisiones de inventario, ${candidate.analytical_layers.length} capas analíticas aplazadas y ${candidate.signoffs.length} revisiones pendientes.`,
)

function clusterFor(featureId: string): C1550M10_5Candidate['inventory_decisions'][number]['cluster'] {
  if (['urban.albaicin', 'urban.lower-medina', 'urban.late-nasrid-extent', 'quarter.albayyazin'].includes(featureId)) {
    return 'population_geography'
  }
  if (featureId.startsWith('quarter.')) return 'quarters'
  if (featureId.includes('plaza') || featureId.includes('campo-principe')
    || ['gate.bib-rambla', 'commerce.alcaiceria', 'route.zacatin-axis'].includes(featureId)) {
    return 'public_spaces'
  }
  if (featureId.includes('alhambra') || ['royal.palace-charles-v', 'gate.puerta-granadas', 'water.pilar-carlos-v'].includes(featureId)) {
    return 'imperial_alhambra'
  }
  if (featureId.startsWith('religious.san-')
    || ['religious.salvador-collegiate', 'religious.albaicin-great-mosque'].includes(featureId)) {
    return 'parish_city'
  }
  if (featureId.startsWith('water.') || featureId.startsWith('walls.')
    || featureId.startsWith('gate.') || featureId.startsWith('route.')
    || ['civic.maristan', 'civic.corral-carbon', 'civic.banuelo'].includes(featureId)) {
    return 'inherited_systems'
  }
  return 'civic_centre'
}

function blockerFor(decision: C1550M10_5Candidate['inventory_decisions'][number]['decision']): string {
  switch (decision) {
    case 'internal_candidate':
      return 'La ficha y la geometría existen, pero requieren decisiones registradas para las funciones de revisión aplicables antes de promoción pública.'
    case 'content_ready_geometry_deferred':
      return 'La ficha bilingüe y sus afirmaciones están preparadas para revisión de contenido, pero todavía no existe una geometría c. 1550 auditable.'
    case 'deferred_analytical_geometry':
      return 'La entidad necesita una derivación espacial reproducible y revisión geométrica antes de incorporarse al mapa candidato.'
    case 'deferred_sensitive_spatial_claim':
      return 'La representación social o demográfica requiere corpus, método explícito y revisión histórica y ética especializada.'
    case 'research_not_started':
      return 'La investigación de fuentes no ha comenzado con profundidad suficiente para preparar contenido o geometría.'
    case 'source_review_needed':
      return 'Las fuentes iniciales necesitan contraste y síntesis bilingüe antes de producir una geometría candidata auditable.'
  }
}
