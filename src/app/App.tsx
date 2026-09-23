import { useCallback, useEffect, useMemo, useState } from 'react'
import { FeatureDrawer } from '../components/FeatureDrawer'
import { Header } from '../components/Header'
import { LayerControl } from '../components/LayerControl'
import { CATEGORY_CONFIG } from '../data/categories'
import {
  geometryAuditSummary,
  historicalFeatureCollection,
  sourcesById,
} from '../data/historicalData'
import type { FeatureCategory } from '../data/schema'
import { MapView } from '../map/MapView'

export function App() {
  const initialFeatureId = useMemo(() => getFeatureIdFromUrl(), [])
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(initialFeatureId))
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false)
  const [isHistoricalVisible, setIsHistoricalVisible] = useState(true)
  const [isModernVisible, setIsModernVisible] = useState(true)
  const [historicalOpacity, setHistoricalOpacity] = useState(0.85)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(initialFeatureId)
  const [visibleCategories, setVisibleCategories] = useState<Set<FeatureCategory>>(
    () => new Set(Object.keys(CATEGORY_CONFIG) as FeatureCategory[]),
  )

  const selectedFeature = useMemo(
    () =>
      historicalFeatureCollection.features.find(
        (feature) => feature.id === selectedFeatureId,
      ) ?? null,
    [selectedFeatureId],
  )

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      (Object.keys(CATEGORY_CONFIG) as FeatureCategory[]).map((category) => [category, 0]),
    ) as Record<FeatureCategory, number>
    for (const feature of historicalFeatureCollection.features) {
      counts[feature.properties.category] += 1
    }
    return counts
  }, [])

  const selectFeature = useCallback((featureId: string) => {
    setSelectedFeatureId(featureId)
    setIsDrawerOpen(true)
    setIsHistoricalVisible(true)
    const feature = historicalFeatureCollection.features.find(
      (candidate) => candidate.id === featureId,
    )
    if (feature) {
      setVisibleCategories((current) => {
        if (current.has(feature.properties.category)) return current
        return new Set(current).add(feature.properties.category)
      })
    }
    updateFeatureUrl(featureId)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedFeatureId(null)
    updateFeatureUrl(null)
  }, [])

  useEffect(() => {
    const restoreUrlSelection = () => {
      const featureId = getFeatureIdFromUrl()
      setSelectedFeatureId(featureId)
      setIsDrawerOpen(Boolean(featureId))
      const feature = historicalFeatureCollection.features.find(
        (candidate) => candidate.id === featureId,
      )
      if (feature) {
        setIsHistoricalVisible(true)
        setVisibleCategories((current) =>
          current.has(feature.properties.category)
            ? current
            : new Set(current).add(feature.properties.category),
        )
      }
    }
    window.addEventListener('popstate', restoreUrlSelection)
    return () => window.removeEventListener('popstate', restoreUrlSelection)
  }, [])

  const toggleCategory = (category: FeatureCategory) => {
    setVisibleCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })

    if (selectedFeature?.properties.category === category && visibleCategories.has(category)) {
      closeDrawer()
    }
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#map-canvas">
        Saltar al mapa
      </a>

      <Header
        features={historicalFeatureCollection.features}
        onSelectFeature={selectFeature}
        onOpenInfo={() => {
          setSelectedFeatureId(null)
          setIsDrawerOpen(true)
          updateFeatureUrl(null)
        }}
      />

      <section className="map-workspace" aria-label="Espacio del mapa histórico">
        <MapView
          featureCollection={historicalFeatureCollection}
          historicalVisible={isHistoricalVisible}
          historicalOpacity={historicalOpacity}
          modernVisible={isModernVisible}
          selectedFeatureId={selectedFeatureId}
          visibleCategories={[...visibleCategories]}
          onSelectFeature={selectFeature}
        />

        <div className="period-badge" aria-label="Periodo histórico mostrado">
          <span className="period-badge__eyebrow">Vista histórica</span>
          <strong>Granada, c. 1492</strong>
        </div>

        <LayerControl
          isOpen={isLayerControlOpen}
          historicalVisible={isHistoricalVisible}
          historicalOpacity={historicalOpacity}
          modernVisible={isModernVisible}
          visibleCategories={visibleCategories}
          categoryCounts={categoryCounts}
          onToggle={() => setIsLayerControlOpen((isOpen) => !isOpen)}
          onClose={() => setIsLayerControlOpen(false)}
          onToggleHistorical={() => setIsHistoricalVisible((visible) => !visible)}
          onToggleModern={() => setIsModernVisible((visible) => !visible)}
          onChangeHistoricalOpacity={setHistoricalOpacity}
          onToggleCategory={toggleCategory}
          onShowAllCategories={() =>
            setVisibleCategories(new Set(Object.keys(CATEGORY_CONFIG) as FeatureCategory[]))
          }
          onHideAllCategories={() => {
            setVisibleCategories(new Set())
            closeDrawer()
          }}
        />

        <div className="map-note" role="note">
          <span className="map-note__mark" aria-hidden="true" />
          <span>
            Revisión cartográfica en curso · {geometryAuditSummary.verified} de{' '}
            {geometryAuditSummary.total} geometrías comprobadas
          </span>
        </div>
      </section>

      <FeatureDrawer
        isOpen={isDrawerOpen}
        feature={selectedFeature}
        sourcesById={sourcesById}
        onClose={closeDrawer}
      />
    </main>
  )
}

function getFeatureIdFromUrl() {
  const candidate = new URL(window.location.href).searchParams.get('feature')
  return historicalFeatureCollection.features.some((feature) => feature.id === candidate)
    ? candidate
    : null
}

function updateFeatureUrl(featureId: string | null) {
  const url = new URL(window.location.href)
  if (featureId) url.searchParams.set('feature', featureId)
  else url.searchParams.delete('feature')
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
}
