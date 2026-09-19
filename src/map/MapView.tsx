import { useEffect, useRef, useState } from 'react'
import { Map, NavigationControl, ScaleControl, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

const GRANADA_CENTER: [number, number] = [-3.5986, 37.1773]
const DEFAULT_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const MAP_LOCALE = {
  'AttributionControl.ToggleAttribution': 'Mostrar u ocultar la atribución',
  'AttributionControl.MapFeedback': 'Enviar comentarios sobre el mapa',
  'FullscreenControl.Enter': 'Ver a pantalla completa',
  'FullscreenControl.Exit': 'Salir de pantalla completa',
  'GeolocateControl.FindMyLocation': 'Mostrar mi ubicación',
  'GeolocateControl.LocationNotAvailable': 'Ubicación no disponible',
  'LogoControl.Title': 'Logotipo de MapLibre',
  'Map.Title': 'Mapa',
  'Marker.Title': 'Marcador del mapa',
  'NavigationControl.ResetBearing':
    'Arrastra para girar el mapa; pulsa para orientar el norte',
  'NavigationControl.ZoomIn': 'Acercar',
  'NavigationControl.ZoomOut': 'Alejar',
  'Popup.Close': 'Cerrar ventana emergente',
  'ScaleControl.Feet': 'pies',
  'ScaleControl.Meters': 'm',
  'ScaleControl.Kilometers': 'km',
  'ScaleControl.Miles': 'mi',
  'ScaleControl.NauticalMiles': 'mn',
  'GlobeControl.Enable': 'Activar el globo',
  'GlobeControl.Disable': 'Desactivar el globo',
  'TerrainControl.Enable': 'Activar el relieve',
  'TerrainControl.Disable': 'Desactivar el relieve',
  'CooperativeGesturesHandler.WindowsHelpText':
    'Usa Ctrl y la rueda del ratón para acercar o alejar el mapa',
  'CooperativeGesturesHandler.MacHelpText':
    'Usa ⌘ y la rueda del ratón para acercar o alejar el mapa',
  'CooperativeGesturesHandler.MobileHelpText':
    'Usa dos dedos para mover el mapa',
}

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
      locale: MAP_LOCALE,
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
        aria-label="Mapa moderno interactivo del centro de Granada"
        tabIndex={0}
      />

      {status === 'loading' && (
        <div className="map-status" role="status">
          <span className="map-status__spinner" aria-hidden="true" />
          Cargando Granada…
        </div>
      )}

      {status === 'error' && (
        <div className="map-status map-status--error" role="alert">
          <strong>No se ha podido cargar el mapa base.</strong>
          <span>Comprueba la URL del estilo o la conexión a internet.</span>
        </div>
      )}
    </div>
  )
}
