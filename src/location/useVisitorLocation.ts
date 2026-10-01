import { useCallback, useState } from 'react'
import { nearestPilotStop } from '../data/pilot'
import type { LocationFix } from '../data/pilotSchema'

export type VisitorLocationState =
  | { status: 'idle' | 'explaining' | 'loading' | 'denied' | 'timeout' | 'unavailable' }
  | { status: 'located'; fix: LocationFix; nearestPlaceId: string; distance: number }

export function useVisitorLocation() {
  const [state, setState] = useState<VisitorLocationState>({ status: 'idle' })

  const explain = useCallback(() => setState({ status: 'explaining' }), [])
  const cancel = useCallback(() => setState({ status: 'idle' }), [])
  const clear = useCallback(() => setState({ status: 'idle' }), [])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'unavailable' })
      return
    }
    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const fix: LocationFix = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }
        const nearest = nearestPilotStop(fix)
        setState({
          status: 'located',
          fix,
          nearestPlaceId: nearest.stop.id,
          distance: nearest.distance,
        })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setState({ status: 'denied' })
        else if (error.code === error.TIMEOUT) setState({ status: 'timeout' })
        else setState({ status: 'unavailable' })
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }, [])

  return { state, explain, cancel, locate, clear }
}
