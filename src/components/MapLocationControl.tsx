import type { Locale } from '../i18n/types'
import type { MapLocationState } from '../location/useMapLocation'

interface MapLocationControlProps {
  locale: Locale
  state: MapLocationState
  isFollowing: boolean
  onActivate: () => void
}

export function MapLocationControl({
  locale,
  state,
  isFollowing,
  onActivate,
}: MapLocationControlProps) {
  const en = locale === 'en'
  const active = state.status === 'active'
  const requesting = state.status === 'requesting'
  const label = active
    ? (isFollowing
        ? (en ? 'Center on my location' : 'Centrar en mi ubicación')
        : (en ? 'Recenter on my location' : 'Volver a centrar en mi ubicación'))
    : requesting
      ? (en ? 'Finding my location' : 'Buscando mi ubicación')
      : (en ? 'Show my location' : 'Mostrar mi ubicación')

  return (
    <div className="map-location-control">
      <button
        type="button"
        className={`map-control-button map-location-button${active ? ' map-location-button--active' : ''}${active && !isFollowing ? ' map-location-button--passive' : ''}`}
        aria-label={label}
        aria-pressed={active ? isFollowing : false}
        disabled={requesting}
        title={label}
        onClick={onActivate}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="8" />
        </svg>
        <span>{en ? 'My location' : 'Mi ubicación'}</span>
      </button>

      {requesting && (
        <p className="map-location-feedback" role="status">
          {en ? 'Finding your location…' : 'Buscando tu ubicación…'}
        </p>
      )}
      {active && (
        <span className="sr-only" role="status">
          {en ? 'Location tracking is active.' : 'El seguimiento de ubicación está activo.'}
        </span>
      )}
      {state.status === 'permission-denied' && (
        <p className="map-location-feedback map-location-feedback--error" role="alert">
          {en
            ? 'Location is blocked. Allow location for this site in your browser settings, then try again.'
            : 'La ubicación está bloqueada. Permítela para este sitio en la configuración del navegador e inténtalo de nuevo.'}
        </p>
      )}
      {state.status === 'unavailable' && (
        <p className="map-location-feedback map-location-feedback--error" role="alert">
          {en
            ? 'Location is not available in this browser or device.'
            : 'La ubicación no está disponible en este navegador o dispositivo.'}
        </p>
      )}
      {state.status === 'error' && (
        <p className="map-location-feedback map-location-feedback--error" role="alert">
          {locationErrorMessage(locale, state.reason)}
        </p>
      )}
    </div>
  )
}

function locationErrorMessage(locale: Locale, reason: Extract<MapLocationState, { status: 'error' }>['reason']) {
  const en = locale === 'en'
  if (reason === 'timeout') {
    return en
      ? 'Location timed out. Move into a clearer area and try again.'
      : 'La ubicación ha agotado el tiempo de espera. Sitúate en una zona más despejada e inténtalo de nuevo.'
  }
  if (reason === 'position-unavailable') {
    return en
      ? 'Your position is temporarily unavailable. Check device location services and try again.'
      : 'Tu posición no está disponible temporalmente. Comprueba la ubicación del dispositivo e inténtalo de nuevo.'
  }
  return en
    ? 'Your location could not be obtained. Check location services and try again.'
    : 'No se ha podido obtener tu ubicación. Comprueba los servicios de ubicación e inténtalo de nuevo.'
}
