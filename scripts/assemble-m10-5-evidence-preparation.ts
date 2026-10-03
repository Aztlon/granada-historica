import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  c1550M10_5EvidencePreparationSchema,
  type C1550M10_5EvidencePreparation,
} from '../src/data/temporalSchema'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = 'data/research/c1550/m10.5-evidence-preparation.json'

const dossier: C1550M10_5EvidencePreparation = c1550M10_5EvidencePreparationSchema.parse({
  schema_version: 1,
  milestone: 'M10.5',
  package: 'evidence-preparation-1',
  period_id: 'c1550',
  status: 'inputs_catalogued',
  public_application_import: false,
  geometry_created: false,
  updated_on: '2026-10-02',
  scope_note: 'Preparación no espacial de fuentes, protocolos, sesgos y puertas de calidad para las cuatro capas analíticas aplazadas; no contiene polígonos, coordenadas ni afirmaciones demográficas derivadas.',
  workstreams: [
    {
      workstream_id: 'evidence.parish-jurisdictions',
      analytical_layer_id: 'analysis.parish-boundaries',
      status: 'inputs_catalogued',
      title: {
        es: 'Jurisdicciones parroquiales hacia 1550',
        en: 'Parish jurisdictions around 1550',
      },
      research_question: {
        es: '¿Qué segmentos de límite parroquial pueden sostenerse mediante propiedades, calles y actos jurisdiccionales próximos a 1550, sin convertir la localización de una iglesia en un territorio supuesto?',
        en: 'Which parish-boundary segments can be supported by properties, streets and jurisdictional acts close to 1550 without turning a church location into an assumed territory?',
      },
      target_feature_ids: [
        'religious.salvador-collegiate',
        'religious.albaicin-great-mosque',
        'religious.san-miguel-bajo',
        'religious.san-cristobal',
        'religious.san-jose',
        'religious.san-juan-reyes',
        'religious.san-matias',
        'religious.san-luis',
      ],
      inputs: [
        {
          input_id: 'input.parish-institutional-histories',
          input_type: 'secondary_synthesis',
          availability: 'registered_source',
          source_refs: [
            'source.granada-salvador',
            'source.granada-san-miguel-bajo',
            'source.granada-san-cristobal',
            'source.granada-san-jose',
            'source.granada-san-juan-reyes',
            'source.granada-san-matias',
            'source.granada-san-luis',
          ],
          repository_or_target: 'Registro de fuentes de Granada Histórica',
          date_range: { from_year: 1525, to_year: 1559, precision: 'range' },
          spatial_unit: 'building',
          role: 'context',
          biases: [
            'Las historias institucionales privilegian fundación, fábrica y continuidad monumental frente a la jurisdicción territorial cotidiana.',
          ],
          limitations: [
            'La iglesia, mezquita precedente o sede colegial localiza una institución, pero no identifica por sí sola sus límites parroquiales.',
          ],
          next_action: 'Extraer únicamente fechas, solares y relaciones institucionales; no usarlas como trazado de límite.',
        },
        {
          input_id: 'input.parish-diocesan-series',
          input_type: 'parish_record',
          availability: 'repository_target',
          source_refs: [],
          repository_or_target: 'Archivo Histórico Diocesano de Granada: libros parroquiales, visitas, fábrica, diezmos y expedientes de colación',
          date_range: { from_year: 1492, to_year: 1568, precision: 'series' },
          spatial_unit: 'parish',
          role: 'candidate_observation',
          biases: [
            'La conservación y apertura de las series puede variar entre parroquias y producir una cobertura territorial muy desigual.',
          ],
          limitations: [
            'No se ha identificado todavía una serie continua y accesible que enumere calles o propiedades limítrofes para cada parroquia.',
          ],
          next_action: 'Solicitar instrumentos de descripción y localizar unidades documentales fechadas preferentemente entre 1540 y 1560.',
        },
        {
          input_id: 'input.parish-habices-property-series',
          input_type: 'habices_record',
          availability: 'repository_target',
          source_refs: ['source.ugr-habices-vega-1981'],
          repository_or_target: 'Archivo de la Curia Diocesana del Arzobispado de Granada: libros de habices y apeos urbanos',
          date_range: { from_year: 1505, to_year: 1550, precision: 'series' },
          spatial_unit: 'parcel',
          role: 'candidate_observation',
          biases: [
            'Los habices registran bienes vinculados a instituciones concretas y no constituyen un inventario exhaustivo de hogares o parcelas urbanas.',
          ],
          limitations: [
            'El caso publicado de Churriana de la Vega demuestra el tipo documental, pero no aporta observaciones directas para la ciudad de Granada.',
          ],
          next_action: 'Localizar apeos urbanos con topónimos, linderos, titulares y relación explícita con una parroquia o antigua mezquita.',
        },
        {
          input_id: 'input.parish-cabildo-finding-aid',
          input_type: 'archival_finding_aid',
          availability: 'registered_source',
          source_refs: ['source.granada-archive-cabildo-index'],
          repository_or_target: 'Archivo Municipal de Granada: Actas Capitulares',
          date_range: { from_year: 1497, to_year: 1568, precision: 'series' },
          spatial_unit: 'city',
          role: 'control',
          biases: [
            'Las actas reflejan asuntos llevados al cabildo y silencian numerosas prácticas y delimitaciones ordinarias no litigiosas.',
          ],
          limitations: [
            'El índice es un instrumento de localización; cualquier afirmación deberá comprobarse en el acta original y con su signatura.',
          ],
          next_action: 'Buscar colación, parroquia, feligresía, término, linde, procesión, repartimiento y los nombres históricos de cada sede.',
        },
        {
          input_id: 'input.parish-streets-parcels',
          input_type: 'parcel_morphology',
          availability: 'registered_source',
          source_refs: ['source.granada-centre-plan', 'source.ugr-urban-transformation'],
          repository_or_target: 'Planeamiento histórico del centro y síntesis arqueológica urbana',
          date_range: { from_year: null, to_year: null, precision: 'unknown' },
          spatial_unit: 'street',
          role: 'constraint',
          biases: [
            'La morfología conservada está afectada por agregaciones de parcelas, aperturas de calles y reformas posteriores al siglo XVI.',
          ],
          limitations: [
            'Una calle o medianera plausible solo puede actuar como control geométrico después de que un documento la vincule al límite.',
          ],
          next_action: 'Preparar un nomenclátor histórico-moderno de calles y sitios, manteniendo separados equivalencia segura, probable y desconocida.',
        },
      ],
      derivation_protocol: [
        'Transcribir y citar cada observación territorial con fecha, signatura, parroquia nombrada, topónimo, propiedad y literal de la relación espacial.',
        'Resolver topónimos contra calles, sitios y parcelas mediante una tabla de equivalencias versionada, sin forzar coincidencias modernas.',
        'Clasificar cada observación como interior, exterior, contacto o indeterminada; una sede parroquial nunca cuenta como observación de borde.',
        'Proponer segmentos solo donde converjan al menos dos clases de evidencia independientes y conservar discontinuidades donde falten datos.',
        'Someter observaciones, equivalencias y segmentos a revisión histórica antes de cualquier construcción espacial.',
      ],
      uncertainty_model: {
        unit: 'edge_segment',
        minimum_support: 'Cada segmento necesita una observación documental directa y un control espacial independiente; dos repeticiones de la misma fuente no cuentan como independencia.',
        conflict_rule: 'Los testimonios incompatibles se conservan como alternativas fechadas; no se promedian ni se elige el borde moderno por defecto.',
        absence_rule: 'La ausencia de una propiedad o calle en una serie no demuestra que estuviera fuera de la parroquia ni que estuviera despoblada.',
        visual_expression: 'Un resultado futuro distinguirá borde sostenido, corredor probable, alternativa disputada y zona sin resolver, en vez de una línea uniforme.',
      },
      non_goals: [
        'No equiparar parroquia, collación, barrio, identidad confesional y área de influencia de una iglesia.',
        'No crear polígonos cerrados para rellenar huecos entre observaciones parciales.',
      ],
      dependency_workstream_ids: [],
      readiness_gate: {
        ready: false,
        criteria: [
          {
            criterion_id: 'criterion.parish-series-located',
            description: 'Existe una serie citable y suficientemente próxima a 1550 para cada jurisdicción incluida.',
            status: 'unmet',
            evidence_input_ids: ['input.parish-diocesan-series', 'input.parish-habices-property-series'],
          },
          {
            criterion_id: 'criterion.parish-toponyms-resolved',
            description: 'Las calles, propiedades y topónimos documentales tienen equivalencias auditables y grados de confianza explícitos.',
            status: 'partial',
            evidence_input_ids: ['input.parish-cabildo-finding-aid', 'input.parish-streets-parcels'],
          },
          {
            criterion_id: 'criterion.parish-edge-support',
            description: 'Cada segmento propuesto supera la regla de apoyo independiente y conserva los conflictos sin resolver.',
            status: 'unmet',
            evidence_input_ids: ['input.parish-diocesan-series', 'input.parish-streets-parcels'],
          },
        ],
        blockers: [
          'Faltan unidades documentales localizadas y transcritas que describan propiedades, calles o actos de jurisdicción de cada parroquia.',
          'Todavía no existe un nomenclátor histórico-moderno revisado para resolver los topónimos de las series.',
        ],
      },
    },
    {
      workstream_id: 'evidence.public-spaces',
      analytical_layer_id: 'analysis.public-squares',
      status: 'inputs_catalogued',
      title: {
        es: 'Alineaciones de Bib-Rambla, Campo del Príncipe y Plaza Nueva',
        en: 'Alignments of Bib-Rambla, Campo del Príncipe and Plaza Nueva',
      },
      research_question: {
        es: '¿Qué bordes, frentes y plataformas de las tres plazas pueden situarse hacia 1550 mediante obras, propiedades, hidrología, arqueología y cartografía regresiva?',
        en: 'Which edges, frontages and platforms of the three squares can be placed around 1550 through works, properties, hydrology, archaeology and regressive cartography?',
      },
      target_feature_ids: [
        'urban.plaza-bib-rambla',
        'urban.campo-principe',
        'urban.plaza-nueva',
      ],
      inputs: [
        {
          input_id: 'input.squares-official-histories',
          input_type: 'secondary_synthesis',
          availability: 'registered_source',
          source_refs: ['source.granada-bib-rambla-square', 'source.granada-campo-principe', 'source.granada-pgom-urban-history'],
          repository_or_target: 'Ayuntamiento de Granada: turismo y planeamiento urbano',
          date_range: { from_year: 1497, to_year: 1550, precision: 'range' },
          spatial_unit: 'site',
          role: 'context',
          biases: [
            'Las síntesis municipales priorizan origen, función y grandes reformas, no la posición verificable de cada frente en una fecha concreta.',
          ],
          limitations: [
            'La cronología funcional no proporciona por sí sola una envolvente espacial reproducible hacia 1550.',
          ],
          next_action: 'Extraer acontecimientos fechados y vocabulario espacial sin trazar bordes desde la planta actual.',
        },
        {
          input_id: 'input.squares-cabildo-series',
          input_type: 'archival_finding_aid',
          availability: 'registered_source',
          source_refs: ['source.granada-archive-cabildo-index'],
          repository_or_target: 'Archivo Municipal de Granada: Actas Capitulares y expedientes de obras, policía urbana y abastos',
          date_range: { from_year: 1497, to_year: 1568, precision: 'series' },
          spatial_unit: 'frontage',
          role: 'candidate_observation',
          biases: [
            'El cabildo documenta decisiones y conflictos, pero no necesariamente el estado ordinario de todos los frentes y accesos.',
          ],
          limitations: [
            'Solo está registrado el instrumento de búsqueda; aún deben localizarse y citarse las actas y expedientes concretos.',
          ],
          next_action: 'Buscar ensanche, empedrado, casas, tiendas, tablados, carnicería, pescadería, puente, bóveda, Darro y los nombres históricos de las plazas.',
        },
        {
          input_id: 'input.squares-darrillo-1521',
          input_type: 'street_alignment',
          availability: 'registered_source',
          source_refs: ['source.granada-archive-cathedral-1521'],
          repository_or_target: 'Archivo Municipal de Granada, C.04659.0064; CF',
          date_range: { from_year: 1521, to_year: 1521, precision: 'exact' },
          spatial_unit: 'street',
          role: 'control',
          biases: [
            'La cédula trata el desvío de una acequia junto a la Catedral y describe un itinerario funcional, no un levantamiento métrico de Plaza Nueva.',
          ],
          limitations: [
            'Sirve como control de conectividad y toponimia, pero no fija anchuras, frentes ni el alcance del cubrimiento del Darro.',
          ],
          next_action: 'Relacionar el itinerario citado con obras, puentes y propiedades contemporáneas antes de usarlo como control espacial.',
        },
        {
          input_id: 'input.squares-historical-maps',
          input_type: 'historical_cartography',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Archivo Municipal de Granada y colecciones cartográficas: planos de alineación anteriores a las grandes reformas modernas',
          date_range: { from_year: 1550, to_year: 1900, precision: 'series' },
          spatial_unit: 'frontage',
          role: 'constraint',
          biases: [
            'La cartografía posterior puede registrar rectificaciones ya ejecutadas y proyectar hacia atrás una regularidad inexistente en 1550.',
          ],
          limitations: [
            'No se ha seleccionado todavía un plano con escala, fecha, autoría y estabilidad de puntos de control suficientes.',
          ],
          next_action: 'Inventariar planos por fecha y propósito, registrar deformación y usar solo frentes cuya persistencia pueda justificarse.',
        },
        {
          input_id: 'input.squares-archaeology',
          input_type: 'archaeology',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Junta de Andalucía, memorias de intervención y cartas arqueológicas de los tres espacios',
          date_range: { from_year: null, to_year: null, precision: 'unknown' },
          spatial_unit: 'site',
          role: 'control',
          biases: [
            'Las intervenciones urbanas son ventanas discontinuas condicionadas por obras modernas y rara vez cubren toda la plaza.',
          ],
          limitations: [
            'No existe todavía una tabla de unidades estratigráficas fechadas y georreferenciables para comparar los tres ámbitos.',
          ],
          next_action: 'Localizar informes con plantas, cotas, fases y referencias espaciales reutilizables bajo sus condiciones de licencia.',
        },
        {
          input_id: 'input.squares-parcel-morphology',
          input_type: 'parcel_morphology',
          availability: 'registered_source',
          source_refs: ['source.granada-centre-plan', 'source.ugr-urban-transformation'],
          repository_or_target: 'Planeamiento especial del centro y análisis de transformación urbana',
          date_range: { from_year: null, to_year: null, precision: 'unknown' },
          spatial_unit: 'parcel',
          role: 'constraint',
          biases: [
            'Las parcelas actuales condensan agregaciones, retranqueos, aperturas y reconstrucciones acumuladas durante casi cinco siglos.',
          ],
          limitations: [
            'La morfología solo puede apoyar continuidad o ruptura; nunca fechar por sí misma un frente en 1550.',
          ],
          next_action: 'Clasificar frentes por estabilidad documentada, transformación conocida y ausencia de control antes de cualquier regresión.',
        },
      ],
      derivation_protocol: [
        'Construir para cada plaza una cronología separada de obras, usos, frentes, accesos, cursos de agua y edificios de control.',
        'Registrar cada evidencia de alineación como observación independiente con fecha, locator, unidad espacial y precisión, sin dibujar una envolvente.',
        'Georreferenciar cartografía posterior solo después de seleccionar controles persistentes y publicar error residual y transformación aplicada.',
        'Contrastar la regresión con arqueología, hidrología y propiedad; los frentes discordantes permanecen como alternativas.',
        'Derivar una futura envolvente por segmentos versionados, nunca copiando la plaza actual como punto de partida incuestionado.',
      ],
      uncertainty_model: {
        unit: 'space_envelope',
        minimum_support: 'Cada tramo futuro de la envolvente requiere dos controles independientes, al menos uno documental o arqueológico y otro espacial.',
        conflict_rule: 'La discordancia entre plano, parcela y arqueología se registra por segmento y fecha; no se suaviza en una única forma cerrada.',
        absence_rule: 'La falta de obra documentada no prueba que un frente permaneciera estable, y la falta de excavación no prueba ausencia de estructuras.',
        visual_expression: 'El resultado futuro usará segmentos sólidos, corredores de tolerancia y vacíos explícitos, con fechas y fuentes consultables.',
      },
      non_goals: [
        'No copiar los polígonos actuales de las plazas ni convertir una descripción funcional en una superficie histórica.',
        'No fusionar las sucesivas plataformas, bóvedas, ensanches y rectificaciones del siglo XVI en una fecha ficticia única.',
      ],
      public_space_subjects: [
        {
          feature_id: 'urban.plaza-bib-rambla',
          documented_change: {
            es: 'La fuente municipal documenta la ampliación castellana y el uso ceremonial de la plaza desde 1501.',
            en: 'The municipal source documents Castilian enlargement and ceremonial use of the square from 1501.',
          },
          current_assessment: {
            es: 'La transformación y la función son seguras, pero los frentes de 1550 no se distinguen todavía de las rectificaciones posteriores.',
            en: 'Transformation and function are secure, but the 1550 frontages cannot yet be separated from later realignments.',
          },
          supporting_input_ids: ['input.squares-official-histories', 'input.squares-cabildo-series', 'input.squares-parcel-morphology'],
          missing_inputs: [
            'Actas u obras fechadas que identifiquen casas, tiendas, accesos y dimensiones por frente.',
            'Plantas arqueológicas o cartografía regresiva con controles suficientes para discriminar reformas posteriores.',
          ],
          derivability: 'not_derivable',
        },
        {
          feature_id: 'urban.campo-principe',
          documented_change: {
            es: 'La transformación del Campo de la Loma desde 1497 y la continuación de su arreglo en 1513 están documentadas institucionalmente.',
            en: 'Transformation of Campo de la Loma from 1497 and continuation of its improvement in 1513 are institutionally documented.',
          },
          current_assessment: {
            es: 'La cronología de acondicionamiento es firme, pero no demuestra que la envolvente actual coincida con la plaza de 1550.',
            en: 'The chronology of improvement is firm, but it does not show that the present envelope matches the square in 1550.',
          },
          supporting_input_ids: ['input.squares-official-histories', 'input.squares-cabildo-series', 'input.squares-historical-maps'],
          missing_inputs: [
            'Documentación de deslindes, frentes de huertas y accesos que sitúe el paso del campo abierto a la plaza consolidada.',
            'Controles arqueológicos y parcelarios fechados para separar la ordenación de 1513 de transformaciones posteriores.',
          ],
          derivability: 'not_derivable',
        },
        {
          feature_id: 'urban.plaza-nueva',
          documented_change: {
            es: 'El planeamiento municipal confirma la apertura de Plaza Nueva sobre el Darro como parte de las grandes transformaciones del siglo XVI.',
            en: 'Municipal planning confirms the opening of Plaza Nueva over the Darro as part of the major sixteenth-century transformations.',
          },
          current_assessment: {
            es: 'Hay controles de conectividad, obras e instituciones, pero no una secuencia métrica suficiente de plataformas, puentes y cubrimientos hacia 1550.',
            en: 'Connectivity, works and institutional controls exist, but there is not yet a sufficient metric sequence of platforms, bridges and river coverings around 1550.',
          },
          supporting_input_ids: ['input.squares-official-histories', 'input.squares-darrillo-1521', 'input.squares-historical-maps', 'input.squares-archaeology'],
          missing_inputs: [
            'Expedientes fechados de puentes, bóvedas, expropiaciones y frentes que separen cada campaña de la plaza.',
            'Reconstrucción hidrológica y topográfica del Darro con cotas y tolerancias publicadas.',
          ],
          derivability: 'not_derivable',
        },
      ],
      dependency_workstream_ids: [],
      readiness_gate: {
        ready: false,
        criteria: [
          {
            criterion_id: 'criterion.squares-chronology',
            description: 'Cada plaza tiene una cronología de intervenciones y usos con acontecimientos fechados y fuentes citables.',
            status: 'partial',
            evidence_input_ids: ['input.squares-official-histories', 'input.squares-darrillo-1521'],
          },
          {
            criterion_id: 'criterion.squares-alignments',
            description: 'Cada frente dispone de observaciones documentales o arqueológicas y controles espaciales independientes.',
            status: 'unmet',
            evidence_input_ids: ['input.squares-cabildo-series', 'input.squares-historical-maps', 'input.squares-archaeology'],
          },
          {
            criterion_id: 'criterion.squares-regression',
            description: 'La regresión cartográfica publica puntos de control, error, estabilidad parcelaria y alternativas conflictivas.',
            status: 'unmet',
            evidence_input_ids: ['input.squares-historical-maps', 'input.squares-parcel-morphology'],
          },
        ],
        blockers: [
          'No se han localizado todavía expedientes de alineación u obras suficientes para reconstruir los frentes de las tres plazas.',
          'Faltan controles arqueológicos y cartográficos con metadatos adecuados para una regresión espacial reproducible.',
        ],
      },
    },
    {
      workstream_id: 'evidence.population-corpus',
      analytical_layer_id: 'analysis.population-geography',
      status: 'inputs_catalogued',
      title: {
        es: 'Corpus de hogares, propiedad, fiscalidad y habices',
        en: 'Household, property, fiscal and habices corpus',
      },
      research_question: {
        es: '¿Qué observaciones fechadas y espacialmente resolubles permiten estudiar patrones de residencia, propiedad e institución sin convertir nombres o silencios documentales en identidades inferidas?',
        en: 'Which dated, spatially resolvable observations allow the study of residence, property and institutional patterns without turning names or documentary silence into inferred identities?',
      },
      target_feature_ids: ['urban.albaicin', 'urban.lower-medina', 'quarter.albayyazin', 'quarter.ramla'],
      inputs: [
        {
          input_id: 'input.population-habices-method',
          input_type: 'habices_record',
          availability: 'registered_source',
          source_refs: ['source.ugr-habices-vega-1981'],
          repository_or_target: 'Repositorio DIGIBUG y Archivo de la Curia Diocesana del Arzobispado de Granada',
          date_range: { from_year: 1505, to_year: 1548, precision: 'series' },
          spatial_unit: 'parcel',
          role: 'context',
          biases: [
            'Los bienes habices sobrerrepresentan patrimonios religiosos e institucionales y no equivalen a un censo de población residente.',
            'El estudio publicado corresponde a Churriana de la Vega y solo informa el modelo documental, no el patrón urbano de Granada.',
          ],
          limitations: [
            'No puede transferirse la distribución de una alquería de la Vega a los barrios de la ciudad ni usarse como denominador demográfico.',
          ],
          next_action: 'Usar el estudio para diseñar campos de transcripción y localizar series urbanas, manteniendo separado ejemplo metodológico y evidencia local.',
        },
        {
          input_id: 'input.population-urban-synthesis',
          input_type: 'secondary_synthesis',
          availability: 'registered_source',
          source_refs: ['source.ugr-urban-transformation', 'source.granada-pgom-urban-history'],
          repository_or_target: 'Universidad de Granada y Ayuntamiento de Granada',
          date_range: { from_year: 1492, to_year: 1550, precision: 'range' },
          spatial_unit: 'city',
          role: 'context',
          biases: [
            'Las síntesis a escala urbana identifican procesos generales, pero pueden aplanar diferencias entre calles, propiedades, hogares y fechas.',
          ],
          limitations: [
            'No proporcionan una tabla de observaciones individuales ni denominadores comparables para producir densidades o áreas sociales.',
          ],
          next_action: 'Usarlas para formular hipótesis y vocabulario histórico, nunca como sustituto del corpus primario.',
        },
        {
          input_id: 'input.population-household-series',
          input_type: 'household_record',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Archivos municipal, diocesano y de protocolos: padrones, vecindarios, visitas o relaciones de hogares 1540-1560',
          date_range: { from_year: 1540, to_year: 1560, precision: 'range' },
          spatial_unit: 'street',
          role: 'candidate_observation',
          biases: [
            'Los listados de hogares pueden excluir población móvil, dependientes, mujeres, pobres o personas exentas y usar categorías administrativas cambiantes.',
          ],
          limitations: [
            'No se ha localizado una serie urbana suficientemente completa, fechada y espacialmente resoluble para el corte c. 1550.',
          ],
          next_action: 'Identificar series, propósito fiscal o pastoral, unidad de enumeración, cobertura, omisiones y posibilidades de enlace espacial.',
        },
        {
          input_id: 'input.population-fiscal-series',
          input_type: 'fiscal_record',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Archivo Municipal de Granada y archivos estatales: repartimientos, pechos, alcabalas y otras listas fiscales',
          date_range: { from_year: 1540, to_year: 1560, precision: 'range' },
          spatial_unit: 'parish',
          role: 'candidate_observation',
          biases: [
            'La población fiscal depende del impuesto, exenciones, fraude, unidad de cuenta y finalidad administrativa y no equivale a población total.',
          ],
          limitations: [
            'Sin metadatos sobre cobertura y denominador, los recuentos no son comparables entre parroquias ni convertibles en población absoluta.',
          ],
          next_action: 'Localizar series y documentar contribuyente, hogar, bien gravado, exención, territorio y fecha antes de cualquier conteo.',
        },
        {
          input_id: 'input.population-property-protocols',
          input_type: 'property_record',
          availability: 'repository_target',
          source_refs: [],
          repository_or_target: 'Archivo Histórico de Protocolos de Granada: compraventas, arrendamientos, censos, dotes y linderos',
          date_range: { from_year: 1540, to_year: 1560, precision: 'range' },
          spatial_unit: 'parcel',
          role: 'candidate_observation',
          biases: [
            'Los protocolos seleccionan actos formalizados y población con capacidad o necesidad notarial; propiedad no equivale necesariamente a residencia.',
          ],
          limitations: [
            'Las referencias espaciales suelen depender de vecinos, topónimos variables y cadenas de transmisión difíciles de normalizar.',
          ],
          next_action: 'Definir una muestra documentada, transcribir linderos y separar titularidad, tenencia, residencia y uso del inmueble.',
        },
        {
          input_id: 'input.population-parish-series',
          input_type: 'parish_record',
          availability: 'repository_target',
          source_refs: [],
          repository_or_target: 'Archivo Histórico Diocesano de Granada: sacramentales, fábrica, visitas y registros de feligresía',
          date_range: { from_year: 1540, to_year: 1560, precision: 'range' },
          spatial_unit: 'parish',
          role: 'candidate_observation',
          biases: [
            'Las categorías eclesiásticas reflejan el régimen de conversión y vigilancia y no deben naturalizarse como identidad personal autoatribuida.',
          ],
          limitations: [
            'Cobertura, conservación y granularidad son todavía desconocidas y los registros pueden no contener domicilio resoluble.',
          ],
          next_action: 'Localizar series cercanas a 1550 y documentar quién registra, con qué propósito, bajo qué categoría y con qué unidad territorial.',
        },
        {
          input_id: 'input.population-cabildo-finding-aid',
          input_type: 'archival_finding_aid',
          availability: 'registered_source',
          source_refs: ['source.granada-archive-cabildo-index'],
          repository_or_target: 'Archivo Municipal de Granada: índices y libros de Actas Capitulares',
          date_range: { from_year: 1497, to_year: 1568, precision: 'series' },
          spatial_unit: 'city',
          role: 'control',
          biases: [
            'Los asuntos registrados por el cabildo reflejan gobierno, conflicto y fiscalidad más que una observación sistemática de residentes.',
          ],
          limitations: [
            'El instrumento de descripción permite descubrir documentos, pero no ofrece una base de datos de hogares o propiedades.',
          ],
          next_action: 'Buscar padrones, repartimientos, vecindarios, moriscos, cristianos nuevos, casas, rentas y parroquias, verificando cada resultado en el original.',
        },
      ],
      derivation_protocol: [
        'Registrar primero la procedencia, propósito, unidad de enumeración, cobertura y omisiones de cada serie antes de transcribir observaciones.',
        'Transcribir literalmente las categorías históricas y conservar una columna separada de normalización; nunca inferir identidad desde nombre, oficio o barrio.',
        'Distinguir persona nombrada, hogar, titular, ocupante, inmueble, institución y contribuyente como entidades relacionadas, no intercambiables.',
        'Resolver lugares mediante identificadores auditables y grados de confianza, manteniendo como no espaciales las observaciones ambiguas.',
        'Evaluar duplicados, cambios de residencia, lagunas y denominadores antes de resumir por calle, parroquia o barrio.',
        'Agregar solo después de revisión histórica y metodológica, con recuentos, cobertura, no resueltos y sensibilidad a la escala publicados.',
      ],
      uncertainty_model: {
        unit: 'record_observation',
        minimum_support: 'Toda observación agregable requiere fuente y locator, fecha o intervalo, categoría literal, unidad documental y enlace espacial revisable.',
        conflict_rule: 'Las identidades, residencias o propiedades incompatibles se conservan como observaciones fechadas; no se fusionan por similitud de nombre.',
        absence_rule: 'No aparecer en una serie no prueba ausencia, desplazamiento, pobreza, confesión ni residencia fuera del área estudiada.',
        visual_expression: 'Cualquier salida futura mostrará cobertura y no resueltos junto con recuentos o proporciones, evitando áreas homogéneas de identidad.',
      },
      non_goals: [
        'No producir polígonos moriscos o cristianos ni asignar identidad confesional a una persona mediante nombre, ubicación o propiedad.',
        'No estimar población absoluta sin denominador, cobertura y modelo demográfico revisados.',
        'No usar las consecuencias de la rebelión de 1568 y las expulsiones posteriores para rellenar retrospectivamente el estado de 1550.',
      ],
      corpus_model: {
        fields: [
          { field_id: 'record_id', description: 'Identificador estable de la observación transcrita, no de una persona histórica universal.', required: true, controlled_values: [] },
          { field_id: 'source_id', description: 'Identificador de la fuente registrada de la que procede la observación.', required: true, controlled_values: [] },
          { field_id: 'archival_locator', description: 'Signatura, folio, asiento o página que permite recuperar la observación.', required: true, controlled_values: [] },
          { field_id: 'record_date', description: 'Fecha literal y normalizada del asiento, conservando precisión e intervalo.', required: true, controlled_values: [] },
          { field_id: 'source_category', description: 'Clase documental que determina población observada, propósito y sesgo.', required: true, controlled_values: ['household', 'fiscal', 'property', 'habices', 'parish', 'other'] },
          { field_id: 'historical_category', description: 'Categoría social, jurídica o confesional tal como aparece, sin inferencia moderna.', required: false, controlled_values: [] },
          { field_id: 'actor_role', description: 'Papel explícito en el asiento para separar residente, titular, arrendatario, contribuyente e institución.', required: false, controlled_values: ['resident', 'owner', 'tenant', 'taxpayer', 'institution', 'unknown'] },
          { field_id: 'place_literal', description: 'Topónimo, calle, parroquia, lindero o inmueble transcrito literalmente.', required: true, controlled_values: [] },
          { field_id: 'place_id', description: 'Identificador espacial normalizado cuando la resolución es suficientemente segura.', required: false, controlled_values: [] },
          { field_id: 'spatial_confidence', description: 'Confianza del enlace entre el lugar literal y la unidad espacial normalizada.', required: true, controlled_values: ['secure', 'probable', 'approximate', 'disputed', 'unresolved'] },
          { field_id: 'observation_weight', description: 'Peso analítico documentado para series con cobertura o unidades de enumeración distintas.', required: false, controlled_values: [] },
          { field_id: 'exclusion_reason', description: 'Motivo explícito para conservar una observación fuera de la agregación espacial.', required: false, controlled_values: ['unresolved_place', 'duplicate_candidate', 'outside_period', 'coverage_unknown', 'other'] },
        ],
        identity_rule: 'Solo se registra una categoría histórica cuando la fuente la expresa; nombres, oficios, parentescos, ubicación y lengua no autorizan inferencias de identidad.',
        spatial_linkage_rule: 'Un enlace espacial conserva término literal, regla de equivalencia, fuente de control, responsable y confianza; disputed y unresolved no se agregan.',
        aggregation_guardrails: [
          'Publicar cobertura documental, tamaño de muestra, observaciones excluidas y unidad de enumeración junto a cualquier resumen.',
          'Separar recuentos de hogares, personas, titulares, inmuebles y contribuyentes; ninguna unidad sustituye automáticamente a otra.',
          'Probar sensibilidad a calle, parroquia y barrio y suprimir la representación cuando el patrón dependa de una única escala o serie.',
          'Requerir aprobación de historia morisca y geografía de población antes de convertir el corpus en una capa visible.',
        ],
      },
      dependency_workstream_ids: ['evidence.parish-jurisdictions'],
      readiness_gate: {
        ready: false,
        criteria: [
          {
            criterion_id: 'criterion.population-series',
            description: 'Se han localizado y caracterizado series complementarias de hogares, fiscalidad, propiedad, habices y parroquias.',
            status: 'unmet',
            evidence_input_ids: ['input.population-household-series', 'input.population-fiscal-series', 'input.population-property-protocols', 'input.population-parish-series'],
          },
          {
            criterion_id: 'criterion.population-corpus-pilot',
            description: 'Una muestra transcrita prueba el modelo, los enlaces espaciales, los duplicados, las exclusiones y los denominadores.',
            status: 'unmet',
            evidence_input_ids: ['input.population-habices-method', 'input.population-property-protocols'],
          },
          {
            criterion_id: 'criterion.population-bias-review',
            description: 'Sesgos, silencios, categorías coercitivas y límites de inferencia han recibido revisión histórica y metodológica.',
            status: 'partial',
            evidence_input_ids: ['input.population-habices-method', 'input.population-urban-synthesis', 'input.population-parish-series'],
          },
        ],
        blockers: [
          'No existe todavía un corpus urbano normalizado con observaciones primarias cercanas a 1550.',
          'Se desconocen cobertura y denominadores de las principales series objetivo y no hay aprobación metodológica especialista.',
        ],
      },
    },
    {
      workstream_id: 'evidence.citywide-extent',
      analytical_layer_id: 'analysis.citywide-extent',
      status: 'inputs_catalogued',
      title: {
        es: 'Extensión urbana compuesta hacia 1550',
        en: 'Composite urban extent around 1550',
      },
      research_question: {
        es: '¿Cómo puede representarse una extensión urbana de 1550 sin colapsar bordes físicos, jurisdiccionales y sociales ni ocultar los vacíos de sus componentes?',
        en: 'How can a 1550 urban extent be represented without collapsing physical, jurisdictional and social edges or hiding gaps in its components?',
      },
      target_feature_ids: ['urban.late-nasrid-extent', 'urban.albaicin', 'urban.lower-medina'],
      inputs: [
        {
          input_id: 'input.extent-parish-dependency',
          input_type: 'derived_dependency',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Resultado revisado futuro de evidence.parish-jurisdictions',
          date_range: { from_year: 1550, to_year: 1550, precision: 'exact' },
          spatial_unit: 'parish',
          role: 'constraint',
          biases: [
            'Las jurisdicciones parroquiales expresan administración eclesiástica y no delimitan necesariamente ocupación edificada o identidad social.',
          ],
          limitations: [
            'La dependencia permanece aplazada y no existe una salida espacial revisada que pueda usarse en composición.',
          ],
          next_action: 'Esperar el cumplimiento de su puerta de calidad y conservar sus segmentos inciertos como tales.',
        },
        {
          input_id: 'input.extent-squares-dependency',
          input_type: 'derived_dependency',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Resultado revisado futuro de evidence.public-spaces',
          date_range: { from_year: 1550, to_year: 1550, precision: 'exact' },
          spatial_unit: 'site',
          role: 'constraint',
          biases: [
            'Las plazas son intervenciones puntuales y su precisión no puede extenderse automáticamente al tejido urbano circundante.',
          ],
          limitations: [
            'Las tres envolventes siguen sin derivarse y no ofrecen todavía controles espaciales para la composición urbana.',
          ],
          next_action: 'Incorporar solo segmentos aprobados y nunca usar la plaza actual para cerrar vacíos de la extensión.',
        },
        {
          input_id: 'input.extent-population-dependency',
          input_type: 'derived_dependency',
          availability: 'not_located',
          source_refs: [],
          repository_or_target: 'Resultado revisado futuro de evidence.population-corpus',
          date_range: { from_year: 1540, to_year: 1560, precision: 'range' },
          spatial_unit: 'quarter',
          role: 'context',
          biases: [
            'Una distribución de observaciones documentales refleja cobertura de fuentes y no constituye un borde físico de la ciudad.',
          ],
          limitations: [
            'El corpus no existe todavía y cualquier capa social requiere metodología y revisión independientes.',
          ],
          next_action: 'Mantener las observaciones sociales separadas de la envolvente física y administrativa.',
        },
        {
          input_id: 'input.extent-walls-quarters',
          input_type: 'institutional_plan',
          availability: 'registered_source',
          source_refs: ['source.granada-centre-plan', 'source.granada-pgom-urban-history'],
          repository_or_target: 'Planeamiento municipal y cartografía histórica de referencia',
          date_range: { from_year: null, to_year: null, precision: 'unknown' },
          spatial_unit: 'city',
          role: 'control',
          biases: [
            'Las síntesis urbanísticas combinan fases, recintos y cartografía de épocas distintas para explicar evolución a escala de ciudad.',
          ],
          limitations: [
            'Los esquemas generales no bastan para decidir qué lienzos, arrabales o vacíos estaban activos o urbanizados en 1550.',
          ],
          next_action: 'Descomponer cada recinto y barrio en componentes fechados, auditados y compatibles con el corte temporal.',
        },
        {
          input_id: 'input.extent-infrastructure',
          input_type: 'derived_dependency',
          availability: 'registered_source',
          source_refs: ['source.ugr-urban-transformation', 'source.granada-archive-cathedral-1521'],
          repository_or_target: 'Ejes, agua y obras urbanas del inventario c. 1550',
          date_range: { from_year: 1492, to_year: 1550, precision: 'range' },
          spatial_unit: 'city',
          role: 'context',
          biases: [
            'Las redes conocidas privilegian grandes ejes y obras documentadas y dejan mal representados ramales menores, huertas y bordes periurbanos.',
          ],
          limitations: [
            'Los elementos de infraestructura conservan aplazamientos propios y no pueden usarse para cerrar una envolvente continua.',
          ],
          next_action: 'Registrar conectividad y función sin convertir ejes lineales en evidencia automática de ocupación superficial.',
        },
      ],
      derivation_protocol: [
        'Definir por separado extensión física construida, recinto defensivo, jurisdicciones administrativas y distribuciones sociales.',
        'Aceptar únicamente componentes con fecha, método, fuentes, estado de revisión y representación de incertidumbre compatibles.',
        'Componer bordes por segmentos y procedencia, conservando huecos, enclaves, huertas y zonas periurbanas en vez de forzar una envolvente simple.',
        'Ejecutar análisis de sensibilidad retirando cada clase de componente para mostrar qué partes dependen de una única evidencia.',
        'Publicar linaje completo desde cada segmento hasta sus entradas y revisiones antes de considerar una capa urbana visible.',
      ],
      uncertainty_model: {
        unit: 'composite_extent',
        minimum_support: 'Cada borde compuesto debe heredar la regla de apoyo, fecha y confianza del componente más débil que lo sostiene.',
        conflict_rule: 'Los bordes físicos, defensivos, jurisdiccionales y sociales incompatibles permanecen como capas distintas y nunca se promedian.',
        absence_rule: 'Un vacío de fuentes o de observaciones no se rellena como suelo urbano, rural, despoblado ni adscrito a una población concreta.',
        visual_expression: 'Una salida futura mostrará varias extensiones tipadas, zonas sin resolver y procedencia por segmento, no una mancha urbana única.',
      },
      non_goals: [
        'No producir un único límite total de Granada que mezcle ciudad construida, murallas, jurisdicción y geografía social.',
        'No derivar una extensión c. 1550 mediante expansión o contracción automática de polígonos c. 1492 o actuales.',
      ],
      dependency_workstream_ids: [
        'evidence.parish-jurisdictions',
        'evidence.public-spaces',
        'evidence.population-corpus',
      ],
      readiness_gate: {
        ready: false,
        criteria: [
          {
            criterion_id: 'criterion.extent-components',
            description: 'Parroquias, plazas, barrios, cercas e infraestructura tienen componentes fechados y revisados con incertidumbre compatible.',
            status: 'unmet',
            evidence_input_ids: ['input.extent-parish-dependency', 'input.extent-squares-dependency', 'input.extent-walls-quarters', 'input.extent-infrastructure'],
          },
          {
            criterion_id: 'criterion.extent-social-separation',
            description: 'Las observaciones sociales se mantienen separadas de bordes físicos y administrativos y conservan cobertura y sesgo.',
            status: 'unmet',
            evidence_input_ids: ['input.extent-population-dependency'],
          },
          {
            criterion_id: 'criterion.extent-lineage',
            description: 'El procedimiento de composición y sensibilidad permite rastrear cada segmento hasta entradas y revisiones aprobadas.',
            status: 'partial',
            evidence_input_ids: ['input.extent-walls-quarters', 'input.extent-infrastructure'],
          },
        ],
        blockers: [
          'Las tres dependencias analíticas siguen aplazadas y la cobertura revisada de barrios, cercas e infraestructura es incompleta.',
          'Aún no existe un modelo de composición que preserve por separado bordes físicos, administrativos y sociales.',
        ],
      },
    },
  ],
})

await writeFile(
  resolve(repositoryRoot, outputPath),
  `${JSON.stringify(dossier, null, 2)}\n`,
  'utf8',
)

const inputCount = dossier.workstreams.reduce((count, workstream) => count + workstream.inputs.length, 0)
const criterionCount = dossier.workstreams.reduce(
  (count, workstream) => count + workstream.readiness_gate.criteria.length,
  0,
)

console.log(
  `Preparación de evidencia M10.5 ensamblada: ${dossier.workstreams.length} frentes, ${inputCount} entradas, ${criterionCount} criterios y cero geometrías.`,
)
