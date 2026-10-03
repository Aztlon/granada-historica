import type { Locale } from './pilotSchema'
import {
  localizeEntityPresentation,
  type EntityPresentation,
  type LocalizedEntityPresentation,
  type PeriodTitleDecision,
} from './entityPresentation'
import type { HistoricalFeature, HistoricalFeatureCollection } from './schema'
import type {
  C1550M10_5Candidate,
  PeriodDefinition,
  PeriodHistoricalFeature,
} from './temporalSchema'

export type ComparisonPeriod = 'c1492' | 'c1550'

export type M10_5ReviewItem = C1550M10_5Candidate['items'][number]

export interface InternalComparisonRecord {
  feature: PeriodHistoricalFeature
  review: M10_5ReviewItem
}

export interface InternalComparisonDataset {
  milestone: C1550M10_5Candidate['milestone']
  period: PeriodDefinition
  reviewStatus: C1550M10_5Candidate['status']
  reviewUpdatedOn: string
  signoffs: C1550M10_5Candidate['signoffs']
  presentations: readonly EntityPresentation[]
  titleDecisions: readonly PeriodTitleDecision[]
  records: readonly InternalComparisonRecord[]
}

export interface InternalPeriodDetail {
  feature: PeriodHistoricalFeature
  review: M10_5ReviewItem
  milestone: InternalComparisonDataset['milestone']
  localizedFeature: HistoricalFeature
  reviewStatus: InternalComparisonDataset['reviewStatus']
  reviewUpdatedOn: string
  signoffs: InternalComparisonDataset['signoffs']
  localizedPresentation: LocalizedEntityPresentation
  titleDecision: PeriodTitleDecision
}

export interface InternalComparisonView {
  collection: HistoricalFeatureCollection
  detailsById: ReadonlyMap<string, InternalPeriodDetail>
}

export interface PeriodUnavailableSelection {
  featureId: string
  name: string
  currentPeriod: ComparisonPeriod
  alternativePeriod: ComparisonPeriod
  reason: 'outside_review_slice' | 'not_yet_present'
}

export type InternalComparisonLoader = () => Promise<InternalComparisonDataset>

export function localizeInternalComparison(
  dataset: InternalComparisonDataset,
  locale: Locale,
): InternalComparisonView {
  const detailsById = new Map<string, InternalPeriodDetail>()
  const presentationsById = new Map(
    dataset.presentations.map((presentation) => [presentation.entity_id, presentation]),
  )
  const titleDecisionsById = new Map(
    dataset.titleDecisions.map((decision) => [decision.feature_id, decision]),
  )
  const features = dataset.records.map((record) => {
    const presentation = presentationsById.get(record.feature.id)
    const titleDecision = titleDecisionsById.get(record.feature.id)
    if (!presentation || !titleDecision) {
      throw new Error(`Falta la presentación o la decisión de título de ${record.feature.id}.`)
    }
    const localizedPresentation = localizeEntityPresentation(presentation, locale)
    const localizedFeature = toHistoricalFeature(
      record,
      dataset.period,
      locale,
      localizedPresentation,
      titleDecision,
    )
    detailsById.set(localizedFeature.id, {
      ...record,
      localizedFeature,
      milestone: dataset.milestone,
      reviewStatus: dataset.reviewStatus,
      reviewUpdatedOn: dataset.reviewUpdatedOn,
      signoffs: dataset.signoffs,
      localizedPresentation,
      titleDecision,
    })
    return localizedFeature
  })

  return {
    collection: { type: 'FeatureCollection', features },
    detailsById,
  }
}

function toHistoricalFeature(
  record: InternalComparisonRecord,
  period: PeriodDefinition,
  locale: Locale,
  presentation: LocalizedEntityPresentation,
  titleDecision: PeriodTitleDecision,
): HistoricalFeature {
  const source = record.feature
  const content = record.review.content[locale]
  const citations = deduplicateCitations(record.review.claims.flatMap((claim) =>
    claim.citations.map((citation) => ({
      ...citation,
      supports: claim.text[locale],
    })),
  ))

  return {
    type: 'Feature',
    id: source.id,
    geometry: source.geometry,
    properties: {
      id: source.id,
      name: titleDecision.title[locale],
      historical_name: source.properties.name,
      modern_name: source.properties.modern_search_terms[0] ?? null,
      aliases: source.properties.aliases,
      modern_search_terms: source.properties.modern_search_terms,
      category: source.properties.category,
      subtype: source.properties.subtype,
      period: {
        from_year: period.representative_year,
        to_year: period.representative_year,
        from_precision: 'circa',
        to_precision: 'circa',
        note: period.interpretation[locale],
      },
      present_c1492: source.properties.temporal_confidence,
      confidence: {
        location: source.properties.spatial_confidence,
        time: source.properties.temporal_confidence,
      },
      evidence_basis: source.properties.evidence_basis,
      summary: presentation.generalDescription,
      context_1492: content.summary,
      after_1492: content.change_note,
      today: locale === 'en'
        ? 'The internal record does not make a separate claim about present-day survival.'
        : 'La ficha interna no formula una afirmación separada sobre la supervivencia actual.',
      evidence_note: content.evidence_note,
      geometry_method: source.properties.geometry_method,
      geometry_source_refs: source.properties.geometry_source_refs,
      citations,
      publication_status: 'research',
    },
  }
}

function deduplicateCitations(
  citations: HistoricalFeature['properties']['citations'],
): HistoricalFeature['properties']['citations'] {
  const seen = new Set<string>()
  return citations.filter((citation) => {
    const key = `${citation.source_id}\u0000${citation.locator}\u0000${citation.supports}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
