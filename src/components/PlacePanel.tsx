import { useEffect, useRef } from 'react'
import type { HistoricalFeature } from '../data/schema'
import type { Locale, PlaceStop } from '../data/pilotSchema'
import { pilotRoute } from '../data/pilot'
import type { VisitorLocationState } from '../location/useVisitorLocation'

interface PlacePanelProps {
  isOpen: boolean
  locale: Locale
  place: PlaceStop | null
  featuresById: ReadonlyMap<string, HistoricalFeature>
  locationState: VisitorLocationState
  onClose: () => void
  onSelectPlace: (place: PlaceStop) => void
  onSelectFeature: (featureId: string) => void
  onLocate: () => void
  onClearLocation: () => void
}

export function PlacePanel({
  isOpen,
  locale,
  place,
  featuresById,
  locationState,
  onClose,
  onSelectPlace,
  onSelectFeature,
  onLocate,
  onClearLocation,
}: PlacePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const en = locale === 'en'

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1) ?? first
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      returnFocusRef.current?.focus()
    }
  }, [isOpen])

  const currentIndex = place ? pilotRoute.stops.findIndex((stop) => stop.id === place.id) : -1
  const previous = currentIndex > 0 ? pilotRoute.stops[currentIndex - 1] : null
  const next = currentIndex >= 0 && currentIndex < pilotRoute.stops.length - 1
    ? pilotRoute.stops[currentIndex + 1]
    : null

  return (
    <aside
      ref={panelRef}
      className={`place-panel ${isOpen ? 'place-panel--open' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="place-panel-title"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="drawer-handle" aria-hidden="true" />
      <div className="place-panel__header">
        <div>
          <p className="panel-kicker">
            {place
              ? (en ? `Stop ${place.order} of ${pilotRoute.stops.length}` : `Parada ${place.order} de ${pilotRoute.stops.length}`)
              : (en ? 'M7 public-access pilot' : 'Piloto M7 de acceso público')}
          </p>
          <h2 id="place-panel-title">{place ? place.title[locale] : pilotRoute.title[locale]}</h2>
        </div>
        <button ref={closeRef} className="icon-button" type="button" aria-label={en ? 'Show the full map' : 'Mostrar el mapa completo'} onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="place-panel__content">
        {pilotRoute.status === 'preview' && (
          <p className="preview-badge">{en ? 'Preview · field validation pending' : 'Vista previa · pendiente de validación sobre el terreno'}</p>
        )}

        {place ? (
          <>
            <p className="place-panel__lede">{place.introduction[locale]}</p>
            <p className="arrival-cue">{place.arrival_cue[locale]}</p>
            <button className="primary-action" type="button" onClick={() => onSelectFeature(place.primary_feature_id)}>
              {en ? 'Open the complete historical record' : 'Abrir la ficha histórica completa'}
            </button>

            <section className="related-features" aria-labelledby="related-title">
              <h3 id="related-title">{en ? 'Related places' : 'Lugares relacionados'}</h3>
              <div>
                {place.related_feature_ids.map((featureId) => {
                  const feature = featuresById.get(featureId)
                  return feature ? (
                    <button key={featureId} type="button" onClick={() => onSelectFeature(featureId)}>{feature.properties.name}</button>
                  ) : null
                })}
              </div>
            </section>

            <nav className="route-navigation" aria-label={en ? 'Pilot route' : 'Ruta piloto'}>
              {previous ? <button type="button" onClick={() => onSelectPlace(previous)}>← {previous.title[locale]}</button> : <span />}
              {next ? <button type="button" onClick={() => onSelectPlace(next)}>{next.title[locale]} →</button> : <span className="route-finish">{en ? 'End of route' : 'Fin de la ruta'}</span>}
            </nav>
          </>
        ) : (
          <>
            <p className="place-panel__lede">{pilotRoute.description[locale]}</p>
            <ol className="route-stop-list">
              {pilotRoute.stops.map((stop) => (
                <li key={stop.id}>
                  <button type="button" onClick={() => onSelectPlace(stop)}>
                    <span>{stop.order}</span>
                    <strong>{stop.title[locale]}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}

        <LocationSection
          locale={locale}
          state={locationState}
          onLocate={onLocate}
          onClear={onClearLocation}
          onSelectPlace={onSelectPlace}
        />
      </div>
    </aside>
  )
}

function LocationSection({
  locale,
  state,
  onLocate,
  onClear,
  onSelectPlace,
}: {
  locale: Locale
  state: VisitorLocationState
  onLocate: () => void
  onClear: () => void
  onSelectPlace: (place: PlaceStop) => void
}) {
  const en = locale === 'en'
  const nearest = state.status === 'located'
    ? pilotRoute.stops.find((stop) => stop.id === state.nearestPlaceId) ?? null
    : null

  return (
    <section className="location-section" aria-labelledby="location-title">
      <h3 id="location-title">{en ? 'Where am I?' : '¿Dónde estoy?'}</h3>
      {state.status === 'idle' && <button type="button" onClick={onLocate}>{en ? 'Use my location' : 'Usar mi ubicación'}</button>}
      {state.status === 'loading' && <p role="status">{en ? 'Finding your location…' : 'Buscando tu ubicación…'}</p>}
      {state.status === 'located' && nearest && (
        <div role="status">
          {state.distance <= 2_000 ? (
            <p>{en
              ? `Nearest stop: ${nearest.title.en}, ${Math.round(state.distance)} m away. Accuracy ±${Math.round(state.fix.accuracy)} m.`
              : `Parada más cercana: ${nearest.title.es}, a ${Math.round(state.distance)} m. Precisión ±${Math.round(state.fix.accuracy)} m.`}</p>
          ) : (
            <p>{en ? 'You are outside the 2 km pilot area; the map remains centred on Granada.' : 'Estás fuera del ámbito de 2 km del piloto; el mapa permanece centrado en Granada.'}</p>
          )}
          {state.fix.accuracy > 150 && (
            <p className="location-warning">{en
              ? 'This is a low-accuracy fix; use the named street or landmark to confirm the stop.'
              : 'La precisión es baja; confirma la parada con la calle o el hito indicado.'}</p>
          )}
          <p className="location-tracking-note">{en
            ? 'Your location updates while this page is open. It stays on this device and is not stored or added to analytics.'
            : 'Tu ubicación se actualiza mientras esta página está abierta. Permanece en este dispositivo y no se guarda ni se añade a la analítica.'}</p>
          <div className="location-actions">
            {state.distance <= 2_000 && <button type="button" onClick={() => onSelectPlace(nearest)}>{en ? 'Open nearest stop' : 'Abrir la parada más cercana'}</button>}
            <button type="button" onClick={onClear}>{en ? 'Stop using my location' : 'Dejar de usar mi ubicación'}</button>
          </div>
        </div>
      )}
      {state.status === 'denied' && <p role="alert">{en ? 'Location permission was denied. You can continue using every stop manually.' : 'Se ha denegado el permiso de ubicación. Puedes seguir usando todas las paradas manualmente.'}</p>}
      {state.status === 'timeout' && <p role="alert">{en ? 'Location timed out. Try again when the device has a clearer signal.' : 'La ubicación ha agotado el tiempo de espera. Inténtalo de nuevo con mejor señal.'}</p>}
      {state.status === 'unavailable' && <p role="alert">{en ? 'Location is unavailable on this device.' : 'La ubicación no está disponible en este dispositivo.'}</p>}
      {['denied', 'timeout', 'unavailable'].includes(state.status) && <button type="button" onClick={onLocate}>{en ? 'Try again' : 'Intentar de nuevo'}</button>}
    </section>
  )
}
