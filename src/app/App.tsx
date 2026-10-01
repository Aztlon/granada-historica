import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FeatureDrawer } from '../components/FeatureDrawer'
import { Header } from '../components/Header'
import { LayerControl } from '../components/LayerControl'
import { PlacePanel } from '../components/PlacePanel'
import { CATEGORY_CONFIG } from '../data/categories'
import {
  geometryAuditSummary,
  gazetteerByFeatureId,
  historicalFeatureCollection,
  sourcesById,
} from '../data/historicalData'
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
import type { FeatureCategory, HistoricalFeatureCollection } from '../data/schema'
import { messages } from '../i18n/messages'
import { useVisitorLocation } from '../location/useVisitorLocation'

const MapView = lazy(() => import('../map/MapView').then((module) => ({ default: module.MapView })))
const NO_PILOT_PLACES: readonly PlaceStop[] = []

export function App() {
  const routeReopenRef = useRef<HTMLButtonElement>(null)
  const restoreRouteFocusRef = useRef(false)
  const initialUrl = useMemo(() => new URL(window.location.href), [])
  const initialFeatureId = useMemo(() => getFeatureId(initialUrl), [initialUrl])
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
  const [visibleCategories, setVisibleCategories] = useState<Set<FeatureCategory>>(
    () => new Set(Object.keys(CATEGORY_CONFIG) as FeatureCategory[]),
  )
  const visitorLocation = useVisitorLocation()
  const text = useMemo(() => messages(locale), [locale])

  const localizedFeatures = useMemo(
    () => localizeFeatures(historicalFeatureCollection.features, locale),
    [locale],
  )
  const localizedCollection = useMemo<HistoricalFeatureCollection>(() => ({
    ...historicalFeatureCollection,
    features: localizedFeatures,
  }), [localizedFeatures])
  const localizedFeaturesById = useMemo(
    () => new Map(localizedFeatures.map((feature) => [feature.id, feature])),
    [localizedFeatures],
  )
  const selectedOriginalFeature = useMemo(
    () => historicalFeatureCollection.features.find((feature) => feature.id === selectedFeatureId) ?? null,
    [selectedFeatureId],
  )
  const selectedLocalization = useMemo(
    () => selectedOriginalFeature ? localizeFeature(selectedOriginalFeature, locale) : null,
    [locale, selectedOriginalFeature],
  )
  const selectedFeature = selectedLocalization?.feature ?? null

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      (Object.keys(CATEGORY_CONFIG) as FeatureCategory[]).map((category) => [category, 0]),
    ) as Record<FeatureCategory, number>
    for (const feature of historicalFeatureCollection.features) counts[feature.properties.category] += 1
    return counts
  }, [])

  const selectFeature = useCallback((featureId: string) => {
    setSelectedFeatureId(featureId)
    setIsDrawerOpen(true)
    setIsPlacePanelOpen(false)
    setIsHistoricalVisible(true)
    const feature = historicalFeatureCollection.features.find((candidate) => candidate.id === featureId)
    if (feature) {
      setVisibleCategories((current) => current.has(feature.properties.category)
        ? current
        : new Set(current).add(feature.properties.category))
    }
    updateFeatureUrl(featureId)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedFeatureId(null)
    updateFeatureUrl(null)
    if (appRoute.kind === 'place' || appRoute.kind === 'route') setIsPlacePanelOpen(true)
  }, [appRoute.kind])

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
      const featureId = getFeatureId(url)
      setLocale(resolveLocale(url, navigator.languages))
      setAppRoute(restoredRoute)
      setSelectedFeatureId(featureId)
      setIsDrawerOpen(Boolean(featureId))
      setIsPlacePanelOpen(!featureId && (restoredRoute.kind === 'place' || restoredRoute.kind === 'route'))
    }
    window.addEventListener('popstate', restoreUrlState)
    return () => window.removeEventListener('popstate', restoreUrlState)
  }, [])

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
    robots.content = pilotRoute.status === 'preview' && appRoute.kind !== 'map' ? 'noindex,nofollow' : 'index,follow'
  }, [appRoute, locale, text.metaDescription])

  const toggleCategory = (category: FeatureCategory) => {
    setVisibleCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
    if (selectedFeature?.properties.category === category && visibleCategories.has(category)) closeDrawer()
  }

  const located = visitorLocation.state.status === 'located' ? visitorLocation.state : null
  const nearestPlace = located ? placeById.get(located.nearestPlaceId) ?? null : null
  const locationInsidePilot = Boolean(located && located.distance <= 2_000)
  const showPilot = appRoute.kind === 'route' || appRoute.kind === 'place'

  return (
    <main className="app-shell">
      <a className="skip-link" href="#map-canvas">{text.skipMap}</a>

      <Header
        features={localizedFeatures}
        onSelectFeature={selectFeature}
        onOpenInfo={() => {
          setSelectedFeatureId(null)
          setIsPlacePanelOpen(false)
          setIsDrawerOpen(true)
          updateFeatureUrl(null)
        }}
        onToggleLocale={toggleLocale}
        text={text}
      />

      <section className="map-workspace" aria-label={text.mapWorkspace}>
        <Suspense fallback={<div className="map-status" role="status">{text.loadingMap}</div>}>
          <MapView
            featureCollection={localizedCollection}
            historicalVisible={isHistoricalVisible}
            historicalOpacity={historicalOpacity}
            modernVisible={isModernVisible}
            modernStrength={modernStrength}
            selectedFeatureId={selectedFeatureId}
            visibleCategories={[...visibleCategories]}
            pilotPlaces={showPilot ? pilotRoute.stops : NO_PILOT_PLACES}
            activePlaceId={appRoute.place?.id ?? null}
            visitorLocation={locationInsidePilot ? located?.fix ?? null : null}
            nearestPlaceFocus={locationInsidePilot ? nearestPlace?.focus ?? null : null}
            onSelectFeature={selectFeature}
            onSelectPlace={selectPlace}
            text={text}
          />
        </Suspense>

        <div className="period-badge" aria-label={text.periodEyebrow}>
          <span className="period-badge__eyebrow">{text.periodEyebrow}</span>
          <strong>{text.period}</strong>
        </div>

        {showPilot && !isPlacePanelOpen && !isDrawerOpen && (
          <button ref={routeReopenRef} className="route-reopen-button" type="button" onClick={() => setIsPlacePanelOpen(true)}>
            {appRoute.place ? appRoute.place.title[locale] : pilotRoute.title[locale]}
          </button>
        )}

        {pilotRoute.status === 'active' && appRoute.kind === 'map' && (
          <button ref={routeReopenRef} className="route-reopen-button" type="button" onClick={openRoute}>{pilotRoute.title[locale]}</button>
        )}

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

        <div className="map-note" role="note">
          <span className="map-note__mark" aria-hidden="true" />
          <span>{text.auditNote(geometryAuditSummary.verified, geometryAuditSummary.total)}</span>
        </div>
      </section>

      <PlacePanel
        isOpen={isPlacePanelOpen && showPilot}
        locale={locale}
        place={appRoute.place}
        featuresById={localizedFeaturesById}
        locationState={visitorLocation.state}
        onClose={closePlacePanel}
        onSelectPlace={(place) => selectPlace(place.id)}
        onSelectFeature={selectFeature}
        onExplainLocation={visitorLocation.explain}
        onCancelLocation={visitorLocation.cancel}
        onLocate={visitorLocation.locate}
        onClearLocation={visitorLocation.clear}
      />

      <FeatureDrawer
        isOpen={isDrawerOpen}
        feature={selectedFeature}
        gazetteerEntry={selectedOriginalFeature ? gazetteerByFeatureId.get(selectedOriginalFeature.id) ?? null : null}
        sourcesById={sourcesById}
        onClose={closeDrawer}
        isLanguageFallback={selectedLocalization?.isFallback ?? false}
        text={text}
      />
    </main>
  )
}

function getFeatureId(url: URL) {
  const candidate = url.searchParams.get('feature')
  return historicalFeatureCollection.features.some((feature) => feature.id === candidate) ? candidate : null
}

function updateFeatureUrl(featureId: string | null) {
  const url = new URL(window.location.href)
  if (featureId) url.searchParams.set('feature', featureId)
  else url.searchParams.delete('feature')
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
}
