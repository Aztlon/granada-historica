import type { Confidence, EvidenceBasis, FeatureCategory, GeometryMethod } from '../data/schema'
import type { Locale } from '../data/pilotSchema'

const categoryLabels: Record<Locale, Record<FeatureCategory, string>> = {
  es: {
    urban_structure: 'Estructura urbana', walls_gates: 'Murallas y puertas',
    religion_learning: 'Religión y conocimiento', commerce_civic: 'Comercio y vida cívica',
    water_infrastructure: 'Agua e infraestructuras', royal_elite: 'Paisajes regios y de élite',
    burial_other: 'Ámbitos funerarios y otros',
  },
  en: {
    urban_structure: 'Urban structure', walls_gates: 'Walls and gates',
    religion_learning: 'Religion and learning', commerce_civic: 'Commerce and civic life',
    water_infrastructure: 'Water and infrastructure', royal_elite: 'Royal and elite landscapes',
    burial_other: 'Burial grounds and other places',
  },
}

const confidenceLabels: Record<Locale, Record<Confidence, string>> = {
  es: { secure: 'Segura', probable: 'Probable', approximate: 'Aproximada', disputed: 'Controvertida' },
  en: { secure: 'Secure', probable: 'Probable', approximate: 'Approximate', disputed: 'Disputed' },
}

const confidenceDescriptions: Record<Locale, Record<Confidence, string>> = {
  es: {
    secure: 'Respaldada por pruebas sólidas o por un amplio consenso.',
    probable: 'Bien fundamentada, aunque requiere cierta reconstrucción.',
    approximate: 'Se conoce el ámbito general, no una posición o forma exactas.',
    disputed: 'Existen interpretaciones publicadas que discrepan entre sí.',
  },
  en: {
    secure: 'Supported by strong evidence or broad scholarly agreement.',
    probable: 'Well supported, although some reconstruction is required.',
    approximate: 'The general area is known, but not an exact position or form.',
    disputed: 'Published interpretations disagree.',
  },
}

const evidenceLabels: Record<Locale, Record<EvidenceBasis, string>> = {
  es: {
    surviving_fabric: 'fábrica conservada', archaeology: 'arqueología', documentary: 'documentación histórica',
    historical_cartography: 'cartografía histórica', toponymy: 'toponimia', parcel_morphology: 'morfología parcelaria',
    scholarly_reconstruction: 'reconstrucción historiográfica', later_description: 'descripción posterior', other: 'otras pruebas',
  },
  en: {
    surviving_fabric: 'surviving fabric', archaeology: 'archaeology', documentary: 'historical documents',
    historical_cartography: 'historical cartography', toponymy: 'toponymy', parcel_morphology: 'parcel morphology',
    scholarly_reconstruction: 'scholarly reconstruction', later_description: 'later description', other: 'other evidence',
  },
}

const geometryLabels: Record<Locale, Record<GeometryMethod, string>> = {
  es: {
    surviving_footprint: 'huella conservada', archaeological_plan: 'planta arqueológica',
    traced_georeferenced_map: 'mapa georreferenciado', reconstructed_from_multiple_sources: 'reconstrucción a partir de varias fuentes',
    approximate_area: 'área aproximada', representative_point: 'punto representativo', modern_reference_location: 'referencia moderna',
  },
  en: {
    surviving_footprint: 'surviving footprint', archaeological_plan: 'archaeological plan',
    traced_georeferenced_map: 'georeferenced map', reconstructed_from_multiple_sources: 'reconstruction from multiple sources',
    approximate_area: 'approximate area', representative_point: 'representative point', modern_reference_location: 'modern reference location',
  },
}

export function messages(locale: Locale) {
  const en = locale === 'en'
  return {
    locale,
    skipMap: en ? 'Skip to the map' : 'Saltar al mapa',
    mapWorkspace: en ? 'Historical map workspace' : 'Espacio del mapa histórico',
    brandKicker: en ? 'An atlas of the city beneath the city' : 'Un atlas de la ciudad bajo la ciudad',
    metaDescription: en
      ? 'An interactive, sourced and uncertainty-aware atlas of Granada around 1492.'
      : 'Atlas histórico interactivo, documentado y consciente de la incertidumbre de Granada hacia 1492.',
    searchLabel: en ? 'Search historical Granada' : 'Buscar en la Granada histórica',
    searchPlaceholder: en ? 'Search places, names or streets' : 'Buscar lugares, nombres o calles',
    searchResults: en ? 'Search results' : 'Resultados de búsqueda',
    noSearchResults: en ? 'No matches. Try a historical name, street or present-day place.' : 'No hay coincidencias. Prueba un nombre histórico, una calle o un lugar actual.',
    match: en ? 'Match' : 'Coincide',
    resultsFound: (count: number) => en ? `${count} results found` : `${count} resultados encontrados`,
    about: en ? 'About the map' : 'Acerca del mapa',
    aboutShort: en ? 'About' : 'Acerca',
    language: en ? 'Español' : 'English',
    languageLabel: en ? 'Change language to Spanish' : 'Cambiar idioma a inglés',
    periodEyebrow: en ? 'Historical view' : 'Vista histórica',
    period: en ? 'Granada, c. 1492' : 'Granada, c. 1492',
    layers: en ? 'Layers' : 'Capas',
    mapView: en ? 'Map view' : 'Vista del mapa',
    closeLayers: en ? 'Close layers panel' : 'Cerrar el panel de capas',
    modernContext: en ? 'Present-day context' : 'Contexto actual',
    osmReference: en ? 'OpenStreetMap reference' : 'Referencia de OpenStreetMap',
    modernStrength: en ? 'Present-day context intensity' : 'Intensidad del contexto actual',
    historicalOverlay: en ? 'Historical overlay' : 'Superposición histórica',
    visible: en ? 'Visible' : 'Visible',
    hidden: en ? 'Hidden' : 'Oculta',
    historicalOpacity: en ? 'Historical opacity' : 'Opacidad histórica',
    historicalOpacityInput: en ? 'Historical overlay opacity' : 'Opacidad de la superposición histórica',
    categories: en ? 'Categories' : 'Categorías',
    all: en ? 'All' : 'Todas',
    none: en ? 'None' : 'Ninguna',
    elements: (count: number) => en ? `${count} features` : `${count} elementos`,
    locationConfidence: en ? 'Location confidence' : 'Certeza de localización',
    mapLabel: en ? 'Interactive modern map of central Granada with historical features' : 'Mapa moderno interactivo del centro de Granada con elementos históricos',
    mapHelp: en ? 'Use arrow keys to pan and plus or minus to change zoom. Search for a place to centre it and open its historical record.' : 'Usa las teclas de flecha para desplazarte y las teclas más y menos para cambiar el zoom. Busca un lugar para centrarlo y abrir su ficha histórica.',
    loadingMap: en ? 'Loading Granada…' : 'Cargando Granada…',
    mapErrorTitle: en ? 'The basemap could not be loaded.' : 'No se ha podido cargar el mapa base.',
    mapErrorBody: en ? 'Check the map style URL or internet connection.' : 'Comprueba la URL del estilo o la conexión a internet.',
    auditNote: (verified: number, total: number) => en ? `Cartographic review · ${verified} of ${total} geometries checked` : `Revisión cartográfica · ${verified} de ${total} geometrías comprobadas`,
    closePanel: en ? 'Close information panel' : 'Cerrar el panel informativo',
    dismissPanel: en ? 'Dismiss information panel' : 'Descartar el panel informativo',
    aboutProject: en ? 'About the project' : 'Sobre el proyecto',
    projectTitle: en ? 'A city reconstructed with care' : 'Una ciudad reconstruida con rigor',
    fallback: en ? 'This historical record is currently available in Spanish.' : '',
    todayPrefix: en ? 'Today' : 'Hoy',
    whatHere: en ? 'What was here around 1492?' : '¿Qué había aquí hacia 1492?',
    whatAfter: en ? 'What happened afterwards?' : '¿Qué ocurrió después?',
    whatToday: en ? 'What is here today?' : '¿Qué hay hoy?',
    evidenceKicker: en ? 'Historical transparency' : 'Transparencia histórica',
    evidenceTitle: en ? 'How do we know?' : '¿Cómo lo sabemos?',
    location: en ? 'Location' : 'Ubicación',
    date1492: en ? 'Date around 1492' : 'Fecha hacia 1492',
    evidence: en ? 'Evidence' : 'Pruebas',
    geometry: en ? 'Geometry' : 'Geometría',
    bibliography: en ? 'Bibliography' : 'Bibliografía',
    sources: en ? 'Sources' : 'Fuentes',
    locator: en ? 'Locator' : 'Localizador',
    supports: en ? 'Supports' : 'Respalda',
    identifier: en ? 'Identifier' : 'Identificador',
    openSource: en ? 'Open source in a new tab' : 'Abrir fuente en una pestaña nueva',
    categoryLabels: categoryLabels[locale],
    confidenceLabels: confidenceLabels[locale],
    confidenceDescriptions: confidenceDescriptions[locale],
    evidenceLabels: evidenceLabels[locale],
    geometryLabels: geometryLabels[locale],
  }
}

export type Messages = ReturnType<typeof messages>
