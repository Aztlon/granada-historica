import { historicalFeatureCollection } from './historicalData'
import { englishFeatureTranslations, localizeFeature, pilotRoute } from './pilot'
import { featureTranslationsSchema } from './pilotSchema'

const trancheIds = [
  'royal.alhambra',
  'royal.generalife',
  'gate.elvira',
  'gate.alhambra-arms',
  'gate.alhambra-justice',
  'commerce.corral-carbon',
  'civic.maristan',
  'water.banuelo',
  'urban.albaicin',
  'urban.lower-medina',
]

describe('public English coverage', () => {
  it('adds the bounded ten-record tranche to the six existing complete records', () => {
    expect(historicalFeatureCollection.features).toHaveLength(58)
    expect(Object.keys(englishFeatureTranslations)).toHaveLength(16)
    for (const id of trancheIds) {
      expect(englishFeatureTranslations[id]).toBeDefined()
    }
    expect(pilotRoute.status).toBe('preview')
  })

  it('preserves citation identity, order, geometry, dates and confidence across localization', () => {
    for (const original of historicalFeatureCollection.features) {
      const before = structuredClone(original)
      const translation = englishFeatureTranslations[original.id]
      const localized = localizeFeature(original, 'en')
      expect(localized.isFallback).toBe(!translation)
      expect(localizeFeature(original, 'es')).toEqual({ feature: original, isFallback: false })
      if (!translation) {
        expect(localized.feature).toBe(original)
        continue
      }
      const { properties } = localized.feature
      expect(translation.citation_supports).toHaveLength(original.properties.citations.length)
      expect(properties.citations).toEqual(original.properties.citations.map((citation, index) => ({
        ...citation,
        supports: translation.citation_supports[index],
      })))
      expect(properties.period).toEqual({ ...original.properties.period, note: translation.period_note })
      expect(properties.confidence).toEqual(original.properties.confidence)
      expect(properties.evidence_basis).toEqual(original.properties.evidence_basis)
      expect(properties.geometry_source_refs).toEqual(original.properties.geometry_source_refs)
      expect(localized.feature.geometry).toEqual(original.geometry)
      for (const field of ['summary', 'context_1492', 'after_1492', 'today', 'evidence_note'] as const) {
        expect(properties[field]).toBe(translation[field])
      }
      expect(original).toEqual(before)
    }
  })

  it('rejects incomplete English records rather than assembling mixed-language narratives', () => {
    const incomplete = { ...englishFeatureTranslations['water.banuelo'], today: undefined }
    expect(featureTranslationsSchema.safeParse({ features: { 'water.banuelo': incomplete } }).success)
      .toBe(false)
  })

  it('retains the Bañuelo dating dispute and the urban boundary caveats', () => {
    expect(englishFeatureTranslations['water.banuelo'].period_note)
      .toContain('eleventh century and a proposed twelfth-century date')
    expect(englishFeatureTranslations['water.banuelo'].evidence_note).toContain('disputed')
    expect(englishFeatureTranslations['urban.albaicin'].evidence_note)
      .toContain('does not correspond to the present administrative neighbourhood')
    expect(englishFeatureTranslations['urban.lower-medina'].evidence_note)
      .toContain('does not claim that they all formed a single neighbourhood')
  })
})
