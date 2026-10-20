import publicRegistryJson from '../../data/entity-presentations.json'
import researchRegistryJson from '../../data/research/c1550/entity-presentations.json'
import titleDecisionsJson from '../../data/research/c1550/period-title-decisions.json'
import {
  entityPresentationRegistrySchema,
  localizeEntityPresentation,
  periodTitleDecisionRegistrySchema,
} from './entityPresentation'

describe('entity presentation registries', () => {
  it('provides English introductions for every public entity while preserving Spanish routing', () => {
    const registry = entityPresentationRegistrySchema.parse(publicRegistryJson)
    for (const presentation of registry.presentations) {
      const english = localizeEntityPresentation(presentation, 'en')
      expect(presentation.general_description.en).toBeTruthy()
      expect(english.generalDescription).toBe(presentation.general_description.en)
      expect(english.isLanguageFallback).toBe(false)
      expect(localizeEntityPresentation(presentation, 'es').generalDescription)
        .toBe(presentation.general_description.es)
    }
  })

  it('explicitly falls back to Spanish when an optional English introduction is absent', () => {
    const presentation = {
      entity_id: 'gate.elvira',
      canonical_name: { es: 'Puerta de Elvira' },
      general_description: { es: 'Acceso histórico de la ciudad.' },
      source_refs: ['source.granada-elvira-gate'],
    }
    expect(localizeEntityPresentation(presentation, 'en')).toEqual({
      entityId: 'gate.elvira',
      canonicalName: 'Puerta de Elvira',
      generalDescription: 'Acceso histórico de la ciudad.',
      isLanguageFallback: true,
    })
    expect(localizeEntityPresentation(presentation, 'es').isLanguageFallback).toBe(false)
  })

  it('covers the 58 public and 17 research-only information sheets without overlap', () => {
    const publicRegistry = entityPresentationRegistrySchema.parse(publicRegistryJson)
    const researchRegistry = entityPresentationRegistrySchema.parse(researchRegistryJson)
    const publicIds = new Set(publicRegistry.presentations.map(({ entity_id }) => entity_id))
    const researchIds = new Set(researchRegistry.presentations.map(({ entity_id }) => entity_id))

    expect(publicRegistry.presentations).toHaveLength(58)
    expect(researchRegistry.presentations).toHaveLength(17)
    expect(publicIds.size).toBe(58)
    expect(researchIds.size).toBe(17)
    expect([...researchIds].filter((id) => publicIds.has(id))).toEqual([])
  })

  it('uses the agreed stable presentation for the Elvira axis', () => {
    const registry = entityPresentationRegistrySchema.parse(publicRegistryJson)
    const elvira = registry.presentations.find(({ entity_id }) => entity_id === 'route.elvira-axis')

    expect(elvira?.canonical_name.es).toBe('Eje de Elvira')
    expect(elvira?.general_description.es).toBe(
      'Corredor histórico de la ciudad entre el centro urbano y la Puerta de Elvira.',
    )
  })

  it('requires a sourced rationale for every historical period-title variant', () => {
    const registry = periodTitleDecisionRegistrySchema.parse(titleDecisionsJson)

    expect(registry.decisions).toHaveLength(39)
    for (const decision of registry.decisions) {
      if (decision.usage === 'historical_variant') {
        expect(decision.rationale.es.length).toBeGreaterThan(20)
        expect(decision.source_refs.length).toBeGreaterThan(0)
      } else {
        expect(decision.rationale).toBeNull()
        expect(decision.source_refs).toEqual([])
      }
    }
  })
})
