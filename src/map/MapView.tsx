import { useEffect, useRef, useState } from 'react'
import {
  Map,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
  type MapLayerMouseEvent,
} from 'maplibre-gl'
import type {
  ExpressionSpecification,
} from '@maplibre/maplibre-gl-style-spec'
import type { Feature, FeatureCollection } from 'geojson'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { CATEGORY_CONFIG } from '../data/categories'
import type {
  Confidence,
  FeatureCategory,
  HistoricalFeatureCollection,
} from '../data/schema'

const GRANADA_CENTER: [number, number] = [-3.5986, 37.1773]
const DEFAULT_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const SOURCE_ID = 'historical-features'

const HISTORICAL_LAYER_IDS = [
  'historical-area-fill',
  'historical-area-secure',
  'historical-area-probable',
  'historical-area-approximate',
  'historical-area-disputed',
  'historical-line-secure',
  'historical-line-probable',
  'historical-line-approximate',
  'historical-line-disputed',
  'historical-point-secure',
  'historical-point-probable',
  'historical-point-approximate',
  'historical-point-disputed',
  'historical-selection-area',
  'historical-selection-line',
  'historical-selection-point',
] as const

const INTERACTIVE_LAYER_IDS = [
  'historical-point-secure',
  'historical-point-probable',
  'historical-point-approximate',
  'historical-point-disputed',
  'historical-line-secure',
  'historical-line-probable',
  'historical-line-approximate',
  'historical-line-disputed',
  'historical-area-fill',
] as const

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
  'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
}

const CATEGORY_COLOR: ExpressionSpecification = [
  'match',
  ['get', 'category'],
  'urban_structure',
  CATEGORY_CONFIG.urban_structure.color,
  'walls_gates',
  CATEGORY_CONFIG.walls_gates.color,
  'religion_learning',
  CATEGORY_CONFIG.religion_learning.color,
  'commerce_civic',
  CATEGORY_CONFIG.commerce_civic.color,
  'water_infrastructure',
  CATEGORY_CONFIG.water_infrastructure.color,
  'royal_elite',
  CATEGORY_CONFIG.royal_elite.color,
  'burial_other',
  CATEGORY_CONFIG.burial_other.color,
  '#6c746f',
]

const geometryFilter = (
  geometryType: 'Point' | 'LineString' | 'Polygon',
): ExpressionSpecification => [
  '==',
  ['geometry-type'],
  geometryType,
]

const confidenceFilter = (confidence: Confidence): ExpressionSpecification => [
  '==',
  ['get', 'confidence_location'],
  confidence,
]

const categoryFilter = (
  categories: readonly FeatureCategory[],
): ExpressionSpecification => [
  'in',
  ['get', 'category'],
  ['literal', categories],
]

const allFilters = (...filters: ExpressionSpecification[]): ExpressionSpecification => [
  'all',
  ...filters,
]

interface MapViewProps {
  featureCollection: HistoricalFeatureCollection
  historicalVisible: boolean
  selectedFeatureId: string | null
  visibleCategories: readonly FeatureCategory[]
  onSelectFeature: (featureId: string) => void
}

setWorkerUrl(workerUrl)

export function MapView({
  featureCollection,
  historicalVisible,
  selectedFeatureId,
  visibleCategories,
  onSelectFeature,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const renderedStateRef = useRef({
    historicalVisible,
    selectedFeatureId,
    visibleCategories,
  })
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    renderedStateRef.current = {
      historicalVisible,
      selectedFeatureId,
      visibleCategories,
    }
  }, [historicalVisible, selectedFeatureId, visibleCategories])

  useEffect(() => {
    if (!containerRef.current) return

    const renderedData: FeatureCollection = {
      type: 'FeatureCollection',
      features: featureCollection.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          confidence_location: feature.properties.confidence.location,
        },
      })) as Feature[],
    }

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
    mapRef.current = map

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left')

    map.once('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: renderedData,
        attribution: 'Datos históricos: Granada Histórica',
      })

      addHistoricalLayers(map)
      const current = renderedStateRef.current
      applyMapState(
        map,
        current.historicalVisible,
        current.visibleCategories,
        current.selectedFeatureId,
      )
      setStatus('ready')
    })

    map.once('error', () =>
      setStatus((current) => (current === 'ready' ? current : 'error')),
    )

    const selectFeature = (event: MapLayerMouseEvent) => {
      const featureId = event.features?.[0]?.properties?.id
      if (typeof featureId === 'string') onSelectFeature(featureId)
    }
    const showPointer = () => {
      map.getCanvas().style.cursor = 'pointer'
    }
    const hidePointer = () => {
      map.getCanvas().style.cursor = ''
    }

    map.on('click', [...INTERACTIVE_LAYER_IDS], selectFeature)
    map.on('mouseenter', [...INTERACTIVE_LAYER_IDS], showPointer)
    map.on('mouseleave', [...INTERACTIVE_LAYER_IDS], hidePointer)

    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [featureCollection, onSelectFeature])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.getSource(SOURCE_ID)) return
    applyMapState(map, historicalVisible, visibleCategories, selectedFeatureId)
  }, [historicalVisible, selectedFeatureId, visibleCategories])

  return (
    <div className="map-frame">
      <div
        ref={containerRef}
        id="map-canvas"
        className="map-canvas"
        role="region"
        aria-label="Mapa moderno interactivo del centro de Granada con elementos históricos"
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

function addHistoricalLayers(map: Map) {
  map.addLayer({
    id: 'historical-area-fill',
    type: 'fill',
    source: SOURCE_ID,
    filter: geometryFilter('Polygon'),
    paint: {
      'fill-color': CATEGORY_COLOR,
      'fill-opacity': [
        'match',
        ['get', 'confidence_location'],
        'secure',
        0.32,
        'probable',
        0.24,
        'approximate',
        0.16,
        'disputed',
        0.1,
        0.2,
      ],
    },
  })

  addConfidenceAreaOutline(map, 'secure', [])
  addConfidenceAreaOutline(map, 'probable', [3, 1.5])
  addConfidenceAreaOutline(map, 'approximate', [1.5, 2])
  addConfidenceAreaOutline(map, 'disputed', [0.8, 1.4])
  addConfidenceLine(map, 'secure', [])
  addConfidenceLine(map, 'probable', [4, 1.5])
  addConfidenceLine(map, 'approximate', [2, 2.2])
  addConfidenceLine(map, 'disputed', [0.8, 1.4])
  addConfidencePoint(map, 'secure', 1, 2)
  addConfidencePoint(map, 'probable', 0.7, 3)
  addConfidencePoint(map, 'approximate', 0.12, 3)
  addConfidencePoint(map, 'disputed', 0, 3)

  map.addLayer({
    id: 'historical-selection-area',
    type: 'line',
    source: SOURCE_ID,
    filter: allFilters(geometryFilter('Polygon'), ['==', ['get', 'id'], '']),
    paint: { 'line-color': '#f8d47b', 'line-width': 5 },
  })
  map.addLayer({
    id: 'historical-selection-line',
    type: 'line',
    source: SOURCE_ID,
    filter: allFilters(geometryFilter('LineString'), ['==', ['get', 'id'], '']),
    paint: { 'line-color': '#f8d47b', 'line-width': 7, 'line-opacity': 0.88 },
  })
  map.addLayer({
    id: 'historical-selection-point',
    type: 'circle',
    source: SOURCE_ID,
    filter: allFilters(geometryFilter('Point'), ['==', ['get', 'id'], '']),
    paint: {
      'circle-radius': 12,
      'circle-color': 'rgba(0, 0, 0, 0)',
      'circle-stroke-color': '#f8d47b',
      'circle-stroke-width': 4,
    },
  })
}

function addConfidenceAreaOutline(map: Map, confidence: Confidence, dasharray: number[]) {
  map.addLayer({
    id: `historical-area-${confidence}`,
    type: 'line',
    source: SOURCE_ID,
    filter: allFilters(geometryFilter('Polygon'), confidenceFilter(confidence)),
    paint: {
      'line-color': CATEGORY_COLOR,
      'line-width': confidence === 'secure' ? 2.5 : 2,
      ...(dasharray.length > 0 ? { 'line-dasharray': dasharray } : {}),
    },
  })
}

function addConfidenceLine(map: Map, confidence: Confidence, dasharray: number[]) {
  map.addLayer({
    id: `historical-line-${confidence}`,
    type: 'line',
    source: SOURCE_ID,
    filter: allFilters(geometryFilter('LineString'), confidenceFilter(confidence)),
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': CATEGORY_COLOR,
      'line-width': confidence === 'secure' ? 4 : 3.5,
      'line-opacity': confidence === 'disputed' ? 0.75 : 0.94,
      ...(dasharray.length > 0 ? { 'line-dasharray': dasharray } : {}),
    },
  })
}

function addConfidencePoint(
  map: Map,
  confidence: Confidence,
  opacity: number,
  strokeWidth: number,
) {
  map.addLayer({
    id: `historical-point-${confidence}`,
    type: 'circle',
    source: SOURCE_ID,
    filter: allFilters(geometryFilter('Point'), confidenceFilter(confidence)),
    paint: {
      'circle-radius': 7,
      'circle-color': CATEGORY_COLOR,
      'circle-opacity': opacity,
      'circle-stroke-color': CATEGORY_COLOR,
      'circle-stroke-width': strokeWidth,
    },
  })
}

function applyMapState(
  map: Map,
  historicalVisible: boolean,
  visibleCategories: readonly FeatureCategory[],
  selectedFeatureId: string | null,
) {
  const visibility = historicalVisible ? 'visible' : 'none'
  const categories = categoryFilter(visibleCategories)

  for (const layerId of HISTORICAL_LAYER_IDS) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  map.setFilter('historical-area-fill', allFilters(geometryFilter('Polygon'), categories))
  for (const confidence of ['secure', 'probable', 'approximate', 'disputed'] as const) {
    map.setFilter(
      `historical-area-${confidence}`,
      allFilters(geometryFilter('Polygon'), confidenceFilter(confidence), categories),
    )
    map.setFilter(
      `historical-line-${confidence}`,
      allFilters(geometryFilter('LineString'), confidenceFilter(confidence), categories),
    )
    map.setFilter(
      `historical-point-${confidence}`,
      allFilters(geometryFilter('Point'), confidenceFilter(confidence), categories),
    )
  }

  const selected = selectedFeatureId ?? ''
  map.setFilter(
    'historical-selection-area',
    allFilters(geometryFilter('Polygon'), ['==', ['get', 'id'], selected]),
  )
  map.setFilter(
    'historical-selection-line',
    allFilters(geometryFilter('LineString'), ['==', ['get', 'id'], selected]),
  )
  map.setFilter(
    'historical-selection-point',
    allFilters(geometryFilter('Point'), ['==', ['get', 'id'], selected]),
  )
}
