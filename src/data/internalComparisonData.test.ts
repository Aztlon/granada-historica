import { internalComparisonDataset } from './internalComparisonData'
import { localizeInternalComparison } from './internalComparisonTypes'
import { featureCollectionSchema } from './schema'
import { searchHistoricalFeatures } from './search'
import { M10_5_FEATURE_IDS } from './temporalSchema'

describe('M10.5 internal comparison dataset', () => {
  it('loads exactly the 39 audited M10.5 candidate entities and no wider research inventory', () => {
    expect(internalComparisonDataset.records.map(({ feature }) => feature.id)).toEqual(M10_5_FEATURE_IDS)
    expect(internalComparisonDataset.milestone).toBe('M10.5')
    expect(internalComparisonDataset.reviewStatus).toBe('ready_for_specialist_review')
    expect(internalComparisonDataset.signoffs).toHaveLength(6)
    expect(internalComparisonDataset.signoffs.every(({ status }) => status === 'pending')).toBe(true)
  })

  it.each(['es', 'en'] as const)('builds a valid, cited %s comparison view', (locale) => {
    const view = localizeInternalComparison(internalComparisonDataset, locale)
    expect(() => featureCollectionSchema.parse(view.collection)).not.toThrow()
    expect(view.collection.features).toHaveLength(39)
    for (const feature of view.collection.features) {
      expect(feature.properties.publication_status).toBe('research')
      expect(feature.properties.citations.length).toBeGreaterThan(0)
      expect(view.detailsById.get(feature.id)?.review.geometry_review.audit_status).toBe('in_review')
    }
  })

  it('makes the expanded candidate searchable in both languages', () => {
    const english = localizeInternalComparison(internalComparisonDataset, 'en').collection.features
    const spanish = localizeInternalComparison(internalComparisonDataset, 'es').collection.features
    expect(searchHistoricalFeatures(english, 'Royal Chancery')[0]?.feature.id).toBe('civic.real-chancilleria')
    expect(searchHistoricalFeatures(spanish, 'San Cristóbal')[0]?.feature.id).toBe('religious.san-cristobal')
  })
})
