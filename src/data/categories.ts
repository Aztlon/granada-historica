import type {
  Confidence,
  EvidenceBasis,
  FeatureCategory,
  GeometryMethod,
} from './schema'

export const CATEGORY_CONFIG: Record<
  FeatureCategory,
  { label: string; shortLabel: string; color: string }
> = {
  urban_structure: {
    label: 'Estructura urbana',
    shortLabel: 'Estructura urbana',
    color: '#9a6845',
  },
  walls_gates: {
    label: 'Murallas y puertas',
    shortLabel: 'Murallas y puertas',
    color: '#9f493d',
  },
  religion_learning: {
    label: 'Religión y conocimiento',
    shortLabel: 'Religión y saber',
    color: '#6e4f88',
  },
  commerce_civic: {
    label: 'Comercio y vida cívica',
    shortLabel: 'Comercio y vida cívica',
    color: '#bd7a2a',
  },
  water_infrastructure: {
    label: 'Agua e infraestructuras',
    shortLabel: 'Agua',
    color: '#247d91',
  },
  royal_elite: {
    label: 'Paisajes regios y de élite',
    shortLabel: 'Espacios regios',
    color: '#b23f37',
  },
  burial_other: {
    label: 'Ámbitos funerarios y otros',
    shortLabel: 'Funerario y otros',
    color: '#687267',
  },
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  secure: 'Segura',
  probable: 'Probable',
  approximate: 'Aproximada',
  disputed: 'Controvertida',
}

export const CONFIDENCE_DESCRIPTIONS: Record<Confidence, string> = {
  secure: 'Respaldada por pruebas sólidas o por un amplio consenso.',
  probable: 'Bien fundamentada, aunque requiere cierta reconstrucción.',
  approximate: 'Se conoce el ámbito general, no una posición o forma exactas.',
  disputed: 'Existen interpretaciones publicadas que discrepan entre sí.',
}

export const EVIDENCE_LABELS: Record<EvidenceBasis, string> = {
  surviving_fabric: 'fábrica conservada',
  archaeology: 'arqueología',
  documentary: 'documentación histórica',
  historical_cartography: 'cartografía histórica',
  toponymy: 'toponimia',
  parcel_morphology: 'morfología parcelaria',
  scholarly_reconstruction: 'reconstrucción historiográfica',
  later_description: 'descripción posterior',
  other: 'otras pruebas',
}

export const GEOMETRY_METHOD_LABELS: Record<GeometryMethod, string> = {
  surviving_footprint: 'huella conservada',
  archaeological_plan: 'planta arqueológica',
  traced_georeferenced_map: 'mapa georreferenciado',
  reconstructed_from_multiple_sources: 'reconstrucción a partir de varias fuentes',
  approximate_area: 'área aproximada',
  representative_point: 'punto representativo',
  modern_reference_location: 'referencia moderna',
}

export const SUBTYPE_LABELS: Record<string, string> = {
  madrasa: 'Madraza',
  river: 'Río',
  palatine_city: 'Ciudad palatina',
  palatine_estate: 'Finca palatina',
  urban_sector: 'Sector urbano',
  late_nasrid_extent: 'Extensión urbana aproximada',
  defensive_wall: 'Muralla o cerca',
  historical_route: 'Ruta histórica',
  city_gate: 'Puerta urbana',
  lost_city_gate: 'Puerta desaparecida',
  palatine_gate: 'Puerta palatina',
}
