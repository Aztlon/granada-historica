import { useEffect, useRef, useState } from 'react'
import { Map, NavigationControl, ScaleControl, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

const GRANADA_CENTER: [number, number] = [-3.5986, 37.1773]
const DEFAULT_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

setWorkerUrl(workerUrl)

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!containerRef.current) return

    const map = new Map({
      container: containerRef.current,
      style: import.meta.env.VITE_BASEMAP_STYLE_URL || DEFAULT_STYLE,
      center: GRANADA_CENTER,
      zoom: 13.25,
      minZoom: 10,
      maxZoom: 19,
      cooperativeGestures: true,
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left')

    map.once('load', () => setStatus('ready'))
    map.once('error', () => setStatus((current) => (current === 'ready' ? current : 'error')))

    return () => map.remove()
  }, [])

  return (
    <div className="map-frame">
      <div
        ref={containerRef}
        id="map-canvas"
        className="map-canvas"
        role="region"
        aria-label="Interactive modern map of central Granada"
        tabIndex={0}
      />

      {status === 'loading' && (
        <div className="map-status" role="status">
          <span className="map-status__spinner" aria-hidden="true" />
          Loading Granada…
        </div>
      )}

      {status === 'error' && (
        <div className="map-status map-status--error" role="alert">
          <strong>The basemap could not be loaded.</strong>
          <span>Check the map style URL or your network connection.</span>
        </div>
      )}
    </div>
  )
}
