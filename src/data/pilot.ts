import routeJson from '../../data/pilot-route.json'
import englishTranslationsJson from '../../data/translations/en.json'
import type { HistoricalFeature } from './schema'
import {
  featureTranslationsSchema,
  pilotRouteSchema,
  type FeatureTranslation,
  type Locale,
  type PlaceStop,
} from './pilotSchema'
import type { LocationFix } from '../location/types'

export const pilotRoute = pilotRouteSchema.parse(routeJson)
export const englishFeatureTranslations = featureTranslationsSchema.parse(
  englishTranslationsJson,
).features

export const placeBySlug = new Map(
  pilotRoute.stops.map((stop) => [stop.slug, stop]),
)

export const placeById = new Map(
  pilotRoute.stops.map((stop) => [stop.id, stop]),
)

export const pilotFeatureIds = new Set([
  ...pilotRoute.stops.map((stop) => stop.primary_feature_id),
  ...pilotRoute.stops.flatMap((stop) => stop.related_feature_ids),
])

export interface AppRoute {
  kind: 'map' | 'route' | 'place' | 'not-found'
  place: PlaceStop | null
}

export function resolveLocale(url: URL, browserLanguages: readonly string[]): Locale {
  const requested = url.searchParams.get('lang')
  if (requested === 'en' || requested === 'es') return requested
  return browserLanguages.some((language) => language.toLowerCase().startsWith('en'))
    ? 'en'
    : 'es'
}

export function parseAppRoute(pathname: string, baseUrl = import.meta.env.BASE_URL): AppRoute {
  const base = normalizeBase(baseUrl)
  const deploymentBase = '/granada-historica/'
  const relative = pathname.startsWith(base) && base !== '/'
    ? pathname.slice(base.length)
    : pathname.startsWith(deploymentBase)
      ? pathname.slice(deploymentBase.length)
      : pathname.replace(/^\/+/, '')
  const parts = relative.split('/').filter(Boolean)
  if (parts.length === 0) return { kind: 'map', place: null }
  if (parts.length === 2 && parts[0] === 'route' && parts[1] === pilotRoute.slug) {
    return { kind: 'route', place: null }
  }
  if (parts.length === 2 && parts[0] === 'place') {
    const place = placeBySlug.get(parts[1]) ?? null
    return place ? { kind: 'place', place } : { kind: 'not-found', place: null }
  }
  return { kind: 'not-found', place: null }
}

export function routePath(baseUrl = import.meta.env.BASE_URL) {
  return `${normalizeBase(baseUrl)}route/${pilotRoute.slug}/`
}

export function placePath(slug: string, baseUrl = import.meta.env.BASE_URL) {
  return `${normalizeBase(baseUrl)}place/${slug}/`
}

export function mapPath(baseUrl = import.meta.env.BASE_URL) {
  return normalizeBase(baseUrl)
}

export function localizeFeature(
  feature: HistoricalFeature,
  locale: Locale,
): { feature: HistoricalFeature; isFallback: boolean } {
  if (locale === 'es') return { feature, isFallback: false }
  const translation = englishFeatureTranslations[feature.id]
  if (!translation) return { feature, isFallback: true }
  return { feature: applyTranslation(feature, translation), isFallback: false }
}

export function localizeFeatures(features: readonly HistoricalFeature[], locale: Locale) {
  return features.map((feature) => localizeFeature(feature, locale).feature)
}

export function nearestPilotStop(fix: LocationFix) {
  return pilotRoute.stops
    .map((stop) => ({ stop, distance: distanceMetres([fix.longitude, fix.latitude], stop.focus) }))
    .sort((left, right) => left.distance - right.distance)[0]
}

export function distanceMetres(
  from: readonly [number, number],
  to: readonly [number, number],
) {
  const radians = Math.PI / 180
  const latitude1 = from[1] * radians
  const latitude2 = to[1] * radians
  const latitudeDelta = (to[1] - from[1]) * radians
  const longitudeDelta = (to[0] - from[0]) * radians
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function applyTranslation(
  feature: HistoricalFeature,
  translation: FeatureTranslation,
): HistoricalFeature {
  return {
    ...feature,
    properties: {
      ...feature.properties,
      name: translation.name,
      historical_name: translation.historical_name,
      modern_name: translation.modern_name,
      aliases: translation.aliases,
      modern_search_terms: translation.modern_search_terms,
      period: {
        ...feature.properties.period,
        note: translation.period_note,
      },
      summary: translation.summary,
      context_1492: translation.context_1492,
      after_1492: translation.after_1492,
      today: translation.today,
      evidence_note: translation.evidence_note,
      citations: feature.properties.citations.map((citation, index) => ({
        ...citation,
        supports: translation.citation_supports[index] ?? citation.supports,
      })),
    },
  }
}

function normalizeBase(baseUrl: string) {
  const withLeadingSlash = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}
