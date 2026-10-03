import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Position } from 'geojson'
import {
  featureCollectionSchema,
  type Confidence,
  type EvidenceBasis,
  type FeatureCategory,
  type GeometryMethod,
  type HistoricalFeature,
} from '../src/data/schema'
import {
  c1550ResearchPackageManifestSchema,
  PERIOD_CHANGE_VALUES,
  PHYSICAL_STATE_VALUES,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  type PeriodHistoricalFeature,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = resolve(repositoryRoot, 'data/research/c1550')
const force = process.argv.includes('--force')

type PeriodChange = (typeof PERIOD_CHANGE_VALUES)[number]
type PhysicalState = (typeof PHYSICAL_STATE_VALUES)[number]

interface Citation {
  source_id: string
  locator: string
  supports: string
}

interface PointSeed {
  id: string
  coordinates: Position
  name: string
  function: string
  summary: string
  evidenceNote: string
  category: FeatureCategory
  subtype: string
  change: PeriodChange
  physicalState: PhysicalState
  citations: Citation[]
  aliases: string[]
  searchTerms: string[]
  evidenceBasis: EvidenceBasis[]
  geometryMethod?: GeometryMethod
  geometrySourceRefs: string[]
  temporalConfidence?: Confidence
  spatialConfidence?: Confidence
  auditMethod: string
  auditNotes: string
}

const pointSeeds: PointSeed[] = [
  {
    id: 'religious.madraza-yusufiyya',
    coordinates: [-3.5982757, 37.176086],
    name: 'Casa del Cabildo (antigua Madraza Yusufiyya)',
    function: 'Sede municipal en un edificio nazarí adaptado',
    summary: 'La antigua Madraza albergaba desde 1500 el Cabildo de Granada y conservaba partes de su fábrica nazarí dentro de un uso cristiano municipal.',
    evidenceNote: 'La transformación funcional está documentada; se conserva el punto de referencia del inmueble porque M10.2 no reconstruye todavía la planta de la adaptación de 1550.',
    category: 'commerce_civic',
    subtype: 'municipal_council',
    change: 'converted',
    physicalState: 'complete',
    citations: [{
      source_id: 'source.ugr-madraza',
      locator: 'Historia del Palacio de la Madraza y etapa posterior a la conquista',
      supports: 'Paso del edificio al Cabildo en 1500 y transformaciones posteriores.',
    }],
    aliases: ['Madraza', 'Cabildo Viejo', 'Palacio de la Madraza'],
    searchTerms: ['Calle Oficios', 'Capilla Real', 'Catedral'],
    evidenceBasis: ['surviving_fabric', 'documentary', 'archaeology'],
    geometryMethod: 'modern_reference_location',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.ugr-madraza'],
    auditMethod: 'Reutilización del punto c. 1492 como referencia del mismo inmueble, contrastada con la fábrica actual y la identificación institucional.',
    auditNotes: 'La persistencia del solar se audita de nuevo para c. 1550; el punto no afirma la planta municipal de esa fecha.',
  },
  {
    id: 'religious.cathedral-granada',
    coordinates: [-3.5992136, 37.1764598],
    name: 'Catedral de Granada',
    function: 'Catedral cristiana y proyecto imperial activo',
    summary: 'El gran templo renacentista ocupaba el centro religioso de la antigua medina, pero hacia 1550 seguía siendo una obra en curso y no el edificio acabado actual.',
    evidenceNote: 'La presencia y el solar son seguros. Se usa un punto de referencia moderno hasta disponer de una planta de fases que delimite únicamente la fábrica levantada hacia 1550.',
    category: 'religion_learning',
    subtype: 'cathedral',
    change: 'newly_built',
    physicalState: 'under_construction',
    citations: [
      {
        source_id: 'source.granada-cathedral',
        locator: 'Historia y relación con la Mezquita Mayor',
        supports: 'Proyecto catedralicio cristiano sobre el antiguo centro religioso de la medina.',
      },
      {
        source_id: 'source.junta-granada-tourism-plan',
        locator: 'Ficha cronológica de la Catedral',
        supports: 'Cronología constructiva durante el siglo XVI.',
      },
    ],
    aliases: ['Santa Iglesia Catedral Metropolitana', 'Catedral de la Encarnación'],
    searchTerms: ['Plaza de las Pasiegas', 'Sagrario', 'Gran Vía'],
    evidenceBasis: ['surviving_fabric', 'documentary', 'later_description'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.granada-cathedral'],
    auditMethod: 'Centro de la huella moderna de OpenStreetMap, usado solo como referencia del solar y contrastado con PNOA y la identificación municipal.',
    auditNotes: 'No se convierte la huella terminada en una planta de 1550; hace falta una planimetría de fases.',
  },
  {
    id: 'religious.royal-chapel',
    coordinates: [-3.5985655, 37.1762964],
    name: 'Capilla Real',
    function: 'Panteón dinástico de los Reyes Católicos',
    summary: 'La Capilla Real estaba terminada y en uso como panteón regio, unida espacial y simbólicamente al nuevo complejo cristiano del centro urbano.',
    evidenceNote: 'La cronología hasta 1521 y el inmueble conservado aseguran presencia y localización; el punto evita atribuir a 1550 todos los anexos de la huella actual.',
    category: 'religion_learning',
    subtype: 'royal_funeral_chapel',
    change: 'newly_built',
    physicalState: 'complete',
    citations: [{
      source_id: 'source.junta-granada-tourism-plan',
      locator: 'Ficha de la Capilla Real',
      supports: 'Fundación en 1504, terminación y traslado de los enterramientos en 1521.',
    }],
    aliases: ['Capilla de los Reyes Católicos', 'Panteón de los Reyes Católicos'],
    searchTerms: ['Calle Oficios', 'Catedral', 'Lonja'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.junta-granada-tourism-plan'],
    auditMethod: 'Centro de la entidad conservada en OpenStreetMap, contrastado con PNOA y la ficha cronológica institucional.',
    auditNotes: 'El punto identifica el edificio completo y no una reconstrucción de sus anexos o contactos constructivos en 1550.',
  },
  {
    id: 'civic.lonja-mercaderes',
    coordinates: [-3.5986111, 37.1758333],
    name: 'Lonja de Mercaderes',
    function: 'Intercambio mercantil y dependencias de la Capilla Real',
    summary: 'La Lonja construida desde 1518 articulaba usos comerciales en su planta baja y dependencias ligadas a la Capilla Real en la superior.',
    evidenceNote: 'La presencia y función son seguras, pero la localización inicial es un punto representativo de Calle Oficios con confianza espacial probable hasta revisar una huella catastral.',
    category: 'commerce_civic',
    subtype: 'merchant_exchange',
    change: 'newly_built',
    physicalState: 'complete',
    citations: [{
      source_id: 'source.granada-lonja-mercaderes',
      locator: 'Descripción histórica y usos por plantas',
      supports: 'Construcción en 1518 y combinación de funciones mercantiles y capitulares.',
    }],
    aliases: ['Lonja', 'Lonja de los Mercaderes'],
    searchTerms: ['Calle Oficios', 'Capilla Real', 'Madraza'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.granada-lonja-mercaderes'],
    spatialConfidence: 'probable',
    auditMethod: 'Punto representativo colocado en Calle Oficios a partir de la dirección institucional, con contraste visual en ortofoto y cartografía moderna.',
    auditNotes: 'Debe sustituirse por una huella revisada antes de cualquier publicación; no se interpreta el contacto con la Capilla Real.',
  },
  {
    id: 'civic.real-chancilleria',
    coordinates: [-3.59565, 37.1773],
    name: 'Real Chancillería',
    function: 'Tribunal superior de la Corona',
    summary: 'La Chancillería funcionaba en Plaza Nueva y contaba con su patio clasicista hacia 1540, aunque la fachada monumental actual de 1587 aún no existía.',
    evidenceNote: 'La institución, el solar y el patio son seguros; se usa un punto para impedir que la fachada y huella terminadas se lean como estado íntegro de 1550.',
    category: 'commerce_civic',
    subtype: 'high_court',
    change: 'newly_built',
    physicalState: 'partially_in_use',
    citations: [{
      source_id: 'source.granada-chancilleria',
      locator: 'Historia, patio y fachada',
      supports: 'Institución desde 1505, patio hacia 1540 y fachada posterior de 1587.',
    }],
    aliases: ['Real Audiencia y Chancillería', 'Palacio de la Chancillería'],
    searchTerms: ['Plaza Nueva', 'Cuesta de Gomérez', 'Tribunal Superior de Justicia'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.granada-chancilleria'],
    auditMethod: 'Punto representativo del inmueble de Plaza Nueva contrastado con PNOA y la dirección institucional; no se usa su huella terminada.',
    auditNotes: 'La reconstrucción posterior deberá excluir expresamente la fachada de 1587 y separar crujías por fase.',
  },
  {
    id: 'civic.hospital-real',
    coordinates: [-3.6010507, 37.1849363],
    name: 'Hospital Real',
    function: 'Equipamiento asistencial de la Corona',
    summary: 'El Hospital Real, iniciado en 1511, formaba parte del programa estatal de asistencia y monumentalizaba el borde septentrional de la ciudad.',
    evidenceNote: 'El solar y el inicio de obra están documentados; el punto mantiene abierta la investigación sobre las partes construidas y operativas hacia 1550.',
    category: 'commerce_civic',
    subtype: 'royal_hospital',
    change: 'newly_built',
    physicalState: 'under_construction',
    citations: [{
      source_id: 'source.granada-hospital-real',
      locator: 'Historia, autores y descripción de la planta',
      supports: 'Inicio de obras en 1511 y función asistencial dentro del programa de la Corona.',
    }],
    aliases: ['Hospital de los Reyes Católicos'],
    searchTerms: ['Cuesta del Hospicio', 'Rectorado UGR', 'Triunfo'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.granada-hospital-real'],
    auditMethod: 'Centro de la entidad moderna de OpenStreetMap, contrastado con PNOA y la dirección institucional del Hospital Real.',
    auditNotes: 'La huella actual no se publica como fase de 1550; falta lectura arquitectónica de las campañas de obra.',
  },
  {
    id: 'royal.palace-charles-v',
    coordinates: [-3.5902023, 37.1767679],
    name: 'Palacio de Carlos V',
    function: 'Nueva residencia imperial dentro de la Alhambra',
    summary: 'El palacio imperial alteraba el tejido de la Alhambra y en 1550 había alcanzado el segundo piso, pero no correspondía todavía al edificio acabado actual.',
    evidenceNote: 'La secuencia de obra es precisa, pero la planta construida en ese corte requiere investigación arquitectónica; por eso se representa solo el emplazamiento.',
    category: 'royal_elite',
    subtype: 'imperial_palace',
    change: 'newly_built',
    physicalState: 'under_construction',
    citations: [{
      source_id: 'source.alhambra-charles-v-palace',
      locator: 'Secuencia de obras 1533–1550',
      supports: 'Inicio, cimentación del patio, cripta y segundo piso levantado en 1550.',
    }],
    aliases: ['Casa Real Nueva', 'Palacio imperial'],
    searchTerms: ['Alhambra', 'Palacios Nazaríes', 'Pedro Machuca'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.alhambra-charles-v-palace'],
    auditMethod: 'Centro de la huella moderna de OpenStreetMap contrastado con PNOA, usado únicamente como emplazamiento de la obra imperial.',
    auditNotes: 'Se prohíbe convertir automáticamente la huella terminada en una fase completa de 1550.',
  },
  {
    id: 'gate.puerta-granadas',
    coordinates: [-3.5930761, 37.1760317],
    name: 'Puerta Imperial o de los Gómerez en construcción',
    function: 'Nuevo acceso monumental a la Alhambra',
    summary: 'La puerta trazada y cimentada entre 1545 y 1548 ya reorientaba el acceso imperial, pero carecía todavía de elementos concluidos después de 1550.',
    evidenceNote: 'El punto identifica la fábrica conservada; la fase se mantiene como obra en curso porque el escudo es de 1552 y la terminación general pertenece a la década de 1590.',
    category: 'walls_gates',
    subtype: 'imperial_gate',
    change: 'newly_built',
    physicalState: 'under_construction',
    citations: [{
      source_id: 'source.alhambra-puerta-granadas-study',
      locator: 'Resultados históricos de la intervención',
      supports: 'Traza y cimentación en 1545–1548, escudo en 1552 y terminación en la década de 1590.',
    }],
    aliases: ['Puerta de los Gómerez', 'Puerta Imperial'],
    searchTerms: ['Cuesta de Gomérez', 'Bosque de la Alhambra'],
    evidenceBasis: ['surviving_fabric', 'documentary', 'archaeology'],
    geometryMethod: 'modern_reference_location',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.alhambra-puerta-granadas-study'],
    auditMethod: 'Nodo moderno de OpenStreetMap contrastado con la fábrica visible en PNOA y el estudio de intervención del Patronato.',
    auditNotes: 'La localización es segura, pero el punto no describe la altura ni la ornamentación alcanzadas en 1550.',
  },
  {
    id: 'water.pilar-carlos-v',
    coordinates: [-3.5900663, 37.1758643],
    name: 'Pilar de Carlos V',
    function: 'Fuente monumental del nuevo acceso imperial',
    summary: 'El pilar ejecutado en 1545 combinaba abastecimiento, representación imperial y mitología junto a la Puerta de la Justicia.',
    evidenceNote: 'La fecha de ejecución y el elemento conservado permiten afirmar su presencia; se mantiene como punto hasta auditar dimensionalmente la fábrica de 1545.',
    category: 'water_infrastructure',
    subtype: 'monumental_fountain',
    change: 'newly_built',
    physicalState: 'complete',
    citations: [{
      source_id: 'source.alhambra-machuca-imperial-works',
      locator: 'Obras de Pedro Machuca en la Alhambra',
      supports: 'Diseño de Machuca y ejecución del Pilar de Carlos V por Nicolás de Corte en 1545.',
    }],
    aliases: ['Fuente de Carlos V'],
    searchTerms: ['Puerta de la Justicia', 'Alhambra', 'Plaza de la Explanada'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'modern_reference_location',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.alhambra-machuca-imperial-works'],
    auditMethod: 'Nodo moderno de OpenStreetMap contrastado con PNOA y la identificación institucional del pilar conservado.',
    auditNotes: 'La geometría es una referencia puntual y no una medición del frente arquitectónico.',
  },
  {
    id: 'religious.san-miguel-bajo',
    coordinates: [-3.5966982, 37.1806794],
    name: 'Iglesia de San Miguel Bajo',
    function: 'Parroquia cristiana sobre una antigua mezquita',
    summary: 'En 1550 estaba construida la primera mitad de la iglesia, mientras la segunda campaña documentada entre 1551 y 1556 aún no había comenzado.',
    evidenceNote: 'El corte temporal es excepcionalmente claro, pero se representa con un punto porque todavía no se ha aislado la huella exacta de la primera campaña.',
    category: 'religion_learning',
    subtype: 'parish_church',
    change: 'replaced',
    physicalState: 'partially_in_use',
    citations: [{
      source_id: 'source.granada-san-miguel-bajo',
      locator: 'Fases de 1528–1539 y 1551–1556',
      supports: 'Primera mitad construida antes de 1550 y segunda campaña iniciada al año siguiente.',
    }],
    aliases: ['San Miguel Bajo'],
    searchTerms: ['Placeta de San Miguel Bajo', 'Aljibe de San Miguel'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.granada-san-miguel-bajo'],
    auditMethod: 'Centro de la huella moderna de OpenStreetMap contrastado con PNOA y el punto de control independiente de San Miguel Bajo.',
    auditNotes: 'La futura fase poligonal deberá aislar la mitad construida en 1539 y no usar la iglesia completa.',
  },
  {
    id: 'religious.san-cristobal',
    coordinates: [-3.5964447, 37.1835775],
    name: 'Iglesia de San Cristóbal',
    function: 'Parroquia cristiana sobre una antigua mezquita',
    summary: 'San Cristóbal se encontraba dentro de la campaña de ampliación de 1540–1559, por lo que el edificio actual no puede presentarse como completamente existente en 1550.',
    evidenceNote: 'El emplazamiento y la campaña son seguros; el punto evita inventar el avance concreto de la ampliación a mitad de la obra.',
    category: 'religion_learning',
    subtype: 'parish_church',
    change: 'replaced',
    physicalState: 'under_construction',
    citations: [{
      source_id: 'source.granada-san-cristobal',
      locator: 'Descripción arquitectónica y ampliación de 1540–1559',
      supports: 'Sustitución de una mezquita y campaña activa alrededor de 1550.',
    }],
    aliases: ['San Cristóbal'],
    searchTerms: ['Carretera de Murcia', 'Mirador de San Cristóbal'],
    evidenceBasis: ['surviving_fabric', 'documentary'],
    geometryMethod: 'representative_point',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.granada-san-cristobal'],
    auditMethod: 'Centro de la huella moderna de OpenStreetMap contrastado con PNOA y la dirección institucional del templo.',
    auditNotes: 'No se atribuye al año 1550 el volumen completo ni las reformas posteriores de la iglesia.',
  },
  {
    id: 'gate.alhambra-justice',
    coordinates: [-3.5903595, 37.1761198],
    name: 'Puerta de la Justicia',
    function: 'Acceso nazarí retenido dentro del nuevo recorrido imperial',
    summary: 'La puerta nazarí seguía controlando el frente meridional de la Alhambra y quedó integrada en el recorrido monumental articulado por el nuevo pilar y la Puerta Imperial.',
    evidenceNote: 'La fábrica y localización son seguras; este estado registra su continuidad funcional sin confundirla con los elementos imperiales vecinos.',
    category: 'walls_gates',
    subtype: 'palatine_gate',
    change: 'retained',
    physicalState: 'complete',
    citations: [{
      source_id: 'source.alhambra-puerta-granadas-study',
      locator: 'Programa imperial de accesos a la Alhambra',
      supports: 'Integración de accesos heredados y nuevos en la transformación simbólica del recinto.',
    }],
    aliases: ['Bab al-Sharia', 'Puerta de la Explanada'],
    searchTerms: ['Alhambra', 'Pilar de Carlos V', 'Puerta de las Granadas'],
    evidenceBasis: ['surviving_fabric', 'documentary', 'archaeology'],
    geometryMethod: 'surviving_footprint',
    geometrySourceRefs: ['source.openstreetmap', 'source.pnoa-andalucia-2022', 'source.alhambra-puerta-granadas-study'],
    auditMethod: 'Reutilización del punto c. 1492 sobre la puerta conservada, con nueva comprobación de contexto mediante PNOA y la fuente del programa imperial.',
    auditNotes: 'La continuidad espacial se registra como una afirmación histórica independiente para c. 1550.',
  },
]

function buildPoint(seed: PointSeed) {
  return {
    type: 'Feature' as const,
    id: seed.id,
    properties: {
      id: seed.id,
      period_id: 'c1550',
      presence: 'present',
      temporal_confidence: seed.temporalConfidence ?? 'secure',
      spatial_confidence: seed.spatialConfidence ?? 'secure',
      change_from_previous: seed.change,
      physical_state: seed.physicalState,
      name: seed.name,
      function: seed.function,
      summary: seed.summary,
      evidence_note: seed.evidenceNote,
      geometry_variant_id: `c1550.${seed.id}`,
      citations: seed.citations,
      aliases: seed.aliases,
      modern_search_terms: seed.searchTerms,
      category: seed.category,
      subtype: seed.subtype,
      evidence_basis: seed.evidenceBasis,
      geometry_method: seed.geometryMethod ?? 'representative_point',
      geometry_source_refs: seed.geometrySourceRefs,
      publication_status: 'research',
    },
    geometry: {
      type: 'Point' as const,
      coordinates: seed.coordinates,
    },
  }
}

async function readLegacyFeatures() {
  const features: HistoricalFeature[] = []
  for (const layer of ['points', 'lines', 'areas']) {
    const path = resolve(repositoryRoot, `data/geo/${layer}.geojson`)
    const collection = featureCollectionSchema.parse(JSON.parse(await readFile(path, 'utf8')))
    features.push(...collection.features)
  }
  return new Map(features.map((feature) => [feature.id, feature]))
}

function periodFeature(
  legacy: HistoricalFeature,
  properties: Omit<PeriodHistoricalFeature['properties'], 'id' | 'period_id' | 'geometry_variant_id' | 'publication_status'>,
) {
  return {
    type: 'Feature' as const,
    id: legacy.id,
    properties: {
      id: legacy.id,
      period_id: 'c1550' as const,
      ...properties,
      geometry_variant_id: `c1550.${legacy.id}`,
      publication_status: 'research' as const,
    },
    geometry: legacy.geometry,
  }
}

async function writeNew(relativePath: string, value: unknown) {
  const path = resolve(repositoryRoot, relativePath)
  if (!force) {
    try {
      await access(path)
      throw new Error(`${relativePath} ya existe; la siembra inicial no sobrescribe trabajo de investigación.`)
    } catch (error) {
      if (error instanceof Error && !('code' in error)) throw error
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') throw error
    }
  }
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function seed() {
  const legacyById = await readLegacyFeatures()
  const legacy = (id: string) => {
    const feature = legacyById.get(id)
    if (!feature) throw new Error(`No existe la geometría base ${id}.`)
    return feature
  }

  const points = periodFeatureCollectionSchema.parse({
    type: 'FeatureCollection',
    period_id: 'c1550',
    features: pointSeeds.map(buildPoint),
  })

  const lines = periodFeatureCollectionSchema.parse({
    type: 'FeatureCollection',
    period_id: 'c1550',
    features: [periodFeature(legacy('walls.alhambra-perimeter'), {
      presence: 'present',
      temporal_confidence: 'secure',
      spatial_confidence: 'probable',
      change_from_previous: 'altered',
      physical_state: 'complete',
      name: 'Muralla de la Alhambra',
      function: 'Recinto palatino, militar y representativo bajo administración cristiana',
      summary: 'La muralla nazarí seguía definiendo la Casa Real de la Alhambra, con reparaciones y nuevas obras imperiales que modificaron puntos concretos sin borrar el perímetro general.',
      evidence_note: 'Se reutiliza provisionalmente la alineación de fábrica conservada; cada persistencia y reparación debe revisarse antes de promover el estado.',
      citations: [{
        source_id: 'source.alhambra-history',
        locator: 'Etapa cristiana de la Alhambra',
        supports: 'Continuidad del recinto como Casa Real y transformaciones después de 1492.',
      }],
      aliases: ['Recinto de la Alhambra', 'Cerca de la Casa Real'],
      modern_search_terms: ['Torres de la Alhambra', 'Camino de Ronda'],
      category: 'walls_gates',
      subtype: 'palatine_enclosure',
      evidence_basis: ['surviving_fabric', 'documentary', 'archaeology'],
      geometry_method: 'surviving_footprint',
      geometry_source_refs: [
        'source.openstreetmap',
        'source.pnoa-andalucia-2022',
        'source.alhambra-fortified-city-guide',
        'source.alhambra-history',
      ],
    })],
  })

  const areas = periodFeatureCollectionSchema.parse({
    type: 'FeatureCollection',
    period_id: 'c1550',
    features: [
      periodFeature(legacy('royal.alhambra'), {
        presence: 'present',
        temporal_confidence: 'secure',
        spatial_confidence: 'probable',
        change_from_previous: 'altered',
        physical_state: 'complete',
        name: 'Alhambra y Casa Real',
        function: 'Recinto palatino reutilizado y transformado por la monarquía',
        summary: 'La ciudad palatina nazarí seguía constituyendo la Casa Real, mientras nuevas obras como el palacio de Carlos V alteraban sectores concretos del conjunto.',
        evidence_note: 'El área conserva provisionalmente el recinto amurallado general; no supone que todas las dependencias nazaríes permanecieran intactas ni incluye la fase construida del nuevo palacio.',
        citations: [
          {
            source_id: 'source.alhambra-history',
            locator: 'Historia posterior a 1492',
            supports: 'Conversión de la Alhambra en Casa Real y continuidad del conjunto.',
          },
          {
            source_id: 'source.alhambra-charles-v-palace',
            locator: 'Secuencia de obras 1533–1550',
            supports: 'Inserción de la obra imperial dentro del recinto heredado.',
          },
        ],
        aliases: ['Casa Real de la Alhambra', 'Alhambra cristiana'],
        modern_search_terms: ['Palacios Nazaríes', 'Alcazaba', 'Palacio de Carlos V'],
        category: 'royal_elite',
        subtype: 'royal_complex',
        evidence_basis: ['surviving_fabric', 'documentary', 'archaeology'],
        geometry_method: 'surviving_footprint',
        geometry_source_refs: [
          'source.openstreetmap',
          'source.pnoa-andalucia-2022',
          'source.alhambra-fortified-city-guide',
          'source.alhambra-history',
        ],
      }),
      periodFeature(legacy('civic.maristan'), {
        presence: 'present',
        temporal_confidence: 'secure',
        spatial_confidence: 'probable',
        change_from_previous: 'converted',
        physical_state: 'complete',
        name: 'Real Casa de la Moneda (antiguo Maristán)',
        function: 'Ceca y espacio fabril de la monarquía',
        summary: 'El antiguo hospital nazarí funcionaba como Real Casa de la Moneda, con celdas reorganizadas, sala del Tesoro y espacios vinculados a la fundición.',
        evidence_note: 'La arqueología confirma la conversión desde 1497; se mantiene la envolvente arqueológica conocida sin inventar la distribución completa de talleres en 1550.',
        citations: [{
          source_id: 'source.alhambra-maristan-mint-2023',
          locator: 'Resumen y estudio de la adaptación fabril, pp. 139–155',
          supports: 'Conversión del Maristán en Casa de la Moneda desde 1497 y transformaciones materiales hasta 1685.',
        }],
        aliases: ['Casa de la Moneda', 'Ceca de Granada', 'Antiguo Maristán'],
        modern_search_terms: ['Calle Concepción de Zafra', 'Carrera del Darro'],
        category: 'commerce_civic',
        subtype: 'mint',
        evidence_basis: ['surviving_fabric', 'archaeology', 'documentary'],
        geometry_method: 'surviving_footprint',
        geometry_source_refs: [
          'source.openstreetmap',
          'source.pnoa-andalucia-2022',
          'source.alhambra-maristan',
          'source.alhambra-maristan-mint-2023',
        ],
      }),
    ],
  })

  const allFeatures = [...points.features, ...lines.features, ...areas.features]
  const auditMethods = new Map(pointSeeds.map((seed) => [seed.id, {
    method: seed.auditMethod,
    notes: seed.auditNotes,
  }]))
  auditMethods.set('walls.alhambra-perimeter', {
    method: 'Comparación de la alineación c. 1492 con la fábrica conservada y las fuentes de continuidad de la Casa Real; pendiente de revisar reparaciones del siglo XVI.',
    notes: 'La misma línea exige una auditoría temporal nueva porque su persistencia en 1550 es una afirmación histórica.',
  })
  auditMethods.set('royal.alhambra', {
    method: 'Revisión del recinto derivado de la muralla conservada frente a PNOA y a la historia institucional de la Casa Real, sin atribuir uniformidad interior.',
    notes: 'Área provisional de conjunto; el Palacio de Carlos V se representa aparte como obra en curso.',
  })
  auditMethods.set('civic.maristan', {
    method: 'Contraste de la envolvente arqueológica actual con la investigación de la adaptación del Maristán como ceca desde 1497.',
    notes: 'La envolvente es apta para revisión del sitio, no para inferir cada taller o muro interno de 1550.',
  })

  const audit = periodGeometryAuditSchema.parse(allFeatures.map((feature) => {
    const detail = auditMethods.get(feature.id)
    if (!detail) throw new Error(`Falta el método de auditoría de ${feature.id}.`)
    return {
      period_id: 'c1550',
      feature_id: feature.id,
      status: 'in_review',
      reviewed_on: null,
      geometry_source_refs: feature.properties.geometry_source_refs,
      check_method: detail.method,
      notes: detail.notes,
    }
  }))

  const includedFeatureIds = allFeatures.map((feature) => feature.id)
  const manifest = c1550ResearchPackageManifestSchema.parse({
    schema_version: 1,
    period_id: 'c1550',
    status: 'research',
    public_application_import: false,
    updated_on: '2026-10-01',
    crs: 'EPSG:4326',
    scope_note: 'Paquete inicial de geometría para revisión M10.2. No es una capa pública y no autoriza precisión superior a la expresada por cada método y confianza.',
    layers: [
      { geometry_type: 'point', path: 'data/research/c1550/points.geojson', feature_count: points.features.length },
      { geometry_type: 'line', path: 'data/research/c1550/lines.geojson', feature_count: lines.features.length },
      { geometry_type: 'area', path: 'data/research/c1550/areas.geojson', feature_count: areas.features.length },
    ],
    audit_path: 'data/research/c1550/geometry-audit.json',
    included_feature_ids: includedFeatureIds,
    geometry_rules: [
      'Una referencia moderna localiza un sitio; nunca demuestra por sí sola su huella o estado construido en 1550.',
      'La reutilización de una geometría c. 1492 exige una auditoría c. 1550 independiente y una fuente que sostenga la persistencia.',
      'Los edificios en construcción permanecen como puntos hasta que una planta de fases permita delimitar su fábrica hacia 1550.',
      'Ninguna geometría con estado de investigación se importa en la aplicación pública ni se sirve como dato publicado.',
    ],
    deferred_geometry: [
      {
        scope_id: 'defer.active-building-footprints',
        affected_feature_ids: [
          'religious.cathedral-granada',
          'civic.real-chancilleria',
          'civic.hospital-real',
          'royal.palace-charles-v',
          'gate.puerta-granadas',
          'religious.san-miguel-bajo',
          'religious.san-cristobal',
        ],
        reason: 'La huella actual no expresa qué partes estaban levantadas, en uso o decoradas exactamente hacia 1550.',
        release_condition: 'Incorporar plantas de fases georreferenciables y una revisión arquitectónica que separe campañas anteriores y posteriores.',
      },
      {
        scope_id: 'defer.completed-centre-footprints',
        affected_feature_ids: ['religious.royal-chapel', 'civic.lonja-mercaderes', 'religious.madraza-yusufiyya'],
        reason: 'La concentración de edificios adosados exige resolver contactos, anexos y transformaciones antes de dibujar polígonos independientes.',
        release_condition: 'Contrastar planimetría histórica, arqueología y parcela actual en un paquete específico del recinto catedralicio.',
      },
      {
        scope_id: 'defer.public-squares',
        affected_feature_ids: ['urban.plaza-bib-rambla', 'urban.campo-principe', 'urban.plaza-nueva'],
        reason: 'Las funciones y transformaciones están documentadas, pero las envolventes de 1550 no pueden copiarse de las plazas actuales.',
        release_condition: 'Aportar cartografía regresiva, documentación de alineaciones y una reconstrucción parcelaria reproducible.',
      },
      {
        scope_id: 'defer.citywide-population',
        affected_feature_ids: ['urban.albaicin', 'urban.lower-medina', 'urban.late-nasrid-extent'],
        reason: 'No existe todavía evidencia espacial suficiente para límites urbanos o de población morisca y cristiana con precisión poligonal.',
        release_condition: 'Definir una metodología demográfica y territorial revisada por especialistas, con fuentes espaciales explícitas y bordes inciertos.',
      },
      {
        scope_id: 'defer.parish-boundaries',
        affected_feature_ids: ['religious.salvador-collegiate', 'religious.albaicin-great-mosque'],
        reason: 'La existencia institucional no proporciona por sí sola límites parroquiales ni una planta segura de la transición mezquita-colegiata.',
        release_condition: 'Localizar fuentes de fábrica y jurisdicción suficientemente cercanas al corte 1540–1560 y separar entidad, uso y edificio.',
      },
      {
        scope_id: 'defer.infrastructure-change',
        affected_feature_ids: ['water.acequia-aynadamar', 'water.acequia-gorda', 'route.darro-axis'],
        reason: 'La continuidad general de acequias y calles no demuestra ramales, cruces, cubrimientos o alineaciones concretas de 1550.',
        release_condition: 'Reunir repartimientos, obras y cartografía histórica que permitan reconstruir variantes y no solo reutilizar c. 1492.',
      },
    ],
  })

  await mkdir(outputDirectory, { recursive: true })
  await writeNew('data/research/c1550/points.geojson', points)
  await writeNew('data/research/c1550/lines.geojson', lines)
  await writeNew('data/research/c1550/areas.geojson', areas)
  await writeNew('data/research/c1550/geometry-audit.json', audit)
  await writeNew('data/research/c1550/manifest.json', manifest)

  console.log(`Paquete M10.2 sembrado: ${points.features.length} puntos, ${lines.features.length} líneas y ${areas.features.length} áreas; todo permanece en investigación.`)
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
