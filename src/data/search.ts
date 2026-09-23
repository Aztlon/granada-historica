import type { HistoricalFeature } from './schema'

export interface HistoricalSearchResult {
  feature: HistoricalFeature
  matchedOn: string | null
  score: number
}

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function searchHistoricalFeatures(
  features: readonly HistoricalFeature[],
  query: string,
  limit = 8,
): HistoricalSearchResult[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  const tokens = normalizedQuery.split(/\s+/)

  return features
    .map((feature) => rankFeature(feature, normalizedQuery, tokens))
    .filter((result): result is HistoricalSearchResult => result !== null)
    .sort((left, right) => right.score - left.score || left.feature.properties.name.localeCompare(right.feature.properties.name, 'es'))
    .slice(0, limit)
}

function rankFeature(
  feature: HistoricalFeature,
  normalizedQuery: string,
  tokens: readonly string[],
): HistoricalSearchResult | null {
  const { properties } = feature
  const fields = [
    { value: properties.name, weight: 100 },
    { value: properties.historical_name, weight: 90 },
    { value: properties.modern_name, weight: 80 },
    ...properties.aliases.map((value) => ({ value, weight: 75 })),
    ...properties.modern_search_terms.map((value) => ({ value, weight: 60 })),
  ].filter((field): field is { value: string; weight: number } => Boolean(field.value))

  let bestScore = 0
  let matchedOn: string | null = null

  for (const field of fields) {
    const normalizedValue = normalizeSearchText(field.value)
    const allTokensMatch = tokens.every((token) => normalizedValue.includes(token))
    if (!allTokensMatch) continue

    let score = field.weight
    if (normalizedValue === normalizedQuery) score += 50
    else if (normalizedValue.startsWith(normalizedQuery)) score += 30
    else if (normalizedValue.includes(normalizedQuery)) score += 15

    if (score > bestScore) {
      bestScore = score
      matchedOn = field.value === properties.name ? null : field.value
    }
  }

  return bestScore > 0 ? { feature, matchedOn, score: bestScore } : null
}
