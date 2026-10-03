import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { featureCollectionSchema } from '../src/data/schema'
import {
  c1550M10_5GeometryWave2Schema,
  c1550M10_5SourceReview2Schema,
  c1550M10_5SourceReview3Schema,
  c1550M10_5SourceReviewSchema,
  c1550ResearchPackageManifestSchema,
  M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS,
  M10_5_GEOMETRY_WAVE_2_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  type C1550M10_5GeometryWave2,
  type PeriodHistoricalFeature,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const updatedOn = '2026-10-02'
const wavePath = 'data/research/c1550/m10.5-geometry-wave-2.json'
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

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(repositoryRoot, path), 'utf8'))
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(resolve(repositoryRoot, path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const sourceReview = c1550M10_5SourceReviewSchema.parse(await readJson(sourceReviewPaths[0]))
const sourceReview2 = c1550M10_5SourceReview2Schema.parse(await readJson(sourceReviewPaths[1]))
const sourceReview3 = c1550M10_5SourceReview3Schema.parse(await readJson(sourceReviewPaths[2]))
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
const periodTitles = new Map<string, { es: string; en: string }>([
  ['gate.fajalauza', localized('Puerta de Fajalauza', 'Fajalauza Gate')],
  ['water.acequia-real-alhambra', localized('Acequia Real de la Alhambra', 'Royal Canal of the Alhambra')],
  ['water.acequia-aynadamar', localized('Acequia de Aynadamar', 'Aynadamar Canal')],
  ['water.acequia-gorda', localized('Acequia Gorda', 'Acequia Gorda')],
  ['water.acequia-cadi', localized('Acequia del Cadí', 'Cadí Canal')],
  ['water.acequia-romayla', localized('Acequia de Romayla', 'Romayla Canal')],
])

const controlRegisters: C1550M10_5GeometryWave2['control_registers'] = [
  register('gate.fajalauza', 'retained_site_point', [
    control('control.fajalauza-surviving-gate', 'surviving_fabric', 'Punto del acceso conservado', 'secure',
      ['source.granada-fajalauza', 'source.junta-fajalauza-2008'],
      'La fábrica conservada fija el sitio del acceso, sin convertir el punto en una planta del complejo.',
      'Surviving fabric fixes the entrance site without turning the point into a plan of the complex.'),
    control('control.fajalauza-vico-wall-connection', 'historical_cartography', 'Relación con la cerca hacia finales del siglo XVI', 'probable',
      ['source.ugr-vico-2023', 'source.granada-albaicin-wall-route'],
      'La vista histórica y el recorrido de la cerca sostienen la continuidad del acceso y su conexión general, no cada fase constructiva.',
      'The historic view and wall route support continuity of the entrance and its general connection, not every construction phase.'),
  ], [
    localized('No se reconstruyen torres, patio, ramales de muralla ni reparaciones posteriores.',
      'Towers, court, wall branches and later repairs are not reconstructed.'),
  ]),
  register('water.acequia-real-alhambra', 'retained_line', [
    control('control.real-generalife-water-route', 'surviving_fabric', 'Paso por Generalife y acceso a la Alhambra', 'secure',
      ['source.alhambra-real-acequia', 'source.alhambra-torre-agua'],
      'El Patio de la Acequia y el acueducto junto a la Torre del Agua controlan el corredor principal representado.',
      'The Court of the Canal and aqueduct beside the Water Tower control the represented main corridor.'),
    control('control.real-sixteenth-century-continuity', 'near_period_documentary', 'Continuidad y reparación bajo administración cristiana', 'secure',
      ['source.ugr-generalife-christian-2017', 'source.alhambra-real-acequia-2023'],
      'La documentación sostiene el funcionamiento del sistema, pero no fecha de forma uniforme cada fábrica visible.',
      'Documentation supports operation of the system but does not uniformly date every visible structure.'),
  ], [
    localized('Quedan fuera la toma del Darro, ramales secundarios, depósitos y reparaciones sin fase individual.',
      'The Darro intake, secondary branches, reservoirs and repairs without individual phasing remain excluded.'),
  ]),
  register('water.acequia-aynadamar', 'retained_line', [
    control('control.aynadamar-ordinances-1538', 'near_period_documentary', 'Sistema y usuarios regulados en 1538', 'secure',
      ['source.ugr-water-ordinances-2022'],
      'Las ordenanzas acreditan continuidad operativa y destinos en Albaicín y Alcazaba.',
      'The ordinances establish operational continuity and destinations in the Albaicín and Alcazaba.'),
    control('control.aynadamar-urban-branches', 'topographic_alignment', 'Cinco ramales urbanos generalizados', 'approximate',
      ['source.ujaen-water-route-2025', 'source.granada-pepri-islamic-city'],
      'Los ramales siguen controles publicados y topografía urbana; sus extremos no representan acometidas excavadas.',
      'Branches follow published controls and urban topography; their endpoints do not represent excavated service connections.'),
  ], [
    localized('No se incluye la captación rural completa ni se infieren derivaciones entre topónimos no controlados.',
      'The complete rural intake is not included, and branches between uncontrolled place names are not inferred.'),
  ]),
  register('water.acequia-gorda', 'retained_line', [
    control('control.gorda-ordinances-1538', 'near_period_documentary', 'Cauce principal y reparto regulados en 1538', 'secure',
      ['source.ugr-water-ordinances-2022'],
      'La regulación confirma el sistema activo en la primera mitad del siglo XVI.',
      'Regulation confirms the system was active in the first half of the sixteenth century.'),
    control('control.gorda-main-corridor', 'topographic_alignment', 'Eje principal urbano y periurbano', 'approximate',
      ['source.ujaen-water-route-2025', 'source.dera-hydrology'],
      'El eje retiene solo el corredor principal contrastado con cauces; los repartidores se tratan como entidades separadas.',
      'The axis retains only the main corridor checked against watercourses; distributors are treated as separate entities.'),
  ], [
    localized('Se excluyen el ramal del Realejo, otros repartidores, anchura de caja y obras posteriores.',
      'The Realejo branch, other distributors, channel width and later works are excluded.'),
  ]),
  register('water.acequia-cadi', 'retained_line', [
    control('control.cadi-ordinances-1531', 'near_period_documentary', 'Ordenanzas de 1531 y arrendamiento de 1533', 'secure',
      ['source.ugr-cadi-ordinances-2025'],
      'La evidencia fecha funcionamiento, administración y uso agrícola muy cerca del corte representado.',
      'The evidence dates operation, administration and agricultural use very close to the represented slice.'),
    control('control.cadi-southern-corridor', 'topographic_alignment', 'Corredor alto hacia Mártires, Antequeruela y Mauror', 'approximate',
      ['source.ujaen-water-route-2025', 'source.junta-camino-cementerio-2014'],
      'La línea expresa el corredor topográfico publicado y no cada toma o pago mencionado por las ordenanzas.',
      'The line expresses the published topographic corridor and not every intake or district named in the ordinances.'),
  ], [
    localized('Quedan fuera la captación de Aguas Blancas, pagos exteriores, tomas, bifurcaciones y pérdidas no georreferenciadas.',
      'The Aguas Blancas intake, outer districts, intakes, bifurcations and ungeoreferenced losses remain excluded.'),
  ]),
  register('water.acequia-romayla', 'retained_line', [
    control('control.romayla-ordinances-1538', 'near_period_documentary', 'Limpieza, vigilancia y destinos regulados en 1538', 'secure',
      ['source.ugr-water-ordinances-2022'],
      'Las ordenanzas acreditan el cauce activo y una red de ramales urbanos.',
      'The ordinances establish an active main channel and a network of urban branches.'),
    control('control.romayla-main-axis', 'topographic_alignment', 'Cauce principal por Avellano y ladera de la Sabika', 'approximate',
      ['source.ujaen-water-route-2025', 'source.granada-pepri-islamic-city'],
      'La variante conserva solo el eje principal del mapa publicado y no fuerza un enlace directo al Sagrario.',
      'The variant retains only the main axis from the published map and does not force a direct link to the Sagrario.'),
  ], [
    localized('Los ramales hacia Zacatín, Bib-Rambla, San Francisco y Corral del Carbón permanecen sin geometría.',
      'Branches toward Zacatín, Bib-Rambla, San Francisco and Corral del Carbón remain without geometry.'),
  ]),
]

const registerById = new Map(controlRegisters.map((registerEntry) => [registerEntry.feature_id, registerEntry]))
const waveFeatures = M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.map((featureId) => {
  const item = sourceItemById.get(featureId)
  const legacy = publicById.get(featureId)
  const registerEntry = registerById.get(featureId)
  if (!item || !legacy || !registerEntry) throw new Error(`Faltan entradas de la segunda ola para ${featureId}.`)
  const citations = uniqueCitations(item.claims.flatMap((claim) => claim.citations))
  return {
    type: 'Feature',
    id: featureId,
    properties: {
      period_id: 'c1550',
      presence: item.period_assessment.presence,
      temporal_confidence: item.period_assessment.temporal_confidence,
      spatial_confidence: legacy.properties.confidence.location,
      change_from_previous: item.period_assessment.change_from_1492,
      physical_state: item.period_assessment.physical_state,
      name: periodTitles.get(featureId)?.es ?? item.content.es.name,
      function: item.content.es.function,
      summary: item.content.es.summary,
      evidence_note: item.content.es.evidence_note,
      geometry_variant_id: `c1550.${featureId}`,
      citations,
      id: featureId,
      aliases: legacy.properties.aliases,
      modern_search_terms: legacy.properties.modern_search_terms,
      category: legacy.properties.category,
      subtype: legacy.properties.subtype,
      evidence_basis: legacy.properties.evidence_basis,
      geometry_method: legacy.properties.geometry_method,
      geometry_source_refs: unique([
        ...legacy.properties.geometry_source_refs,
        ...item.geometry_decision.source_refs,
        ...registerEntry.controls.flatMap((controlEntry) => controlEntry.source_refs),
      ]),
      publication_status: 'research',
    },
    geometry: legacy.geometry,
  } satisfies PeriodHistoricalFeature
})

const featureById = new Map(waveFeatures.map((feature) => [feature.id, feature]))
const waveItems = M10_5_GEOMETRY_WAVE_2_FEATURE_IDS.map((featureId) => {
  const item = sourceItemById.get(featureId)
  const feature = featureById.get(featureId)
  if (!item || !feature) throw new Error(`Falta la ficha promovida de ${featureId}.`)
  const retainedPoint = feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint'
  const title = periodTitles.get(featureId)
  return {
    feature_id: item.feature_id,
    cluster: item.cluster,
    readiness: 'ready_for_specialist_review' as const,
    content: {
      es: { ...item.content.es, name: title?.es ?? item.content.es.name },
      en: { ...item.content.en, name: title?.en ?? item.content.en.name },
    },
    claims: item.claims,
    relationships: item.relationships,
    geometry_review: {
      representation: retainedPoint ? 'retained_site_point' as const : 'retained_line' as const,
      audit_status: 'in_review' as const,
      decision: retainedPoint
        ? localized('Se conserva un punto sobre la puerta superviviente como referencia de sitio, no como planta del complejo defensivo.',
            'A point on the surviving gate is retained as a site reference, not as a plan of the defensive complex.')
        : localized('Se conserva el eje heredado como hipótesis revisable limitada por el registro de controles y exclusiones de la segunda ola.',
            'The inherited axis is retained as a reviewable hypothesis limited by the wave-two register of controls and exclusions.'),
      overlap_resolution: retainedPoint
        ? localized('El punto no representa torres, patio, lienzos conectados ni fases de reparación.',
            'The point does not represent towers, court, connected wall sections or repair phases.')
        : localized('La línea no representa anchura, caja, ramales excluidos, tomas, repartidores ni pérdidas no georreferenciadas.',
            'The line does not represent width, channel structure, excluded branches, intakes, distributors or ungeoreferenced losses.'),
    },
  }
})

const selectionDecisions: C1550M10_5GeometryWave2['selection_decisions'] = [
  promote('gate.fajalauza', ['source.granada-fajalauza', 'source.junta-fajalauza-2008', 'source.ugr-vico-2023'],
    'La fábrica conservada, el contexto arqueológico y la cartografía histórica permiten un punto de sitio revisable.',
    'Surviving fabric, archaeological context and historical mapping support a reviewable site point.',
    'Mantener el punto en revisión y no ampliarlo a una huella defensiva sin lectura arquitectónica por fases.',
    'Keep the point in review and do not expand it into a defensive footprint without phased architectural analysis.'),
  promote('water.acequia-real-alhambra', ['source.alhambra-real-acequia', 'source.alhambra-torre-agua', 'source.alhambra-real-acequia-2023'],
    'Los pasos por Generalife y Torre del Agua controlan el eje principal; ramales y reparaciones quedan excluidos.',
    'The Generalife and Water Tower passages control the main axis; branches and repairs remain excluded.',
    'Revisar por fases los componentes excluidos antes de ampliar la geometría.',
    'Review excluded components by phase before expanding the geometry.'),
  promote('water.acequia-aynadamar', ['source.ugr-water-ordinances-2022', 'source.ujaen-water-route-2025', 'source.granada-pepri-islamic-city'],
    'La regulación de 1538 y los controles publicados sostienen la red principal como hipótesis aproximada.',
    'The 1538 regulation and published controls support the principal network as an approximate hypothesis.',
    'No añadir ramales o acometidas sin un control documental y espacial individual.',
    'Do not add branches or service connections without an individual documentary and spatial control.'),
  promote('water.acequia-gorda', ['source.ugr-water-ordinances-2022', 'source.ujaen-water-route-2025', 'source.dera-hydrology'],
    'El cauce principal se separa expresamente de sus ramales y cuenta con controles documentales y topográficos.',
    'The main channel is explicitly separated from its branches and has documentary and topographic controls.',
    'Mantener repartidores y ramales como entidades independientes hasta su propia auditoría.',
    'Keep distributors and branches as separate entities until independently audited.'),
  promote('water.acequia-cadi', ['source.ugr-cadi-ordinances-2025', 'source.ujaen-water-route-2025', 'source.junta-camino-cementerio-2014'],
    'Las ordenanzas de 1531 y el arrendamiento de 1533 aseguran funcionamiento; el eje se limita al corredor urbano generalizado.',
    'The 1531 ordinances and 1533 lease establish operation; the axis is limited to the generalised urban corridor.',
    'Georreferenciar por separado pagos, tomas y bifurcaciones antes de incorporarlos.',
    'Georeference districts, intakes and bifurcations separately before incorporating them.'),
  promote('water.acequia-romayla', ['source.ugr-water-ordinances-2022', 'source.ujaen-water-route-2025', 'source.granada-pepri-islamic-city'],
    'El eje principal queda separado de los ramales documentados y de la conexión disputada con el Sagrario.',
    'The main axis is separated from documented branches and the disputed connection to the Sagrario.',
    'Derivar cada ramal urbano como geometría independiente solo cuando tenga controles suficientes.',
    'Derive each urban branch as separate geometry only when sufficient controls exist.'),
  defer('royal.casa-castril', ['source.granada-casa-castril'],
    'La presencia y fase anterior a 1560 siguen sin demostrarse.', 'Presence and a pre-1560 phase remain unproven.',
    'Obtener datación constructiva y lectura de fases.', 'Obtain construction dating and phase analysis.'),
  defer('royal.casa-tiros', ['source.granada-casa-tiros'],
    'La cronología de la fábrica dentro de 1540–1560 sigue sin resolver.', 'The fabric chronology within 1540–1560 remains unresolved.',
    'Obtener datación de obra y separar fases anteriores y posteriores.', 'Obtain construction dating and separate earlier and later phases.'),
  defer('gate.mawrur', ['source.granada-mauror-gate', 'source.junta-aguado-2009'],
    'No se ha demostrado la presencia del paso hacia 1550.', 'The passage has not been shown to survive around 1550.',
    'Localizar una descripción o representación fechada del siglo XVI.', 'Locate a dated sixteenth-century description or depiction.'),
  defer('walls.albaicin-north', ['source.granada-albaicin-nasrid-wall', 'source.ugr-vico-2023'],
    'La línea mezcla fábrica conservada, huecos y conexiones aproximadas.', 'The line mixes surviving fabric, gaps and approximate connections.',
    'Completar una matriz de supervivencia y cronología por segmentos.', 'Complete a segment-by-segment survival and chronology matrix.'),
  defer('walls.medina-lower', ['source.granada-centre-plan', 'source.junta-western-wall-2006', 'source.ugr-vico-2023'],
    'El perímetro sintetiza muchos tramos con estados materiales desiguales.', 'The perimeter synthesises many sections with unequal material states.',
    'Completar una matriz por segmentos y conservar los huecos reales.', 'Complete a segment matrix and preserve genuine gaps.'),
  defer('royal.generalife', ['source.ugr-generalife-christian-2017', 'source.alhambra-plan-director-landscape'],
    'La envolvente no separa palacio, patios, huertas, acequia y obras cristianas.', 'The envelope does not separate palace, courts, orchards, canal and Christian works.',
    'Obtener y georreferenciar planimetría de fases.', 'Obtain and georeference phase plans.'),
  defer('gate.alhambra-arrabal', ['source.alhambra-arrabal-study-2022', 'source.alhambra-gates'],
    'Un punto único confundiría la puerta nazarí con baluarte, caballerizas y Puerta de Hierro.', 'One point would conflate the Nasrid gate, bastion, stables and Iron Gate.',
    'Registrar por separado componentes y fases.', 'Register components and phases separately.'),
  defer('bridge.cadi', ['source.granada-tableros-cadi', 'source.alhambra-banuelo'],
    'Identidad, forma y supervivencia del supuesto puente siguen sin resolver.', 'The supposed bridge’s identity, form and survival remain unresolved.',
    'Resolver la cronología del arco y el alcance material mediante documentación y arqueología.', 'Resolve arch chronology and material extent through documents and archaeology.'),
]

const wave: C1550M10_5GeometryWave2 = c1550M10_5GeometryWave2Schema.parse({
  schema_version: 1,
  milestone: 'M10.5',
  wave: 'geometry-wave-2',
  period_id: 'c1550',
  status: 'ready_for_specialist_review',
  public_application_import: false,
  updated_on: updatedOn,
  scope_note: 'Segunda ola geométrica conservadora: Fajalauza y cinco ejes principales de acequias se incorporan como hipótesis privadas in_review con controles y exclusiones explícitos; ocho entidades complejas permanecen aplazadas.',
  source_wave_path: 'data/research/c1550/m10.5-geometry-wave-1.json',
  source_review_paths: sourceReviewPaths,
  feature_ids: M10_5_GEOMETRY_WAVE_2_FEATURE_IDS,
  deferred_feature_ids: M10_5_GEOMETRY_WAVE_2_DEFERRED_FEATURE_IDS,
  items: waveItems,
  selection_decisions: selectionDecisions,
  control_registers: controlRegisters,
})

const promotedIds = new Set<string>(M10_5_GEOMETRY_WAVE_2_FEATURE_IDS)
const nextCollections = {
  point: { ...currentCollections.point, features: upsert(currentCollections.point.features, ['Point', 'MultiPoint']) },
  line: { ...currentCollections.line, features: upsert(currentCollections.line.features, ['LineString', 'MultiLineString']) },
  area: { ...currentCollections.area, features: upsert(currentCollections.area.features, ['Polygon', 'MultiPolygon']) },
}
const waveAudits = waveFeatures.map((feature) => ({
  period_id: 'c1550' as const,
  feature_id: feature.id,
  status: 'in_review' as const,
  reviewed_on: null,
  geometry_source_refs: feature.properties.geometry_source_refs,
  check_method: feature.id === 'gate.fajalauza'
    ? 'Punto de la puerta conservada contrastado con fábrica, arqueología y cartografía histórica; no se interpreta como planta del conjunto defensivo.'
    : 'Eje c. 1492 reutilizado únicamente como hipótesis del componente principal, contrastado con controles documentales y topográficos y limitado por exclusiones explícitas en geometry-wave-2.',
  notes: feature.id === 'gate.fajalauza'
    ? 'Localizador puntual seguro; torres, patio, conexiones murarias y fases de reparación quedan fuera.'
    : 'La línea permanece aproximada e in_review; no incorpora anchura, caja, ramales excluidos, tomas, repartidores ni pérdidas no georreferenciadas.',
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
  scope_note: 'Paquete GIS privado M10.5 ampliado por dos olas geométricas conservadoras. Sus 39 geometrías son candidatas internas in_review y ninguna se considera verificada o publicable.',
  layers: manifest.layers.map((layer) => ({
    ...layer,
    feature_count: nextCollections[layer.geometry_type].features.length,
  })),
  geometry_wave_2_path: wavePath,
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

console.log(`Ola geométrica M10.5.2 ensamblada: ${waveFeatures.length} promociones, ${wave.deferred_feature_ids.length} aplazamientos y ${includedFeatureIds.length} geometrías privadas.`)

function localized(es: string, en: string) {
  return { es, en }
}

function control(
  controlId: string,
  kind: C1550M10_5GeometryWave2['control_registers'][number]['controls'][number]['kind'],
  appliesTo: string,
  confidence: C1550M10_5GeometryWave2['control_registers'][number]['controls'][number]['confidence'],
  sourceRefs: string[],
  es: string,
  en: string,
) {
  return { control_id: controlId, kind, applies_to: appliesTo, confidence, source_refs: sourceRefs, note: localized(es, en) }
}

function register(
  featureId: string,
  representation: C1550M10_5GeometryWave2['control_registers'][number]['representation'],
  controls: C1550M10_5GeometryWave2['control_registers'][number]['controls'],
  excludedComponents: C1550M10_5GeometryWave2['control_registers'][number]['excluded_components'],
) {
  return {
    feature_id: featureId,
    representation,
    inherited_geometry_variant_id: `c1492.${featureId}`,
    audit_status: 'in_review' as const,
    controls,
    excluded_components: excludedComponents,
  }
}

function promote(featureId: string, sourceRefs: string[], es: string, en: string, nextEs: string, nextEn: string) {
  return { feature_id: featureId, decision: 'promote_in_review' as const, rationale: localized(es, en), next_requirement: localized(nextEs, nextEn), source_refs: sourceRefs }
}

function defer(featureId: string, sourceRefs: string[], es: string, en: string, nextEs: string, nextEn: string) {
  return { feature_id: featureId, decision: 'remain_deferred' as const, rationale: localized(es, en), next_requirement: localized(nextEs, nextEn), source_refs: sourceRefs }
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

function uniqueCitations(citations: PeriodHistoricalFeature['properties']['citations']) {
  return [...new Map(citations.map((citation) => [
    `${citation.source_id}|${citation.locator}|${citation.supports}`,
    citation,
  ])).values()]
}

function upsert(existing: PeriodHistoricalFeature[], acceptedTypes: PeriodHistoricalFeature['geometry']['type'][]) {
  return [
    ...existing.filter((feature) => !promotedIds.has(feature.id)),
    ...waveFeatures.filter((feature) => acceptedTypes.includes(feature.geometry.type)),
  ]
}

if (selectionDecisions.length !== M10_5_GEOMETRY_WAVE_1_DEFERRED_FEATURE_IDS.length) {
  throw new Error('La segunda ola no registra las catorce decisiones heredadas.')
}
