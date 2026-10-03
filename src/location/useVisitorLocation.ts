import { useCallback, useEffect, useRef, useState } from 'react'
import { nearestPilotStop } from '../data/pilot'
import type { LocationFix } from '../data/pilotSchema'

export type VisitorLocationState =
  | { status: 'idle' | 'loading' | 'denied' | 'timeout' | 'unavailable' }
  | { status: 'located'; fix: LocationFix; nearestPlaceId: string; distance: number; trackingId: number }

export function useVisitorLocation() {
  const [state, setState] = useState<VisitorLocationState>({ status: 'idle' })
  const watchIdRef = useRef<number | null>(null)
  const trackingIdRef = useRef(0)

  const stopWatching = useCallback(() => {
    if (watchIdRef.current === null || !navigator.geolocation) return
    navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
  }, [])

  const clear = useCallback(() => {
    stopWatching()
    setState({ status: 'idle' })
  }, [stopWatching])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'unavailable' })
      return
    }
    stopWatching()
    trackingIdRef.current += 1
    const trackingId = trackingIdRef.current
    setState({ status: 'loading' })
    watchIdRef.current = navigator.geolocation.watchPosition(
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
          trackingId,
        })
      },
      (error) => {
        stopWatching()
        if (error.code === error.PERMISSION_DENIED) setState({ status: 'denied' })
        else if (error.code === error.TIMEOUT) setState({ status: 'timeout' })
        else setState({ status: 'unavailable' })
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 },
    )
  }, [stopWatching])

  useEffect(() => stopWatching, [stopWatching])

  return { state, locate, clear }
}
