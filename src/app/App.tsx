import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FeatureDrawer } from '../components/FeatureDrawer'
import { Header } from '../components/Header'
import { LayerControl } from '../components/LayerControl'
import { MapLocationControl } from '../components/MapLocationControl'
import { PeriodSelector } from '../components/PeriodSelector'
import { PlacePanel } from '../components/PlacePanel'
import { CATEGORY_CONFIG } from '../data/categories'
import {
  localizeEntityPresentation,
  publicEntityPresentationsById,
} from '../data/entityPresentation'
import {
  geometryAuditSummary,
  gazetteerByFeatureId,
  historicalFeatureCollection,
  sourcesById,
} from '../data/historicalData'
import {
  localizeInternalComparison,
  type ComparisonPeriod,
  type InternalComparisonDataset,
  type InternalComparisonLoader,
  type PeriodUnavailableSelection,
} from '../data/internalComparisonTypes'
import {
  localizeFeature,
  localizeFeatures,
  parseAppRoute,
  pilotRoute,
  placeById,
  placePath,
  resolveLocale,
  routePath,
  type AppRoute,
} from '../data/pilot'
import type { Locale, PlaceStop } from '../data/pilotSchema'
import { featureIdSchema, type FeatureCategory, type HistoricalFeatureCollection } from '../data/schema'
import { messages } from '../i18n/messages'
import { useMapLocation } from '../location/useMapLocation'

const MapView = lazy(() => import('../map/MapView').then((module) => ({ default: module.MapView })))
const NO_PILOT_PLACES: readonly PlaceStop[] = []
const EMPTY_FEATURE_COLLECTION: HistoricalFeatureCollection = { type: 'FeatureCollection', features: [] }
const DEFAULT_INTERNAL_COMPARISON_LOADER: InternalComparisonLoader | null = __ENABLE_INTERNAL_C1550__
  ? () => import('../data/internalComparisonData').then((module) => module.internalComparisonDataset)
  : null

interface AppProps {
  internalComparisonLoader?: InternalComparisonLoader | null
}

export function App({ internalComparisonLoader = DEFAULT_INTERNAL_COMPARISON_LOADER }: AppProps = {}) {
  const isInternalComparison = internalComparisonLoader !== null
  const routeReopenRef = useRef<HTMLButtonElement>(null)
  const restoreRouteFocusRef = useRef(false)
  const initialUrl = useMemo(() => new URL(window.location.href), [])
  const initialFeatureId = useMemo(
    () => getFeatureId(initialUrl, isInternalComparison),
    [initialUrl, isInternalComparison],
  )
  const initialPeriod = useMemo(
    () => getComparisonPeriod(initialUrl, isInternalComparison),
    [initialUrl, isInternalComparison],
  )
  const initialRoute = useMemo(() => parseAppRoute(initialUrl.pathname), [initialUrl])
  const [locale, setLocale] = useState<Locale>(() => resolveLocale(initialUrl, navigator.languages))
  const [appRoute, setAppRoute] = useState<AppRoute>(initialRoute)
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(initialFeatureId))
  const [isPlacePanelOpen, setIsPlacePanelOpen] = useState(
    !initialFeatureId && (initialRoute.kind === 'route' || initialRoute.kind === 'place'),
  )
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false)
  const [isHistoricalVisible, setIsHistoricalVisible] = useState(true)
  const [isModernVisible, setIsModernVisible] = useState(true)
  const [modernStrength, setModernStrength] = useState(0.55)
  const [historicalOpacity, setHistoricalOpacity] = useState(0.85)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(initialFeatureId)
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>(initialPeriod)
  const [internalDataset, setInternalDataset] = useState<InternalComparisonDataset | null>(null)
  const [internalDataError, setInternalDataError] = useState(false)
  const [visibleCategories, setVisibleCategories] = useState<Set<FeatureCategory>>(
    () => new Set(Object.keys(CATEGORY_CONFIG) as FeatureCategory[]),
  )
  const mapLocation = useMapLocation()
  const [isFollowingLocation, setIsFollowingLocation] = useState(false)
  const [locationRecenterRequest, setLocationRecenterRequest] = useState(0)
  const text = useMemo(() => messages(locale), [locale])

  useEffect(() => {
    if (!internalComparisonLoader) return
    let cancelled = false
    internalComparisonLoader()
      .then((dataset) => {
        if (!cancelled) setInternalDataset(dataset)
      })
      .catch(() => {
        if (!cancelled) setInternalDataError(true)
      })
    return () => { cancelled = true }
  }, [internalComparisonLoader])

  const localizedFeatures = useMemo(
    () => localizeFeatures(historicalFeatureCollection.features, locale),
    [locale],
  )
  const localizedCollection = useMemo<HistoricalFeatureCollection>(() => ({
    ...historicalFeatureCollection,
    features: localizedFeatures,
  }), [localizedFeatures])
  const internalView = useMemo(
    () => internalDataset ? localizeInternalComparison(internalDataset, locale) : null,
    [internalDataset, locale],
  )
  const activeCollection = comparisonPeriod === 'c1550'
    ? internalView?.collection ?? EMPTY_FEATURE_COLLECTION
    : localizedCollection
  const activeFeatures = activeCollection.features
  const localizedFeaturesById = useMemo(
    () => new Map(localizedFeatures.map((feature) => [feature.id, feature])),
    [localizedFeatures],
  )
  const selectedOriginalFeature = useMemo(
    () => comparisonPeriod === 'c1492'
      ? historicalFeatureCollection.features.find((feature) => feature.id === selectedFeatureId) ?? null
      : null,
    [comparisonPeriod, selectedFeatureId],
  )
  const selectedLocalization = useMemo(
    () => selectedOriginalFeature ? localizeFeature(selectedOriginalFeature, locale) : null,
    [locale, selectedOriginalFeature],
  )
  const selectedPresentation = useMemo(() => {
    if (comparisonPeriod !== 'c1492' || !selectedFeatureId) return null
    const presentation = publicEntityPresentationsById.get(selectedFeatureId)
    return presentation ? localizeEntityPresentation(presentation, locale) : null
  }, [comparisonPeriod, locale, selectedFeatureId])
  const selectedFeature = activeFeatures.find((feature) => feature.id === selectedFeatureId) ?? null
  const selectedPeriodDetail = comparisonPeriod === 'c1550' && selectedFeatureId
    ? internalView?.detailsById.get(selectedFeatureId) ?? null
    : null
  const unavailableSelection = useMemo<PeriodUnavailableSelection | null>(() => {
    if (!selectedFeatureId || selectedFeature || !internalView) return null
    if (comparisonPeriod === 'c1550') {
      const publicFeature = localizedFeatures.find((feature) => feature.id === selectedFeatureId)
      if (!publicFeature) return null
      return {
        featureId: selectedFeatureId,
        name: publicFeature.properties.name,
        currentPeriod: 'c1550',
        alternativePeriod: 'c1492',
        reason: 'outside_review_slice',
      }
    }
    const c1550Feature = internalView.collection.features.find((feature) => feature.id === selectedFeatureId)
    if (!c1550Feature) return null
    return {
      featureId: selectedFeatureId,
      name: c1550Feature.properties.name,
      currentPeriod: 'c1492',
      alternativePeriod: 'c1550',
      reason: 'not_yet_present',
    }
  }, [comparisonPeriod, internalView, localizedFeatures, selectedFeature, selectedFeatureId])

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      (Object.keys(CATEGORY_CONFIG) as FeatureCategory[]).map((category) => [category, 0]),
    ) as Record<FeatureCategory, number>
    for (const feature of activeFeatures) counts[feature.properties.category] += 1
    return counts
  }, [activeFeatures])

  const selectFeature = useCallback((featureId: string) => {
    setSelectedFeatureId(featureId)
    setIsDrawerOpen(true)
    setIsPlacePanelOpen(false)
    setIsHistoricalVisible(true)
    const feature = activeFeatures.find((candidate) => candidate.id === featureId)
    if (feature) {
      setVisibleCategories((current) => current.has(feature.properties.category)
        ? current
        : new Set(current).add(feature.properties.category))
    }
    updateUrlState(featureId, comparisonPeriod, true)
  }, [activeFeatures, comparisonPeriod])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedFeatureId(null)
    updateUrlState(null, comparisonPeriod, isInternalComparison)
    if (appRoute.kind === 'place' || appRoute.kind === 'route') setIsPlacePanelOpen(true)
  }, [appRoute.kind, comparisonPeriod, isInternalComparison])

  const selectPeriod = useCallback((period: ComparisonPeriod) => {
    if (period === 'c1550' && !internalDataset) return
    setComparisonPeriod(period)
    setIsHistoricalVisible(true)
    setIsLayerControlOpen(false)
    setIsPlacePanelOpen(false)
    updateUrlState(selectedFeatureId, period, true)
  }, [internalDataset, selectedFeatureId])

  const selectPlace = useCallback((placeId: string) => {
    const place = placeById.get(placeId)
    if (!place) return
    const url = new URL(window.location.href)
    url.pathname = placePath(place.slug)
    url.searchParams.delete('feature')
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setAppRoute({ kind: 'place', place })
    setSelectedFeatureId(null)
    setIsDrawerOpen(false)
    setIsPlacePanelOpen(true)
  }, [])

  const openRoute = useCallback(() => {
    const url = new URL(window.location.href)
    url.pathname = routePath()
    url.searchParams.delete('feature')
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setAppRoute({ kind: 'route', place: null })
    setSelectedFeatureId(null)
    setIsDrawerOpen(false)
    setIsPlacePanelOpen(true)
  }, [])

  const closePlacePanel = useCallback(() => {
    restoreRouteFocusRef.current = true
    setIsPlacePanelOpen(false)
  }, [])

  useEffect(() => {
    if (isPlacePanelOpen || !restoreRouteFocusRef.current) return
    routeReopenRef.current?.focus()
    restoreRouteFocusRef.current = false
  }, [isPlacePanelOpen])

  const toggleLocale = useCallback(() => {
    const next: Locale = locale === 'es' ? 'en' : 'es'
    const url = new URL(window.location.href)
    url.searchParams.set('lang', next)
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setLocale(next)
  }, [locale])

  useEffect(() => {
    const restoreUrlState = () => {
      const url = new URL(window.location.href)
      const restoredRoute = parseAppRoute(url.pathname)
      const featureId = getFeatureId(url, isInternalComparison)
      const restoredPeriod = getComparisonPeriod(url, isInternalComparison)
      setLocale(resolveLocale(url, navigator.languages))
      setAppRoute(restoredRoute)
      setSelectedFeatureId(featureId)
      setComparisonPeriod(restoredPeriod)
      setIsDrawerOpen(Boolean(featureId))
      setIsPlacePanelOpen(!featureId && (restoredRoute.kind === 'place' || restoredRoute.kind === 'route'))
    }
    window.addEventListener('popstate', restoreUrlState)
    return () => window.removeEventListener('popstate', restoreUrlState)
  }, [isInternalComparison])

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'es-ES'
    document.title = appRoute.place
      ? `${appRoute.place.title[locale]} · Granada Histórica`
      : appRoute.kind === 'route'
        ? `${pilotRoute.title[locale]} · Granada Histórica`
        : 'Granada Histórica'
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) {
      description.content = appRoute.place?.introduction[locale]
        ?? (appRoute.kind === 'route' ? pilotRoute.description[locale] : text.metaDescription)
    }
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.append(robots)
    }
    robots.content = isInternalComparison || (pilotRoute.status === 'preview' && appRoute.kind !== 'map')
      ? 'noindex,nofollow'
      : 'index,follow'
  }, [appRoute, isInternalComparison, locale, text.metaDescription])

  const toggleCategory = (category: FeatureCategory) => {
    setVisibleCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
    if (selectedFeature?.properties.category === category && visibleCategories.has(category)) closeDrawer()
  }

  const activeLocation = mapLocation.state.status === 'active' ? mapLocation.state : null
  const showPilot = comparisonPeriod === 'c1492' && (appRoute.kind === 'route' || appRoute.kind === 'place')

  const activateLocation = () => {
    setIsLayerControlOpen(false)
    setIsFollowingLocation(true)
    if (mapLocation.state.status === 'active') {
      setLocationRecenterRequest((current) => current + 1)
    } else {
      mapLocation.request()
    }
  }

  const stopLocation = () => {
    mapLocation.stop()
    setIsFollowingLocation(false)
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#map-canvas">{text.skipMap}</a>

      <Header
        features={activeFeatures}
        onSelectFeature={selectFeature}
        onOpenInfo={() => {
          setSelectedFeatureId(null)
          setIsPlacePanelOpen(false)
          setIsDrawerOpen(true)
          updateUrlState(null, comparisonPeriod, isInternalComparison)
        }}
        onToggleLocale={toggleLocale}
        text={text}
      />

      <section className="map-workspace" aria-label={text.mapWorkspace}>
        <Suspense fallback={<div className="map-status" role="status">{text.loadingMap}</div>}>
          <MapView
            featureCollection={activeCollection}
            historicalVisible={isHistoricalVisible}
            historicalOpacity={historicalOpacity}
            modernVisible={isModernVisible}
            modernStrength={modernStrength}
            selectedFeatureId={selectedFeatureId}
            visibleCategories={[...visibleCategories]}
            pilotPlaces={showPilot ? pilotRoute.stops : NO_PILOT_PLACES}
            activePlaceId={appRoute.place?.id ?? null}
            visitorLocation={activeLocation?.fix ?? null}
            visitorLocationTrackingId={activeLocation?.trackingId ?? null}
            isFollowingLocation={isFollowingLocation}
            locationRecenterRequest={locationRecenterRequest}
            onLocationFollowChange={setIsFollowingLocation}
            onSelectFeature={selectFeature}
            onSelectPlace={selectPlace}
            text={text}
          />
        </Suspense>

        {isInternalComparison && appRoute.kind === 'map' ? (
          <PeriodSelector
            locale={locale}
            period={comparisonPeriod}
            isC1550Ready={Boolean(internalDataset)}
            onChange={selectPeriod}
          />
        ) : (
          <div className="period-badge" aria-label={text.periodEyebrow}>
            <span className="period-badge__eyebrow">{text.periodEyebrow}</span>
            <strong>{comparisonPeriod === 'c1550' ? 'Granada, c. 1550' : text.period}</strong>
          </div>
        )}

        {comparisonPeriod === 'c1550' && !internalDataset && (
          <div className={`map-status ${internalDataError ? 'map-status--error' : ''}`} role="status">
            {internalDataError
              ? (locale === 'en' ? 'The internal c. 1550 slice could not be loaded.' : 'No se ha podido cargar el corte interno de c. 1550.')
              : (locale === 'en' ? 'Loading the internal c. 1550 slice…' : 'Cargando el corte interno de c. 1550…')}
          </div>
        )}

        {showPilot && !isPlacePanelOpen && !isDrawerOpen && (
          <button ref={routeReopenRef} className="route-reopen-button" type="button" onClick={() => setIsPlacePanelOpen(true)}>
            {appRoute.place ? appRoute.place.title[locale] : pilotRoute.title[locale]}
          </button>
        )}

        {pilotRoute.status === 'active' && appRoute.kind === 'map' && (
          <button ref={routeReopenRef} className="route-reopen-button" type="button" onClick={openRoute}>{pilotRoute.title[locale]}</button>
        )}

        <div className="map-control-stack">
          <MapLocationControl
            locale={locale}
            state={mapLocation.state}
            isFollowing={isFollowingLocation}
            onActivate={activateLocation}
          />
          <LayerControl
            isOpen={isLayerControlOpen}
            historicalVisible={isHistoricalVisible}
            historicalOpacity={historicalOpacity}
            modernVisible={isModernVisible}
            modernStrength={modernStrength}
            visibleCategories={visibleCategories}
            categoryCounts={categoryCounts}
            onToggle={() => setIsLayerControlOpen((isOpen) => !isOpen)}
            onClose={() => setIsLayerControlOpen(false)}
            onToggleHistorical={() => setIsHistoricalVisible((visible) => !visible)}
            onToggleModern={() => setIsModernVisible((visible) => !visible)}
            onChangeModernStrength={setModernStrength}
            onChangeHistoricalOpacity={setHistoricalOpacity}
            onToggleCategory={toggleCategory}
            onShowAllCategories={() => setVisibleCategories(new Set(Object.keys(CATEGORY_CONFIG) as FeatureCategory[]))}
            onHideAllCategories={() => {
              setVisibleCategories(new Set())
              closeDrawer()
            }}
            text={text}
          />
        </div>

        <div className="map-note" role="note">
          <span className="map-note__mark" aria-hidden="true" />
          <span>{comparisonPeriod === 'c1550'
            ? (locale === 'en'
                ? `M10.5 candidate · ${internalDataset?.records.length ?? 0} research features · specialist approval pending`
                : `Candidato M10.5 · ${internalDataset?.records.length ?? 0} entidades en investigación · aprobación especialista pendiente`)
            : text.auditNote(geometryAuditSummary.verified, geometryAuditSummary.total)}</span>
        </div>
      </section>

      <PlacePanel
        isOpen={isPlacePanelOpen && showPilot}
        locale={locale}
        place={appRoute.place}
        featuresById={localizedFeaturesById}
        locationState={mapLocation.state}
        onClose={closePlacePanel}
        onSelectPlace={(place) => selectPlace(place.id)}
        onSelectFeature={selectFeature}
        onLocate={activateLocation}
        onClearLocation={stopLocation}
      />

      <FeatureDrawer
        isOpen={isDrawerOpen}
        feature={selectedFeature}
        gazetteerEntry={selectedOriginalFeature ? gazetteerByFeatureId.get(selectedOriginalFeature.id) ?? null : null}
        sourcesById={sourcesById}
        onClose={closeDrawer}
        isLanguageFallback={comparisonPeriod === 'c1492' ? selectedLocalization?.isFallback ?? false : false}
        presentation={selectedPresentation}
        periodDetail={selectedPeriodDetail}
        unavailableSelection={unavailableSelection}
        onSelectPeriod={isInternalComparison ? selectPeriod : undefined}
        currentPeriod={comparisonPeriod}
        text={text}
      />
    </main>
  )
}

function getFeatureId(url: URL, allowInternalFeature: boolean) {
  const candidate = url.searchParams.get('feature')
  if (historicalFeatureCollection.features.some((feature) => feature.id === candidate)) return candidate
  if (allowInternalFeature && featureIdSchema.safeParse(candidate).success) return candidate
  return null
}

function getComparisonPeriod(url: URL, allowInternalPeriod: boolean): ComparisonPeriod {
  return allowInternalPeriod && url.searchParams.get('period') === 'c1550' ? 'c1550' : 'c1492'
}

function updateUrlState(
  featureId: string | null,
  period: ComparisonPeriod,
  includePeriod: boolean,
) {
  const url = new URL(window.location.href)
  if (featureId) url.searchParams.set('feature', featureId)
  else url.searchParams.delete('feature')
  if (includePeriod) url.searchParams.set('period', period)
  else url.searchParams.delete('period')
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
}
