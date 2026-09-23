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
import type { Feature, FeatureCollection, Point, Polygon, Position } from 'geojson'
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
const AREA_LABEL_SOURCE_ID = 'historical-area-labels'
const BASEMAP_VEIL_SOURCE_ID = 'basemap-veil-source'
const BASEMAP_VEIL_LAYER_ID = 'basemap-veil'
const BUSINESS_POI_MIN_ZOOM = 16

const HISTORICAL_LAYER_IDS = [
  'historical-urban-extent-fill',
  'historical-urban-extent-outline',
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
  'historical-label-sectors',
  'historical-label-quarters',
  'historical-label-walls',
  'historical-label-rivers',
  'historical-label-routes',
  'historical-label-gates',
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
  'historical-urban-extent-fill',
  'historical-label-sectors',
  'historical-label-quarters',
  'historical-label-walls',
  'historical-label-rivers',
  'historical-label-routes',
  'historical-label-gates',
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
  historicalOpacity: number
  modernVisible: boolean
  modernStrength: number
  selectedFeatureId: string | null
  visibleCategories: readonly FeatureCategory[]
  onSelectFeature: (featureId: string) => void
}

setWorkerUrl(workerUrl)

export function MapView({
  featureCollection,
  historicalVisible,
  historicalOpacity,
  modernVisible,
  modernStrength,
  selectedFeatureId,
  visibleCategories,
  onSelectFeature,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const basemapVisibilityRef = useRef(
    new globalThis.Map<string, 'visible' | 'none'>(),
  )
  const renderedStateRef = useRef({
    historicalVisible,
    historicalOpacity,
    modernVisible,
    modernStrength,
    selectedFeatureId,
    visibleCategories,
  })
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    renderedStateRef.current = {
      historicalVisible,
      historicalOpacity,
      modernVisible,
      modernStrength,
      selectedFeatureId,
      visibleCategories,
    }
  }, [historicalOpacity, historicalVisible, modernStrength, modernVisible, selectedFeatureId, visibleCategories])

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
    const areaLabelData = buildAreaLabelCollection(renderedData)

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
      styleBasemap(map)
      basemapVisibilityRef.current = new globalThis.Map(
        (map.getStyle().layers ?? []).map((layer) => [
          layer.id,
          layer.layout?.visibility === 'none' ? 'none' as const : 'visible' as const,
        ]),
      )
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: renderedData,
        attribution: 'Datos históricos: Granada Histórica',
      })
      map.addSource(AREA_LABEL_SOURCE_ID, {
        type: 'geojson',
        data: areaLabelData,
      })

      addBasemapVeil(map)

      addHistoricalLayers(map)
      const current = renderedStateRef.current
      applyMapState(
        map,
        current.historicalVisible,
        current.historicalOpacity,
        current.modernVisible,
        current.modernStrength,
        current.visibleCategories,
        current.selectedFeatureId,
        basemapVisibilityRef.current,
      )
      focusFeature(map, featureCollection, current.selectedFeatureId)
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
    applyMapState(
      map,
      historicalVisible,
      historicalOpacity,
      modernVisible,
      modernStrength,
      visibleCategories,
      selectedFeatureId,
      basemapVisibilityRef.current,
    )
  }, [historicalOpacity, historicalVisible, modernStrength, modernVisible, selectedFeatureId, visibleCategories])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.getSource(SOURCE_ID) || !selectedFeatureId) return
    focusFeature(map, featureCollection, selectedFeatureId)
  }, [featureCollection, selectedFeatureId])

  return (
    <div className="map-frame">
      <div
        ref={containerRef}
        id="map-canvas"
        className="map-canvas"
        role="region"
        aria-label="Mapa moderno interactivo del centro de Granada con elementos históricos"
        aria-describedby="map-keyboard-help"
        tabIndex={0}
      />
      <p id="map-keyboard-help" className="sr-only">
        Usa las teclas de flecha para desplazarte y las teclas más y menos para cambiar el zoom.
        Busca un lugar para centrarlo y abrir su ficha histórica.
      </p>

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

function styleBasemap(map: Map) {
  const layers = map.getStyle().layers ?? []

  for (const layer of layers) {
    const id = layer.id.toLowerCase()
    const sourceLayer = 'source-layer' in layer
      ? String(layer['source-layer'] ?? '').toLowerCase()
      : ''

    const isTransit = /transit|public.transport|bus|tram|subway/.test(`${id} ${sourceLayer}`)
    const isRoadFurniture = /one.way.arrow|highway.shield|road.shield/.test(id)
    if (isTransit || isRoadFurniture) {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
      continue
    }

    if (sourceLayer === 'poi') {
      const originalFilter = map.getFilter(layer.id)
      const poiFilter: ExpressionSpecification = [
        'all',
        ...(originalFilter ? [originalFilter as ExpressionSpecification] : []),
        ['!', ['in', ['get', 'class'], ['literal', ['airport', 'bus', 'rail']]]],
        [
          '!',
          [
            'in',
            ['get', 'subclass'],
            [
              'literal',
              ['bus_stop', 'halt', 'station', 'subway', 'subway_entrance', 'tram_stop'],
            ],
          ],
        ],
      ]
      map.setFilter(layer.id, poiFilter)
      map.setLayerZoomRange(
        layer.id,
        Math.max(layer.minzoom ?? 0, BUSINESS_POI_MIN_ZOOM),
        layer.maxzoom ?? 24,
      )
      map.setPaintProperty(layer.id, 'text-opacity', 0.72)
      map.setPaintProperty(layer.id, 'icon-opacity', 0.62)
      continue
    }

    if (layer.type === 'line' && sourceLayer === 'transportation') {
      const isCasing = id.includes('casing') || id.includes('hatching')
      const isMinor = /minor|service|track|path|pedestrian|link/.test(id)
      map.setPaintProperty(
        layer.id,
        'line-color',
        isCasing ? '#c9c4bb' : isMinor ? '#bbb6ad' : '#aaa59c',
      )
      map.setPaintProperty(
        layer.id,
        'line-opacity',
        isCasing ? 0.2 : isMinor ? 0.32 : 0.5,
      )
      continue
    }

    if (layer.type === 'fill' && sourceLayer === 'building') {
      map.setPaintProperty(layer.id, 'fill-color', '#c8c4bb')
      map.setPaintProperty(layer.id, 'fill-opacity', 0.38)
      continue
    }

    if (layer.type === 'fill-extrusion' && sourceLayer === 'building') {
      map.setPaintProperty(layer.id, 'fill-extrusion-color', '#c8c4bb')
      map.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0.28)
      continue
    }

    if (
      layer.type === 'fill'
      && ['landcover', 'landuse', 'park'].includes(sourceLayer)
    ) {
      map.setPaintProperty(layer.id, 'fill-opacity', 0.42)
    }

    if (layer.type === 'symbol') {
      const isWaterLabel = sourceLayer === 'water_name' || sourceLayer === 'waterway'
      const isMajorRoadLabel = id.includes('highway-name-major')
      const isMinorRoadLabel = /highway-name-(minor|path)/.test(id)
      map.setPaintProperty(
        layer.id,
        'text-opacity',
        isWaterLabel ? 0.72 : isMajorRoadLabel ? 0.58 : isMinorRoadLabel ? 0.42 : 0.5,
      )
      map.setPaintProperty(layer.id, 'icon-opacity', 0.34)

      if (isMinorRoadLabel) {
        map.setLayerZoomRange(
          layer.id,
          Math.max(layer.minzoom ?? 0, id.includes('path') ? 16.5 : 16),
          layer.maxzoom ?? 24,
        )
      }
    }
  }
}

function addBasemapVeil(map: Map) {
  map.addSource(BASEMAP_VEIL_SOURCE_ID, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-180, -85],
          [180, -85],
          [180, 85],
          [-180, 85],
          [-180, -85],
        ]],
      },
    },
  })
  map.addLayer({
    id: BASEMAP_VEIL_LAYER_ID,
    type: 'fill',
    source: BASEMAP_VEIL_SOURCE_ID,
    paint: {
      'fill-color': '#fbf8f1',
      'fill-opacity': 0.28,
    },
  })
}

function addHistoricalLayers(map: Map) {
  map.addLayer({
    id: 'historical-urban-extent-fill',
    type: 'fill',
    source: SOURCE_ID,
    filter: allFilters(
      geometryFilter('Polygon'),
      ['==', ['get', 'subtype'], 'late_nasrid_extent'],
    ),
    paint: {
      'fill-color': CATEGORY_CONFIG.urban_structure.color,
      'fill-opacity': 0.07,
    },
  })

  map.addLayer({
    id: 'historical-urban-extent-outline',
    type: 'line',
    source: SOURCE_ID,
    filter: allFilters(
      geometryFilter('Polygon'),
      ['==', ['get', 'subtype'], 'late_nasrid_extent'],
    ),
    paint: {
      'line-color': CATEGORY_CONFIG.urban_structure.color,
      'line-width': 2,
      'line-dasharray': [1.2, 2.4],
      'line-opacity': 0.8,
    },
  })

  map.addLayer({
    id: 'historical-area-fill',
    type: 'fill',
    source: SOURCE_ID,
    filter: allFilters(
      geometryFilter('Polygon'),
      ['!=', ['get', 'subtype'], 'late_nasrid_extent'],
    ),
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

  addHistoricalLabels(map)
}

function addConfidenceAreaOutline(map: Map, confidence: Confidence, dasharray: number[]) {
  map.addLayer({
    id: `historical-area-${confidence}`,
    type: 'line',
    source: SOURCE_ID,
    filter: allFilters(
      geometryFilter('Polygon'),
      confidenceFilter(confidence),
      ['!=', ['get', 'subtype'], 'late_nasrid_extent'],
    ),
    paint: {
      'line-color': CATEGORY_COLOR,
      'line-width': confidence === 'secure' ? 2.5 : 2,
      ...(dasharray.length > 0 ? { 'line-dasharray': dasharray } : {}),
    },
  })
}

function addHistoricalLabels(map: Map) {
  map.addLayer({
    id: 'historical-label-sectors',
    type: 'symbol',
    source: AREA_LABEL_SOURCE_ID,
    minzoom: 11.25,
    filter: allFilters(
      geometryFilter('Point'),
      [
        'in',
        ['get', 'subtype'],
        ['literal', ['urban_sector', 'palatine_city', 'palatine_estate']],
      ],
    ),
    layout: {
      'text-field': ['get', 'name'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 11.25, 12, 15, 16],
      'text-letter-spacing': 0.08,
      'text-max-width': 12,
      'text-transform': 'uppercase',
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-padding': 10,
      'text-anchor': [
        'match',
        ['get', 'subtype'],
        'palatine_estate',
        'left',
        'center',
      ],
      'text-offset': [
        'match',
        ['get', 'subtype'],
        'palatine_estate',
        ['literal', [1.5, -0.4]],
        ['literal', [0, 0]],
      ],
    },
    paint: {
      'text-color': '#4b2e22',
      'text-halo-color': 'rgba(255, 249, 235, 0.94)',
      'text-halo-width': 2.5,
    },
  })

  map.addLayer({
    id: 'historical-label-quarters',
    type: 'symbol',
    source: AREA_LABEL_SOURCE_ID,
    minzoom: 13.25,
    filter: allFilters(
      geometryFilter('Point'),
      ['==', ['get', 'subtype'], 'historical_quarter'],
    ),
    layout: {
      'text-field': ['get', 'name'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 13.25, 10, 16, 13],
      'text-letter-spacing': 0.04,
      'text-max-width': 11,
      'text-transform': 'uppercase',
      'text-allow-overlap': false,
      'text-padding': 8,
    },
    paint: {
      'text-color': '#654530',
      'text-halo-color': 'rgba(255, 249, 235, 0.96)',
      'text-halo-width': 2.25,
    },
  })

  map.addLayer({
    id: 'historical-label-walls',
    type: 'symbol',
    source: SOURCE_ID,
    minzoom: 13.5,
    filter: allFilters(
      geometryFilter('LineString'),
      ['==', ['get', 'subtype'], 'defensive_wall'],
    ),
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 480,
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-max-angle': 35,
    },
    paint: {
      'text-color': '#7d312a',
      'text-halo-color': 'rgba(255, 249, 235, 0.92)',
      'text-halo-width': 2,
    },
  })

  map.addLayer({
    id: 'historical-label-rivers',
    type: 'symbol',
    source: SOURCE_ID,
    minzoom: 11.75,
    filter: allFilters(
      geometryFilter('LineString'),
      ['in', ['get', 'subtype'], ['literal', ['river', 'irrigation_channel']]],
    ),
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 360,
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-letter-spacing': 0.08,
      'text-max-angle': 35,
    },
    paint: {
      'text-color': '#17677a',
      'text-halo-color': 'rgba(244, 251, 251, 0.95)',
      'text-halo-width': 2,
    },
  })

  map.addLayer({
    id: 'historical-label-routes',
    type: 'symbol',
    source: SOURCE_ID,
    minzoom: 14.25,
    filter: allFilters(
      geometryFilter('LineString'),
      ['==', ['get', 'subtype'], 'historical_route'],
    ),
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 400,
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-max-angle': 35,
    },
    paint: {
      'text-color': '#6f4b31',
      'text-halo-color': 'rgba(255, 249, 235, 0.92)',
      'text-halo-width': 2,
    },
  })

  map.addLayer({
    id: 'historical-label-gates',
    type: 'symbol',
    source: SOURCE_ID,
    minzoom: 14.25,
    filter: allFilters(
      geometryFilter('Point'),
      ['==', ['get', 'category'], 'walls_gates'],
    ),
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-offset': [0, 1.25],
      'text-anchor': 'top',
      'text-max-width': 12,
      'text-optional': true,
    },
    paint: {
      'text-color': '#7d312a',
      'text-halo-color': 'rgba(255, 249, 235, 0.96)',
      'text-halo-width': 2,
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
  historicalOpacity: number,
  modernVisible: boolean,
  modernStrength: number,
  visibleCategories: readonly FeatureCategory[],
  selectedFeatureId: string | null,
  basemapVisibility: ReadonlyMap<string, 'visible' | 'none'>,
) {
  const visibility = historicalVisible ? 'visible' : 'none'
  const categories = categoryFilter(visibleCategories)

  for (const layerId of HISTORICAL_LAYER_IDS) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  for (const [layerId, originalVisibility] of basemapVisibility) {
    if (!map.getLayer(layerId)) continue
    map.setLayoutProperty(
      layerId,
      'visibility',
      modernVisible ? originalVisibility : 'none',
    )
  }

  map.setPaintProperty(
    BASEMAP_VEIL_LAYER_ID,
    'fill-opacity',
    modernVisible ? 0.62 * (1 - modernStrength) : 0.96,
  )

  applyHistoricalOpacity(map, historicalOpacity)

  map.setFilter(
    'historical-urban-extent-fill',
    allFilters(
      geometryFilter('Polygon'),
      ['==', ['get', 'subtype'], 'late_nasrid_extent'],
      categories,
    ),
  )
  map.setFilter(
    'historical-urban-extent-outline',
    allFilters(
      geometryFilter('Polygon'),
      ['==', ['get', 'subtype'], 'late_nasrid_extent'],
      categories,
    ),
  )
  map.setFilter(
    'historical-area-fill',
    allFilters(
      geometryFilter('Polygon'),
      ['!=', ['get', 'subtype'], 'late_nasrid_extent'],
      categories,
    ),
  )
  for (const confidence of ['secure', 'probable', 'approximate', 'disputed'] as const) {
    map.setFilter(
      `historical-area-${confidence}`,
      allFilters(
        geometryFilter('Polygon'),
        confidenceFilter(confidence),
        ['!=', ['get', 'subtype'], 'late_nasrid_extent'],
        categories,
      ),
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

  map.setFilter(
    'historical-label-sectors',
    allFilters(
      geometryFilter('Point'),
      [
        'in',
        ['get', 'subtype'],
        ['literal', ['urban_sector', 'palatine_city', 'palatine_estate']],
      ],
      categories,
    ),
  )
  map.setFilter(
    'historical-label-quarters',
    allFilters(
      geometryFilter('Point'),
      ['==', ['get', 'subtype'], 'historical_quarter'],
      categories,
    ),
  )
  map.setFilter(
    'historical-label-walls',
    allFilters(
      geometryFilter('LineString'),
      ['==', ['get', 'subtype'], 'defensive_wall'],
      categories,
    ),
  )
  map.setFilter(
    'historical-label-rivers',
    allFilters(
      geometryFilter('LineString'),
      ['in', ['get', 'subtype'], ['literal', ['river', 'irrigation_channel']]],
      categories,
    ),
  )
  map.setFilter(
    'historical-label-routes',
    allFilters(
      geometryFilter('LineString'),
      ['==', ['get', 'subtype'], 'historical_route'],
      categories,
    ),
  )
  map.setFilter(
    'historical-label-gates',
    allFilters(
      geometryFilter('Point'),
      ['==', ['get', 'category'], 'walls_gates'],
      categories,
    ),
  )

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

function applyHistoricalOpacity(map: Map, opacity: number) {
  map.setPaintProperty('historical-urban-extent-fill', 'fill-opacity', 0.07 * opacity)
  map.setPaintProperty('historical-urban-extent-outline', 'line-opacity', 0.8 * opacity)
  map.setPaintProperty('historical-area-fill', 'fill-opacity', [
    'match',
    ['get', 'confidence_location'],
    'secure',
    0.32 * opacity,
    'probable',
    0.24 * opacity,
    'approximate',
    0.16 * opacity,
    'disputed',
    0.1 * opacity,
    0.2 * opacity,
  ])

  for (const confidence of ['secure', 'probable', 'approximate', 'disputed'] as const) {
    map.setPaintProperty(`historical-area-${confidence}`, 'line-opacity', opacity)
    map.setPaintProperty(
      `historical-line-${confidence}`,
      'line-opacity',
      (confidence === 'disputed' ? 0.75 : 0.94) * opacity,
    )
    const pointOpacity = confidence === 'secure' ? 1 : confidence === 'probable' ? 0.7 : confidence === 'approximate' ? 0.12 : 0
    map.setPaintProperty(`historical-point-${confidence}`, 'circle-opacity', pointOpacity * opacity)
    map.setPaintProperty(`historical-point-${confidence}`, 'circle-stroke-opacity', opacity)
  }

  for (const layerId of [
    'historical-label-sectors',
    'historical-label-quarters',
    'historical-label-walls',
    'historical-label-rivers',
    'historical-label-routes',
    'historical-label-gates',
  ]) {
    map.setPaintProperty(layerId, 'text-opacity', opacity)
  }
}

function focusFeature(
  map: Map,
  collection: HistoricalFeatureCollection,
  selectedFeatureId: string | null,
) {
  if (!selectedFeatureId) return
  const feature = collection.features.find((candidate) => candidate.id === selectedFeatureId)
  if (!feature) return

  const coordinates = collectCoordinates(feature.geometry.coordinates)
  if (coordinates.length === 0) return
  if (feature.geometry.type === 'Point') {
    map.easeTo({ center: coordinates[0] as [number, number], zoom: Math.max(map.getZoom(), 15.5), duration: 650 })
    return
  }

  const longitudes = coordinates.map((position) => position[0])
  const latitudes = coordinates.map((position) => position[1])
  const mobile = window.matchMedia('(max-width: 720px)').matches
  map.fitBounds(
    [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ],
    {
      padding: mobile
        ? { top: 90, right: 35, bottom: 260, left: 35 }
        : { top: 90, right: 420, bottom: 90, left: 80 },
      maxZoom: 16,
      duration: 650,
    },
  )
}

function collectCoordinates(value: unknown): Position[] {
  if (!Array.isArray(value)) return []
  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    return [value as Position]
  }
  return value.flatMap(collectCoordinates)
}

function buildAreaLabelCollection(
  collection: FeatureCollection,
): FeatureCollection<Point> {
  const features: Feature<Point>[] = []

  for (const feature of collection.features) {
    const geometry = feature.geometry
    if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
      continue
    }
    if (feature.properties?.subtype === 'late_nasrid_extent') continue

    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    const largest = polygons.reduce((current, candidate) =>
      Math.abs(ringArea(candidate[0])) > Math.abs(ringArea(current[0]))
        ? candidate
        : current,
    )

    features.push({
      type: 'Feature',
      id: feature.id,
      properties: feature.properties,
      geometry: {
        type: 'Point',
        coordinates: polygonCentroid({ type: 'Polygon', coordinates: largest }),
      },
    })
  }

  return { type: 'FeatureCollection', features }
}

function polygonCentroid(polygon: Polygon): Position {
  const ring = polygon.coordinates[0]
  let crossSum = 0
  let longitudeSum = 0
  let latitudeSum = 0

  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index]
    const next = ring[index + 1]
    const cross = current[0] * next[1] - next[0] * current[1]
    crossSum += cross
    longitudeSum += (current[0] + next[0]) * cross
    latitudeSum += (current[1] + next[1]) * cross
  }

  if (Math.abs(crossSum) < Number.EPSILON) return ring[0]
  return [longitudeSum / (3 * crossSum), latitudeSum / (3 * crossSum)]
}

function ringArea(ring: Position[]) {
  let sum = 0
  for (let index = 0; index < ring.length - 1; index += 1) {
    sum += ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1]
  }
  return sum / 2
}
