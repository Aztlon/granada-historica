import { useCallback, useMemo, useState } from 'react'
import { FeatureDrawer } from '../components/FeatureDrawer'
import { Header } from '../components/Header'
import { LayerControl } from '../components/LayerControl'
import { CATEGORY_CONFIG } from '../data/categories'
import { historicalFeatureCollection, sourcesById } from '../data/historicalData'
import type { FeatureCategory } from '../data/schema'
import { MapView } from '../map/MapView'

export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false)
  const [isHistoricalVisible, setIsHistoricalVisible] = useState(true)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
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
  }, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedFeatureId(null)
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
        onOpenInfo={() => {
          setSelectedFeatureId(null)
          setIsDrawerOpen(true)
        }}
      />

      <section className="map-workspace" aria-label="Espacio del mapa histórico">
        <MapView
          featureCollection={historicalFeatureCollection}
          historicalVisible={isHistoricalVisible}
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
          visibleCategories={visibleCategories}
          categoryCounts={categoryCounts}
          onToggle={() => setIsLayerControlOpen((isOpen) => !isOpen)}
          onClose={() => setIsLayerControlOpen(false)}
          onToggleHistorical={() => setIsHistoricalVisible((visible) => !visible)}
          onToggleCategory={toggleCategory}
        />

        <div className="map-note" role="note">
          <span className="map-note__mark" aria-hidden="true" />
          <span>
            {historicalFeatureCollection.features.length} elementos históricos revisados ·
            selecciona uno para explorarlo
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
