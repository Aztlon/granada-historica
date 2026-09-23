import { historicalFeatureCollection } from './historicalData'
import { normalizeSearchText, searchHistoricalFeatures } from './search'

describe('historical search', () => {
  it('normaliza acentos, puntuación y mayúsculas', () => {
    expect(normalizeSearchText('  AL-BAYYĀZĪN / Albaicín  ')).toBe(
      'al bayyazin albaicin',
    )
  })

  it('busca por nombre histórico y alias', () => {
    const [result] = searchHistoricalFeatures(
      historicalFeatureCollection.features,
      'Bab Ilbira',
    )

    expect(result?.feature.id).toBe('gate.elvira')
    expect(result?.matchedOn).toBe('Bab Ilbira')
  })

  it('busca por hitos y calles modernas', () => {
    const results = searchHistoricalFeatures(
      historicalFeatureCollection.features,
      'Calle Oficios',
    )

    expect(results.map((result) => result.feature.id)).toContain(
      'religious.madraza-yusufiyya',
    )
  })
})
