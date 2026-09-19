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
        Saltar al mapa
      </a>

      <Header onOpenInfo={() => setIsDrawerOpen(true)} />

      <section className="map-workspace" aria-label="Espacio del mapa histórico">
        <MapView />

        <div className="period-badge" aria-label="Periodo histórico mostrado">
          <span className="period-badge__eyebrow">Vista histórica</span>
          <strong>Granada, c. 1492</strong>
        </div>

        <LayerControl
          isOpen={isLayerControlOpen}
          onToggle={() => setIsLayerControlOpen((isOpen) => !isOpen)}
          onClose={() => setIsLayerControlOpen(false)}
        />

        <div className="map-note" role="note">
          <span className="map-note__mark" aria-hidden="true" />
          <span>Mapa actual de referencia · las capas históricas llegarán en M2</span>
        </div>
      </section>

      <FeatureDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </main>
  )
}
