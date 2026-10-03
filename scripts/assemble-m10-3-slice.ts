import { access, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  c1550ResearchInventorySchema,
  c1550ResearchPackageManifestSchema,
  c1550VerticalSliceReviewSchema,
  M10_3_FEATURE_IDS,
  periodFeatureCollectionSchema,
  periodGeometryAuditSchema,
  periodHistoricalFeatureSchema,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const force = process.argv.includes('--force')
const reviewPath = 'data/research/c1550/m10.3-review.json'

const mosqueFeature = periodHistoricalFeatureSchema.parse({
  type: 'Feature',
  id: 'religious.medina-great-mosque',
  properties: {
    id: 'religious.medina-great-mosque',
    period_id: 'c1550',
    presence: 'present',
    temporal_confidence: 'secure',
    spatial_confidence: 'secure',
    change_from_previous: 'converted',
    physical_state: 'complete',
    name: 'Sagrario catedralicio (antigua Mezquita Mayor)',
    function: 'Templo islámico convertido al culto cristiano y vinculado a la Catedral',
    summary: 'La fábrica de la antigua mezquita seguía en pie y convertida en Sagrario catedralicio mientras la nueva Catedral renacentista avanzaba a su lado.',
    evidence_note: 'Las fuentes documentan el uso catedralicio del edificio en 1526 y su pervivencia hasta el derribo iniciado en 1704. Se conserva el punto del solar, no se digitaliza todavía la planta publicada de 1705.',
    geometry_variant_id: 'c1550.religious.medina-great-mosque',
    citations: [
      {
        source_id: 'source.granada-sagrario',
        locator: 'Descripción histórica de la Iglesia del Sagrario',
        supports: 'La antigua Mezquita Mayor albergaba la Catedral granadina en 1526.',
      },
      {
        source_id: 'source.ugr-aljama-mosque-2004',
        locator: 'Resumen y reconstrucción documental hasta el plano de 1705',
        supports: 'Pervivencia de la fábrica convertida y delimitación histórica del edificio anterior al Sagrario barroco.',
      },
    ],
    aliases: ['Mezquita aljama', 'Sagrario antiguo', 'Iglesia Mayor vieja'],
    modern_search_terms: ['Iglesia del Sagrario', 'Catedral de Granada', 'Plaza Alonso Cano'],
    category: 'religion_learning',
    subtype: 'converted_congregational_mosque',
    evidence_basis: ['documentary', 'historical_cartography', 'scholarly_reconstruction'],
    geometry_method: 'modern_reference_location',
    geometry_source_refs: [
      'source.granada-sagrario',
      'source.ugr-aljama-mosque-2004',
      'source.openstreetmap',
      'source.pnoa-andalucia-2022',
    ],
    publication_status: 'research',
  },
  geometry: {
    type: 'Point',
    coordinates: [-3.5990298, 37.1759292],
  },
})

const universityFeature = periodHistoricalFeatureSchema.parse({
  type: 'Feature',
  id: 'civic.university-curia',
  properties: {
    id: 'civic.university-curia',
    period_id: 'c1550',
    presence: 'present',
    temporal_confidence: 'secure',
    spatial_confidence: 'probable',
    change_from_previous: 'newly_built',
    physical_state: 'complete',
    name: 'Universidad y Colegio Real de Santa Cruz de la Fe',
    function: 'Sede universitaria y colegial vinculada al programa imperial y eclesiástico',
    summary: 'La Universidad se había trasladado en 1538 al edificio hoy conocido como Curia eclesiástica, frente al nuevo conjunto catedralicio.',
    evidence_note: 'La institución, el traslado y el edificio renacentista están documentados. El nombre Curia se mantiene solo como referencia moderna; un punto evita confundir el inmueble de 1550 con sus uniones y reformas posteriores.',
    geometry_variant_id: 'c1550.civic.university-curia',
    citations: [
      {
        source_id: 'source.ugr-history-timeline',
        locator: 'Fundación, primeros actos y traslado de 1538',
        supports: 'Funcionamiento de la Universidad en el edificio de la actual Curia desde 1538.',
      },
      {
        source_id: 'source.ugr-old-university-building-1975',
        locator: 'Fundación y emplazamiento, pp. 113–124',
        supports: 'Construcción, emplazamiento frente a la Iglesia Mayor e intervenciones arquitectónicas del edificio.',
      },
    ],
    aliases: ['Antigua Universidad', 'Colegio Real de Santa Cruz de la Fe', 'Actual Curia eclesiástica'],
    modern_search_terms: ['Plaza Alonso Cano', 'Curia Metropolitana', 'Palacio Arzobispal'],
    category: 'religion_learning',
    subtype: 'university_college',
    evidence_basis: ['surviving_fabric', 'documentary', 'scholarly_reconstruction'],
    geometry_method: 'representative_point',
    geometry_source_refs: [
      'source.openstreetmap',
      'source.pnoa-andalucia-2022',
      'source.ugr-history-timeline',
      'source.ugr-old-university-building-1975',
    ],
    publication_status: 'research',
  },
  geometry: {
    type: 'Point',
    coordinates: [-3.5997, 37.1757],
  },
})

const review = c1550VerticalSliceReviewSchema.parse({
  schema_version: 1,
  milestone: 'M10.3',
  period_id: 'c1550',
  status: 'ready_for_specialist_review',
  public_application_import: false,
  updated_on: '2026-10-01',
  scope_note: 'Ocho entidades en dos conjuntos para revisión histórica, arquitectónica, geométrica y bilingüe antes de cualquier promoción o uso público.',
  feature_ids: M10_3_FEATURE_IDS,
  items: [
    {
      feature_id: 'religious.medina-great-mosque',
      cluster: 'cathedral_precinct',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Sagrario catedralicio (antigua Mezquita Mayor)',
          function: 'Templo convertido al culto cristiano y vinculado a la Catedral',
          summary: 'Hacia 1550 la antigua mezquita no había desaparecido: su fábrica convertida seguía sirviendo al culto cristiano mientras la nueva Catedral crecía junto a ella.',
          evidence_note: 'La recepción imperial de 1526 se produjo en la Catedral instalada en la antigua mezquita. El estudio de su planta utiliza testimonios hasta 1705, cuando comenzó su sustitución por el Sagrario barroco.',
          change_note: 'Desde 1492 cambió radicalmente el régimen religioso y el uso del edificio, pero la continuidad material impide representarlo como una demolición inmediata.',
        },
        en: {
          name: 'Cathedral Sagrario (former Great Mosque)',
          function: 'Converted Islamic building used for Christian worship and attached to the cathedral institution',
          summary: 'Around 1550 the former mosque had not vanished: its converted fabric still served Christian worship while the new Cathedral rose beside it.',
          evidence_note: 'The imperial reception of 1526 took place at the Cathedral housed in the former mosque. The plan study uses evidence through 1705, when replacement by the Baroque Sagrario began.',
          change_note: 'The building’s religious regime and function changed radically after 1492, but its material continuity rules out depicting an immediate demolition.',
        },
      },
      claims: [
        {
          claim_id: 'claim.mosque-converted-survival',
          topic: 'transformation',
          text: {
            es: 'La antigua mezquita seguía materialmente presente y convertida al culto cristiano hacia 1550.',
            en: 'The former mosque remained materially present and converted to Christian worship around 1550.',
          },
          citations: [
            { source_id: 'source.granada-sagrario', locator: 'Descripción histórica', supports: 'Uso catedralicio documentado en 1526.' },
            { source_id: 'source.ugr-aljama-mosque-2004', locator: 'Resumen y plano de 1705', supports: 'Pervivencia del edificio convertido hasta comienzos del siglo XVIII.' },
          ],
        },
        {
          claim_id: 'claim.mosque-point-limit',
          topic: 'geometry',
          text: {
            es: 'El punto identifica el solar; no reproduce la planta histórica publicada ni el Sagrario actual.',
            en: 'The point identifies the site; it reproduces neither the published historical plan nor the present Sagrario.',
          },
          citations: [{ source_id: 'source.ugr-aljama-mosque-2004', locator: 'Metodología de restitución', supports: 'Existencia de una restitución planimétrica que requiere georreferenciación separada.' }],
        },
      ],
      relationships: [{
        relation: 'adjacent_to',
        target_id: 'religious.cathedral-granada',
        note: {
          es: 'El templo convertido y la Catedral nueva coexistían; no son una sola huella ni una sustitución instantánea.',
          en: 'The converted building and the new Cathedral coexisted; they are neither one footprint nor an instantaneous replacement.',
        },
      }],
      geometry_review: {
        representation: 'retained_site_point',
        audit_status: 'in_review',
        decision: {
          es: 'Se reutiliza el punto c. 1492 como referencia estable del solar hasta georreferenciar la restitución publicada.',
          en: 'The 1492 point is retained as a stable site reference until the published reconstruction can be georeferenced.',
        },
        overlap_resolution: {
          es: 'La coexistencia con la Catedral se expresa mediante relación y texto, no mediante polígonos que fingirían límites todavía no auditados.',
          en: 'Coexistence with the Cathedral is expressed through a relationship and text, not polygons that would feign unaudited boundaries.',
        },
      },
    },
    {
      feature_id: 'religious.cathedral-granada',
      cluster: 'cathedral_precinct',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Catedral de Granada',
          function: 'Nueva iglesia catedralicia y proyecto imperial activo',
          summary: 'La Catedral iniciada formalmente en 1523 y rediseñada por Diego de Siloé desde 1528 seguía siendo una gran obra en curso hacia 1550.',
          evidence_note: 'La Real Cédula de 1521 documenta la preparación hidráulica y urbana del solar. La huella actual no permite aislar por sí sola la fábrica terminada a mediados de siglo.',
          change_note: 'La institución catedralicia trasladaba progresivamente su centralidad desde el edificio convertido de la antigua mezquita hacia el nuevo templo renacentista.',
        },
        en: {
          name: 'Granada Cathedral',
          function: 'New cathedral church and active imperial building project',
          summary: 'The Cathedral formally begun in 1523 and redesigned by Diego de Siloé from 1528 remained a major building site around 1550.',
          evidence_note: 'The Royal Warrant of 1521 documents hydraulic and urban preparation of the site. The present footprint alone cannot isolate the fabric completed by mid-century.',
          change_note: 'The cathedral institution was gradually shifting its centre from the converted former mosque to the new Renaissance church.',
        },
      },
      claims: [
        {
          claim_id: 'claim.cathedral-active-worksite',
          topic: 'chronology',
          text: {
            es: 'La primera piedra se colocó en 1523 y el proyecto renacentista de Siloé comenzó en 1528.',
            en: 'The foundation stone was laid in 1523 and Siloé’s Renaissance project began in 1528.',
          },
          citations: [
            { source_id: 'source.granada-archive-cathedral-1521', locator: 'Comentario a la Real Cédula', supports: 'Preparación del solar, expropiaciones y primera piedra de 1523.' },
            { source_id: 'source.granada-cathedral', locator: 'Historia institucional', supports: 'Proyecto catedralicio e imperial sobre el centro religioso anterior.' },
          ],
        },
        {
          claim_id: 'claim.cathedral-footprint-deferred',
          topic: 'geometry',
          text: {
            es: 'La fase construida en 1550 no puede equipararse a la planta completa conservada.',
            en: 'The fabric built by 1550 cannot be equated with the complete surviving plan.',
          },
          citations: [{ source_id: 'source.granada-archive-cathedral-1521', locator: 'Orden de desvío de la acequia', supports: 'La obra exigía transformar infraestructuras y solares antes de levantar el edificio.' }],
        },
      ],
      relationships: [{
        relation: 'replaces_function_of',
        target_id: 'religious.medina-great-mosque',
        note: {
          es: 'La Catedral nueva sucede funcionalmente al templo convertido, aunque ambos edificios coexistían materialmente en 1550.',
          en: 'The new Cathedral functionally succeeded the converted building, although both materially coexisted in 1550.',
        },
      }],
      geometry_review: {
        representation: 'reference_point',
        audit_status: 'in_review',
        decision: {
          es: 'Se mantiene un punto del solar hasta contar con una planta de fases georreferenciable y revisada.',
          en: 'A site point is retained until a reviewable, georeferenceable phase plan is available.',
        },
        overlap_resolution: {
          es: 'La relación funcional con la mezquita convertida se declara sin superponer la huella terminada de la Catedral.',
          en: 'The functional relationship with the converted mosque is stated without overlaying the Cathedral’s finished footprint.',
        },
      },
    },
    {
      feature_id: 'religious.royal-chapel',
      cluster: 'cathedral_precinct',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Capilla Real',
          function: 'Panteón dinástico e institución religiosa regia',
          summary: 'La capilla gótica estaba terminada, equipada y en uso como panteón real mucho antes del corte de 1550.',
          evidence_note: 'La institución fecha la construcción entre 1505 y 1517 y el traslado de los restos regios en 1521. Sus contactos con edificios vecinos requieren una lectura de fases.',
          change_note: 'Era una entidad nueva respecto a 1492 y una pieza ya completa dentro del complejo cristiano todavía en formación.',
        },
        en: {
          name: 'Royal Chapel',
          function: 'Dynastic mausoleum and royal religious institution',
          summary: 'The Gothic chapel was complete, furnished, and operating as a royal mausoleum well before the 1550 cut.',
          evidence_note: 'The institution dates construction to 1505–1517 and the transfer of the royal remains to 1521. Its junctions with neighbouring buildings still require phase analysis.',
          change_note: 'It was new relative to 1492 and already complete within a Christian complex that was still taking shape.',
        },
      },
      claims: [
        {
          claim_id: 'claim.chapel-complete',
          topic: 'chronology',
          text: {
            es: 'La Capilla Real estaba construida y plenamente activa antes de 1550.',
            en: 'The Royal Chapel was built and fully active before 1550.',
          },
          citations: [
            { source_id: 'source.royal-chapel-history', locator: 'Quinientos años de historia', supports: 'Construcción entre 1505 y 1517 y plenitud en el siglo XVI.' },
            { source_id: 'source.junta-granada-tourism-plan', locator: 'Ficha de la Capilla Real', supports: 'Cronología 1504–1521 y terminación del edificio.' },
          ],
        },
        {
          claim_id: 'claim.chapel-junctions',
          topic: 'geometry',
          text: {
            es: 'La capilla debe distinguirse de la Catedral, el Sagrario y la Lonja aunque esté físicamente adosada a ellos.',
            en: 'The chapel must remain distinct from the Cathedral, Sagrario, and Exchange even though it is physically attached to them.',
          },
          citations: [{ source_id: 'source.junta-granada-tourism-plan', locator: 'Descripción exterior', supports: 'Tres lados adosados a Catedral, Sagrario y Lonja.' }],
        },
      ],
      relationships: [{
        relation: 'attached_to',
        target_id: 'civic.lonja-mercaderes',
        note: {
          es: 'Son edificios y funciones distintos; la planta superior de la Lonja servía como anexo de la Capilla.',
          en: 'They are distinct buildings and functions; the Exchange’s upper floor served as an annex to the Chapel.',
        },
      }],
      geometry_review: {
        representation: 'reference_point',
        audit_status: 'in_review',
        decision: {
          es: 'El punto identifica el edificio completo sin atribuir a 1550 todos los contactos y anexos visibles hoy.',
          en: 'The point identifies the completed building without assigning every present junction and annex to 1550.',
        },
        overlap_resolution: {
          es: 'La relación con la Lonja se expresa como adosamiento funcional y material, no como dos polígonos modernos solapados.',
          en: 'The relationship with the Exchange is expressed as functional and material attachment, not as two overlapping modern polygons.',
        },
      },
    },
    {
      feature_id: 'civic.lonja-mercaderes',
      cluster: 'cathedral_precinct',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Lonja de Mercaderes',
          function: 'Intercambio mercantil en planta baja y dependencias de la Capilla Real arriba',
          summary: 'La Lonja construida en 1518 combinaba actividad comercial y financiera con espacios capitulares ligados a la Capilla Real.',
          evidence_note: 'La cronología y el reparto vertical de usos están documentados por el Ayuntamiento; queda pendiente revisar una huella histórica independiente.',
          change_note: 'Introdujo un edificio comercial cristiano nuevo en el borde del antiguo núcleo religioso y mercantil nazarí.',
        },
        en: {
          name: 'Merchants’ Exchange',
          function: 'Commercial exchange below and Royal Chapel rooms above',
          summary: 'The Exchange built in 1518 combined commercial and financial activity with upper rooms tied to the Royal Chapel.',
          evidence_note: 'The date and vertical division of uses are documented by the City Council; an independent historical footprint still requires review.',
          change_note: 'It introduced a new Christian commercial building at the edge of the former Nasrid religious and mercantile core.',
        },
      },
      claims: [
        {
          claim_id: 'claim.lonja-built-use',
          topic: 'function',
          text: {
            es: 'La Lonja estaba construida y combinaba usos mercantiles y capitulares hacia 1550.',
            en: 'The Exchange was complete and combined mercantile and chapter uses around 1550.',
          },
          citations: [{ source_id: 'source.granada-lonja-mercaderes', locator: 'Descripción del edificio', supports: 'Construcción en 1518 y división de usos entre plantas.' }],
        },
        {
          claim_id: 'claim.lonja-location-limit',
          topic: 'geometry',
          text: {
            es: 'El punto de Calle Oficios es una referencia probable y no una huella histórica auditada.',
            en: 'The Calle Oficios point is a probable reference, not an audited historical footprint.',
          },
          citations: [{ source_id: 'source.granada-lonja-mercaderes', locator: 'Dirección y descripción', supports: 'Localización institucional y relación con la Capilla Real.' }],
        },
      ],
      relationships: [{
        relation: 'attached_to',
        target_id: 'religious.royal-chapel',
        note: {
          es: 'La planta superior pertenecía funcionalmente a la Capilla Real; la planta baja mantenía su identidad mercantil.',
          en: 'The upper floor functionally belonged to the Royal Chapel while the ground floor retained its mercantile identity.',
        },
      }],
      geometry_review: {
        representation: 'reference_point',
        audit_status: 'in_review',
        decision: {
          es: 'Se conserva el punto probable de Calle Oficios hasta revisar parcela, medianeras y fases.',
          en: 'The probable Calle Oficios point is retained pending review of parcel, party walls, and phases.',
        },
        overlap_resolution: {
          es: 'El uso compartido con la Capilla se modela como relación vertical, evitando fusionar ambas entidades.',
          en: 'Shared use with the Chapel is modelled as a vertical relationship without merging the two entities.',
        },
      },
    },
    {
      feature_id: 'religious.madraza-yusufiyya',
      cluster: 'cathedral_precinct',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Casa del Cabildo (antigua Madraza Yusufiyya)',
          function: 'Sede municipal adaptada dentro de un edificio nazarí',
          summary: 'La antigua institución docente se había convertido en Casa del Cabildo, conservando y transformando fábrica nazarí dentro del nuevo centro cristiano.',
          evidence_note: 'La UGR fecha la cesión al Cabildo en 1501 y la primera reforma entre 1501 y 1513. La remodelación barroca pertenece a una fase posterior.',
          change_note: 'El mismo edificio cambió de institución, autoridad y uso; no debe duplicarse como una entidad nueva sin relación material.',
        },
        en: {
          name: 'Chapter House (former Yusufiyya Madrasa)',
          function: 'Municipal headquarters adapted within a Nasrid building',
          summary: 'The former teaching institution had become the Council House, retaining and transforming Nasrid fabric within the new Christian centre.',
          evidence_note: 'The UGR dates transfer to the Council to 1501 and the first remodelling to 1501–1513. The Baroque rebuilding belongs to a later phase.',
          change_note: 'The same building changed institution, authority, and use; it must not be duplicated as an unrelated new entity.',
        },
      },
      claims: [
        {
          claim_id: 'claim.madraza-cabildo',
          topic: 'transformation',
          text: {
            es: 'La Madraza fue cedida al Cabildo y adaptada sin borrar toda su estructura anterior.',
            en: 'The Madrasa was transferred to the Council and adapted without erasing all of its earlier structure.',
          },
          citations: [{ source_id: 'source.ugr-madraza', locator: 'Etapas constructivas', supports: 'Cesión de 1501 y reforma de 1501–1513 sin alterar la estructura general.' }],
        },
        {
          claim_id: 'claim.madraza-baroque-excluded',
          topic: 'chronology',
          text: {
            es: 'La fachada y ampliaciones barrocas del siglo XVIII no pertenecen al estado de 1550.',
            en: 'The eighteenth-century Baroque façade and enlargements do not belong to the 1550 state.',
          },
          citations: [{ source_id: 'source.ugr-madraza', locator: 'Reformas posteriores', supports: 'Barroquización fechada entre 1722 y 1729.' }],
        },
      ],
      relationships: [{
        relation: 'adjacent_to',
        target_id: 'religious.royal-chapel',
        note: {
          es: 'La sede municipal formaba parte del mismo frente institucional, pero seguía siendo un edificio y una autoridad distintos.',
          en: 'The municipal headquarters belonged to the same institutional frontage but remained a distinct building and authority.',
        },
      }],
      geometry_review: {
        representation: 'retained_site_point',
        audit_status: 'in_review',
        decision: {
          es: 'Se mantiene el punto del inmueble y se excluye la falsa precisión de su envolvente barroca actual.',
          en: 'The building point is retained while the false precision of its present Baroque envelope is excluded.',
        },
        overlap_resolution: {
          es: 'La continuidad material se expresa dentro de una sola entidad con cambio de función, no con Madraza y Cabildo superpuestos.',
          en: 'Material continuity is expressed within one entity through a functional change, not overlapping Madrasa and Council entities.',
        },
      },
    },
    {
      feature_id: 'civic.university-curia',
      cluster: 'cathedral_precinct',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Universidad y Colegio Real de Santa Cruz de la Fe',
          function: 'Sede universitaria y colegial del programa imperial y eclesiástico',
          summary: 'La Universidad fundada en 1531 funcionaba desde 1538 en el edificio hoy denominado Curia eclesiástica, frente al conjunto catedralicio.',
          evidence_note: 'La cronología institucional y el edificio están documentados. En 1550 no era todavía la Curia: esa denominación se usa únicamente como referencia moderna.',
          change_note: 'Era una institución y un inmueble nuevos respecto a 1492, insertos en la reorganización cristiana del centro urbano.',
        },
        en: {
          name: 'University and Royal College of Santa Cruz de la Fe',
          function: 'University and college serving the imperial and ecclesiastical programme',
          summary: 'The University founded in 1531 had occupied the building now known as the ecclesiastical Curia since 1538, opposite the cathedral complex.',
          evidence_note: 'Both institutional chronology and building are documented. In 1550 it was not yet the Curia; that name is used only as a modern locator.',
          change_note: 'It was a new institution and building relative to 1492, embedded in the Christian reorganisation of the city centre.',
        },
      },
      claims: [
        {
          claim_id: 'claim.university-occupied-1538',
          topic: 'chronology',
          text: {
            es: 'La Universidad y sus colegios se trasladaron a este edificio en 1538 y seguían allí en 1550.',
            en: 'The University and its colleges moved to this building in 1538 and remained there in 1550.',
          },
          citations: [{ source_id: 'source.ugr-history-timeline', locator: 'Cronología 1525–1538', supports: 'Fundación, primeros actos y traslado de 1538.' }],
        },
        {
          claim_id: 'claim.university-building-phase',
          topic: 'geometry',
          text: {
            es: 'El edificio renacentista existía, pero su unión posterior con el Palacio Arzobispal no debe proyectarse hacia 1550.',
            en: 'The Renaissance building existed, but its later union with the Archbishop’s Palace must not be projected back to 1550.',
          },
          citations: [{ source_id: 'source.ugr-old-university-building-1975', locator: 'Fundación, emplazamiento y fábrica', supports: 'Emplazamiento, construcción e intervenciones arquitectónicas del edificio universitario.' }],
        },
      ],
      relationships: [{
        relation: 'adjacent_to',
        target_id: 'religious.cathedral-granada',
        note: {
          es: 'La sede universitaria se situaba frente al conjunto catedralicio y reforzaba su nueva centralidad institucional.',
          en: 'The university building stood opposite the cathedral complex and reinforced its new institutional centrality.',
        },
      }],
      geometry_review: {
        representation: 'reference_point',
        audit_status: 'in_review',
        decision: {
          es: 'El punto localiza el edificio histórico sin adoptar la manzana unificada ni las reformas posteriores como huella de 1550.',
          en: 'The point locates the historic building without adopting the later unified block and alterations as its 1550 footprint.',
        },
        overlap_resolution: {
          es: 'Universidad y Colegio se agrupan como usos coetáneos del mismo inmueble; Curia queda como referencia moderna, no como función de 1550.',
          en: 'University and College are grouped as contemporary uses of one building; Curia remains a modern locator, not a 1550 function.',
        },
      },
    },
    {
      feature_id: 'royal.palace-charles-v',
      cluster: 'imperial_access',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Palacio de Carlos V',
          function: 'Nueva residencia imperial dentro de la Casa Real de la Alhambra',
          summary: 'La obra iniciada en 1533 había alcanzado el segundo piso en 1550, pero el palacio estaba lejos de corresponder al edificio terminado que hoy se reconoce.',
          evidence_note: 'El Patronato documenta la cimentación del patio en 1540, la cripta de la capilla en 1542 y el segundo piso en 1550. Falta una planta de fase georreferenciada.',
          change_note: 'El palacio era una inserción imperial nueva que alteraba material y simbólicamente el recinto palatino heredado.',
        },
        en: {
          name: 'Palace of Charles V',
          function: 'New imperial residence within the Alhambra Royal House',
          summary: 'Work begun in 1533 had reached the second storey by 1550, but the palace was far from the completed building recognised today.',
          evidence_note: 'The Patronato documents the courtyard foundations in 1540, the chapel crypt in 1542, and the second storey in 1550. A georeferenced phase plan is still lacking.',
          change_note: 'The palace was a new imperial insertion that materially and symbolically altered the inherited palatine enclosure.',
        },
      },
      claims: [
        {
          claim_id: 'claim.palace-second-storey',
          topic: 'chronology',
          text: {
            es: 'En 1550 se había levantado el segundo piso, sin que ello equivalga a un palacio terminado.',
            en: 'The second storey had been raised by 1550, without implying a completed palace.',
          },
          citations: [{ source_id: 'source.alhambra-charles-v-palace', locator: 'Secuencia de obra 1533–1550', supports: 'Inicio, patio, cripta y segundo piso levantado en 1550.' }],
        },
        {
          claim_id: 'claim.palace-inside-alhambra',
          topic: 'transformation',
          text: {
            es: 'La obra imperial se insertó dentro de la Alhambra y alteró sectores concretos sin sustituir todo el conjunto.',
            en: 'The imperial work was inserted within the Alhambra and altered particular sectors without replacing the whole complex.',
          },
          citations: [{ source_id: 'source.alhambra-machuca-imperial-works', locator: 'Programa imperial de Machuca', supports: 'Relación entre el nuevo palacio, el pilar y el programa imperial de la Alhambra.' }],
        },
      ],
      relationships: [{
        relation: 'contained_by',
        target_id: 'royal.alhambra',
        note: {
          es: 'El palacio nuevo se representa como una obra específica dentro de la Casa Real heredada, no como sustituto del recinto completo.',
          en: 'The new palace is represented as a specific work within the inherited Royal House, not as a replacement for the entire enclosure.',
        },
      }],
      geometry_review: {
        representation: 'reference_point',
        audit_status: 'in_review',
        decision: {
          es: 'El punto localiza la obra; se rechaza usar la huella terminada hasta revisar una planimetría de fases.',
          en: 'The point locates the works; use of the completed footprint is rejected pending phase-plan review.',
        },
        overlap_resolution: {
          es: 'La relación de contención con la Alhambra hace visible la inserción sin borrar la continuidad del recinto nazarí.',
          en: 'Containment within the Alhambra makes the insertion visible without erasing continuity of the Nasrid enclosure.',
        },
      },
    },
    {
      feature_id: 'gate.puerta-granadas',
      cluster: 'imperial_access',
      readiness: 'ready_for_specialist_review',
      content: {
        es: {
          name: 'Puerta de las Granadas',
          function: 'Nuevo umbral monumental del acceso imperial a la Alhambra',
          summary: 'La puerta trazada y cimentada entre 1545 y 1548 ya transformaba el acceso, pero en 1550 aún no tenía el escudo de 1552 ni su terminación de la década de 1590.',
          evidence_note: 'La intervención arquitectónica permite fechar con precisión las campañas. El punto fija el emplazamiento, no la altura ni la decoración alcanzadas en el corte temporal.',
          change_note: 'El nuevo umbral reorientó el acceso representativo hacia las puertas nazaríes retenidas y las obras imperiales del recinto.',
        },
        en: {
          name: 'Gate of the Pomegranates',
          function: 'New monumental threshold on the imperial approach to the Alhambra',
          summary: 'The gate laid out and founded between 1545 and 1548 was already reshaping the approach, but in 1550 it lacked the shield of 1552 and its 1590s completion.',
          evidence_note: 'Architectural intervention dates the campaigns closely. The point fixes the site, not the height or decoration reached at the temporal cut.',
          change_note: 'The new threshold redirected the ceremonial approach toward retained Nasrid gates and imperial works within the enclosure.',
        },
      },
      claims: [
        {
          claim_id: 'claim.granadas-foundations',
          topic: 'chronology',
          text: {
            es: 'La traza y cimentación son de 1545–1548, pero la puerta no estaba terminada en 1550.',
            en: 'The design and foundations date to 1545–1548, but the gate was not complete in 1550.',
          },
          citations: [{ source_id: 'source.alhambra-puerta-granadas-study', locator: 'Resultados de la intervención', supports: 'Traza y cimentación, escudo de 1552 y terminación en la década de 1590.' }],
        },
        {
          claim_id: 'claim.granadas-route',
          topic: 'interpretation',
          text: {
            es: 'La puerta articulaba un acceso imperial nuevo sin eliminar las puertas nazaríes interiores.',
            en: 'The gate articulated a new imperial approach without eliminating the inner Nasrid gates.',
          },
          citations: [{ source_id: 'source.alhambra-puerta-granadas-study', locator: 'Programa simbólico y acceso', supports: 'Función monumental de la puerta dentro del programa imperial.' }],
        },
      ],
      relationships: [{
        relation: 'routes_toward',
        target_id: 'gate.alhambra-justice',
        note: {
          es: 'El acceso nuevo conducía hacia la Puerta de la Justicia, que seguía siendo una entidad nazarí distinta y retenida.',
          en: 'The new approach led toward the Gate of Justice, which remained a distinct retained Nasrid entity.',
        },
      }],
      geometry_review: {
        representation: 'reference_point',
        audit_status: 'in_review',
        decision: {
          es: 'El punto de la fábrica conservada es seguro como emplazamiento, pero no reconstruye la elevación incompleta de 1550.',
          en: 'The point on the surviving fabric securely locates the site but does not reconstruct the incomplete 1550 elevation.',
        },
        overlap_resolution: {
          es: 'La relación de ruta mantiene separadas la puerta imperial exterior y la Puerta de la Justicia nazarí interior.',
          en: 'The route relationship keeps the outer imperial gate distinct from the inner Nasrid Gate of Justice.',
        },
      },
    },
  ],
  signoffs: [
    {
      discipline: 'historical',
      status: 'pending',
      reviewer_name: null,
      reviewer_role: null,
      reviewed_on: null,
      notes: 'Pendiente de revisión explícita por la persona responsable de historia del proyecto; no requiere una entidad o contraparte externa.',
    },
    {
      discipline: 'architectural',
      status: 'pending',
      reviewer_name: null,
      reviewer_role: null,
      reviewed_on: null,
      notes: 'Pendiente de revisión arquitectónica de fases, contactos constructivos y exclusión de fábricas posteriores.',
    },
    {
      discipline: 'geometry',
      status: 'pending',
      reviewer_name: null,
      reviewer_role: null,
      reviewed_on: null,
      notes: 'Pendiente de aprobar los puntos de referencia y decidir qué plantas publicadas pueden georreferenciarse sin falsa precisión.',
    },
    {
      discipline: 'translation',
      status: 'pending',
      reviewer_name: null,
      reviewer_role: null,
      reviewed_on: null,
      notes: 'El contenido español e inglés está completo, pero requiere revisión editorial bilingüe antes de marcarse como reviewed.',
    },
  ],
})

async function readJson(relativePath: string) {
  return JSON.parse(await readFile(resolve(repositoryRoot, relativePath), 'utf8')) as unknown
}

async function writeJson(relativePath: string, value: unknown) {
  await writeFile(resolve(repositoryRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function addUnique(values: string[], additions: readonly string[]) {
  return [...new Set([...values, ...additions])]
}

async function assemble() {
  if (!force) {
    try {
      await access(resolve(repositoryRoot, reviewPath))
      throw new Error(`${reviewPath} ya existe; usa --force solo para reconstruir deliberadamente el dossier.`)
    } catch (error) {
      if (error instanceof Error && !('code' in error)) throw error
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') throw error
    }
  }

  const points = periodFeatureCollectionSchema.parse(await readJson('data/research/c1550/points.geojson'))
  for (const feature of [mosqueFeature, universityFeature]) {
    if (!points.features.some((existing) => existing.id === feature.id)) points.features.push(feature)
  }
  const pointById = new Map(points.features.map((feature) => [feature.id, feature]))
  for (const item of review.items) {
    const feature = pointById.get(item.feature_id)
    if (!feature) throw new Error(`El corte M10.3 requiere el punto ${item.feature_id}.`)
    feature.properties.name = item.content.es.name
    feature.properties.function = item.content.es.function
    feature.properties.summary = item.content.es.summary
    feature.properties.evidence_note = item.content.es.evidence_note
    const citations = item.claims.flatMap((claim) => claim.citations)
    feature.properties.citations = citations.filter((citation, index) => (
      citations.findIndex((candidate) => (
        candidate.source_id === citation.source_id
        && candidate.locator === citation.locator
        && candidate.supports === citation.supports
      )) === index
    ))
  }

  const audit = periodGeometryAuditSchema.parse(await readJson('data/research/c1550/geometry-audit.json'))
  const newAuditEntries = [
    {
      period_id: 'c1550',
      feature_id: mosqueFeature.id,
      status: 'in_review',
      reviewed_on: null,
      geometry_source_refs: mosqueFeature.properties.geometry_source_refs,
      check_method: 'Reutilización del punto c. 1492 como referencia del mismo solar, contrastada con la identificación municipal, la ortofoto y la restitución académica del edificio anterior a 1705.',
      notes: 'La continuidad material queda documentada, pero la planta publicada debe georreferenciarse y revisarse antes de sustituir el punto.',
    },
    {
      period_id: 'c1550',
      feature_id: universityFeature.id,
      status: 'in_review',
      reviewed_on: null,
      geometry_source_refs: universityFeature.properties.geometry_source_refs,
      check_method: 'Punto representativo de la antigua Universidad en Plaza Alonso Cano, contrastado con PNOA, la cronología institucional y el estudio arquitectónico del inmueble.',
      notes: 'No se adopta la manzana actual como huella de 1550 porque incorpora la relación posterior con el Palacio Arzobispal y otras reformas.',
    },
  ]
  for (const entry of newAuditEntries) {
    if (!audit.some((existing) => existing.feature_id === entry.feature_id)) audit.push(entry)
  }

  const manifest = c1550ResearchPackageManifestSchema.parse(await readJson('data/research/c1550/manifest.json'))
  const pointLayer = manifest.layers.find((layer) => layer.geometry_type === 'point')
  if (!pointLayer) throw new Error('El manifiesto c. 1550 no contiene una capa de puntos.')
  pointLayer.feature_count = points.features.length
  manifest.included_feature_ids = addUnique(manifest.included_feature_ids, M10_3_FEATURE_IDS)
  manifest.review_path = reviewPath
  manifest.updated_on = '2026-10-01'
  manifest.scope_note = 'Paquete GIS privado ampliado con el corte vertical M10.3. Los contenidos bilingües y las relaciones están listos para revisión especialista, pero ninguna geometría se considera verificada.'
  const centreDeferral = manifest.deferred_geometry.find((entry) => entry.scope_id === 'defer.completed-centre-footprints')
  if (!centreDeferral) throw new Error('Falta el aplazamiento del recinto catedralicio.')
  centreDeferral.affected_feature_ids = addUnique(centreDeferral.affected_feature_ids, [
    'religious.medina-great-mosque',
    'civic.university-curia',
  ])
  centreDeferral.reason = 'El conjunto combina fábricas convertidas, edificios adosados y una sede universitaria alterada posteriormente; los puntos revisables son más honestos que polígonos modernos independientes.'
  centreDeferral.release_condition = 'Georreferenciar las plantas históricas publicadas, separar las campañas anteriores y posteriores a 1550 y obtener aprobación arquitectónica de contactos y solapes.'

  const inventory = c1550ResearchInventorySchema.parse(await readJson('data/research/c1550-inventory.json'))
  const triageSources: Record<string, readonly string[]> = {
    'religious.madraza-yusufiyya': ['source.ugr-madraza'],
    'religious.medina-great-mosque': ['source.granada-sagrario', 'source.ugr-aljama-mosque-2004'],
  }
  for (const [featureId, sourceRefs] of Object.entries(triageSources)) {
    const entry = inventory.existing_entity_triage.find((candidate) => candidate.feature_id === featureId)
    if (!entry) throw new Error(`Falta el triaje de ${featureId}.`)
    entry.research_status = 'ready_for_review'
    entry.source_refs = addUnique(entry.source_refs, sourceRefs)
    if (featureId === 'religious.medina-great-mosque') {
      entry.expected_change = 'converted'
      entry.geometry_action = 'reuse_then_verify'
      entry.notes = 'La fábrica convertida seguía como Sagrario catedralicio en 1550 mientras avanzaba la Catedral nueva; conservar el punto hasta georreferenciar la restitución académica.'
    }
  }

  const candidateSources: Record<string, readonly string[]> = {
    'religious.cathedral-granada': ['source.granada-archive-cathedral-1521'],
    'religious.royal-chapel': ['source.royal-chapel-history'],
    'civic.lonja-mercaderes': [],
    'civic.university-curia': ['source.ugr-old-university-building-1975'],
    'royal.palace-charles-v': ['source.alhambra-machuca-imperial-works'],
    'gate.puerta-granadas': [],
  }
  for (const [featureId, sourceRefs] of Object.entries(candidateSources)) {
    const entry = inventory.candidate_entities.find((candidate) => candidate.proposed_id === featureId)
    if (!entry) throw new Error(`Falta el candidato ${featureId}.`)
    entry.research_status = 'ready_for_review'
    entry.source_refs = addUnique(entry.source_refs, sourceRefs)
    if (featureId === 'civic.university-curia') {
      entry.canonical_name = 'Universidad y Colegio Real de Santa Cruz de la Fe (actual Curia)'
      entry.subtype = 'university_college'
      entry.summary = 'La Universidad fundada en 1531 ocupaba desde 1538 el edificio hoy llamado Curia eclesiástica, junto al nuevo centro catedralicio.'
      entry.evidence_note = 'La institución, el traslado y la arquitectura están documentados; Curia es solo una referencia moderna y no la función del inmueble en 1550.'
    }
  }
  inventory.updated_on = '2026-10-01'

  await writeJson('data/research/c1550/points.geojson', periodFeatureCollectionSchema.parse(points))
  await writeJson('data/research/c1550/geometry-audit.json', periodGeometryAuditSchema.parse(audit))
  await writeJson('data/research/c1550/manifest.json', c1550ResearchPackageManifestSchema.parse(manifest))
  await writeJson('data/research/c1550-inventory.json', c1550ResearchInventorySchema.parse(inventory))
  await writeJson(reviewPath, review)

  console.log(`Corte M10.3 preparado: ${review.items.length} entidades, ${points.features.length} puntos c. 1550 y cuatro decisiones de revisión pendientes.`)
}

assemble().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
