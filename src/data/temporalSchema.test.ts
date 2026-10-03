import periodsJson from '../../data/periods.json'
import c1550InventoryJson from '../../data/research/c1550-inventory.json'
import {
  c1550ResearchInventorySchema,
  featurePeriodStateSchema,
  periodDefinitionSchema,
  periodHistoricalFeatureSchema,
  periodRegistrySchema,
} from './temporalSchema'

describe('multi-period research contracts', () => {
  it('keeps c. 1492 published and c. 1550 private research', () => {
    const registry = periodRegistrySchema.parse(periodsJson)

    expect(registry.periods.find((period) => period.id === 'c1492')?.status).toBe('published')
    expect(registry.periods.find((period) => period.id === 'c1550')?.status).toBe('research')
  })

  it('validates the complete initial c. 1550 inventory', () => {
    const inventory = c1550ResearchInventorySchema.parse(c1550InventoryJson)

    expect(inventory.existing_entity_triage).toHaveLength(58)
    expect(inventory.candidate_entities).toHaveLength(23)
    expect(inventory.change_themes).toHaveLength(6)
  })

  it('accepts a cited, unfinished building state', () => {
    expect(featurePeriodStateSchema.safeParse({
      period_id: 'c1550',
      presence: 'present',
      temporal_confidence: 'secure',
      spatial_confidence: 'approximate',
      change_from_previous: 'newly_built',
      physical_state: 'under_construction',
      name: 'Palacio de Carlos V',
      function: 'Palacio imperial en construcción',
      summary: 'El segundo piso ya se había levantado, pero el palacio seguía en obras.',
      evidence_note: 'La cronología de obra requiere una geometría específica para la fase de 1550.',
      geometry_variant_id: 'c1550.royal.palace-charles-v',
      citations: [{
        source_id: 'source.alhambra-charles-v-palace',
        locator: 'Secuencia de obras 1533–1550',
        supports: 'Fase material del palacio hacia 1550.',
      }],
    }).success).toBe(true)
  })

  it('rejects a representative year outside its evidence window', () => {
    expect(periodDefinitionSchema.safeParse({
      id: 'c1550',
      representative_year: 1550,
      evidence_window: { from_year: 1560, to_year: 1570 },
      status: 'research',
      label: { es: 'Granada, c. 1550', en: 'Granada, c. 1550' },
      short_label: { es: 'c. 1550', en: 'c. 1550' },
      interpretation: { es: 'Estado de prueba.', en: 'Test state.' },
    }).success).toBe(false)
  })

  it('keeps period geometry and provenance together in ordinary GeoJSON', () => {
    expect(periodHistoricalFeatureSchema.safeParse({
      type: 'Feature',
      id: 'royal.palace-charles-v',
      properties: {
        id: 'royal.palace-charles-v',
        period_id: 'c1550',
        presence: 'present',
        temporal_confidence: 'secure',
        spatial_confidence: 'approximate',
        change_from_previous: 'newly_built',
        physical_state: 'under_construction',
        name: 'Palacio de Carlos V',
        function: 'Palacio imperial en construcción',
        summary: 'El palacio existía como obra imperial todavía incompleta hacia 1550.',
        evidence_note: 'La fase requiere una huella revisada y una representación incompleta.',
        geometry_variant_id: 'c1550.royal.palace-charles-v',
        citations: [{
          source_id: 'source.alhambra-charles-v-palace',
          locator: 'Secuencia de obras 1533–1550',
          supports: 'Fase material del palacio hacia 1550.',
        }],
        aliases: [],
        modern_search_terms: ['Palacio de Carlos V'],
        category: 'royal_elite',
        subtype: 'imperial_palace',
        evidence_basis: ['documentary', 'surviving_fabric'],
        geometry_method: 'reconstructed_from_multiple_sources',
        geometry_source_refs: ['source.alhambra-charles-v-palace'],
        publication_status: 'research',
      },
      geometry: { type: 'Point', coordinates: [-3.588, 37.176] },
    }).success).toBe(true)
  })
})
