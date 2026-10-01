import { describe, expect, it } from 'vitest'
import {
  distanceMetres,
  englishFeatureTranslations,
  nearestPilotStop,
  parseAppRoute,
  pilotRoute,
  resolveLocale,
} from './pilot'

describe('M7 pilot route', () => {
  it('keeps the approved five-stop sequence', () => {
    expect(pilotRoute.stops.map((stop) => stop.primary_feature_id)).toEqual([
      'gate.bib-rambla',
      'route.zacatin-axis',
      'commerce.alcaiceria',
      'religious.madraza-yusufiyya',
      'religious.medina-great-mosque',
    ])
  })

  it('parses durable route and place paths', () => {
    expect(parseAppRoute('/granada-historica/route/bib-rambla/').kind).toBe('route')
    expect(parseAppRoute('/granada-historica/place/zacatin/').place?.id).toBe('place.zacatin')
    expect(parseAppRoute('/granada-historica/place/unknown/').kind).toBe('not-found')
  })

  it('uses explicit language before browser preference', () => {
    expect(resolveLocale(new URL('https://example.test/?lang=es'), ['en-US'])).toBe('es')
    expect(resolveLocale(new URL('https://example.test/'), ['en-GB'])).toBe('en')
    expect(resolveLocale(new URL('https://example.test/'), ['fr-FR'])).toBe('es')
  })

  it('contains complete English pilot translations', () => {
    expect(Object.keys(englishFeatureTranslations)).toHaveLength(6)
  })

  it('calculates the nearest stop locally', () => {
    const nearest = nearestPilotStop({
      longitude: -3.59975,
      latitude: 37.17464,
      accuracy: 10,
      timestamp: 1,
    })
    expect(nearest.stop.id).toBe('place.bib-rambla')
    expect(nearest.distance).toBeLessThan(5)
    expect(distanceMetres(pilotRoute.stops[0].focus, pilotRoute.stops[1].focus)).toBeGreaterThan(45)
  })
})
