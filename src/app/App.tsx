import { useState } from 'react'
import { FeatureDrawer } from '../components/FeatureDrawer'
import { Header } from '../components/Header'
import { LayerControl } from '../components/LayerControl'
import { MapView } from '../map/MapView'

export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false)

  return (
    <main className="app-shell">
      <a className="skip-link" href="#map-canvas">
        Skip to map
      </a>

      <Header onOpenInfo={() => setIsDrawerOpen(true)} />

      <section className="map-workspace" aria-label="Historical map workspace">
        <MapView />

        <div className="period-badge" aria-label="Displayed historical period">
          <span className="period-badge__eyebrow">Historical view</span>
          <strong>Granada, c. 1492</strong>
        </div>

        <LayerControl
          isOpen={isLayerControlOpen}
          onToggle={() => setIsLayerControlOpen((isOpen) => !isOpen)}
          onClose={() => setIsLayerControlOpen(false)}
        />

        <div className="map-note" role="note">
          <span className="map-note__mark" aria-hidden="true" />
          <span>Modern reference map · historical layers arrive in M2</span>
        </div>
      </section>

      <FeatureDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </main>
  )
}
