import { useCallback, useEffect, useRef, useState } from 'react'
import type { LocationFix } from './types'

export type MapLocationErrorReason = 'timeout' | 'position-unavailable' | 'unknown'

export type MapLocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'active'; fix: LocationFix; trackingId: number }
  | { status: 'permission-denied' }
  | { status: 'unavailable' }
  | { status: 'error'; reason: MapLocationErrorReason }

export function useMapLocation() {
  const [state, setState] = useState<MapLocationState>({ status: 'idle' })
  const watchIdRef = useRef<number | null>(null)
  const trackingIdRef = useRef(0)

  const stopWatch = useCallback(() => {
    if (watchIdRef.current === null || !navigator.geolocation) return
    navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
  }, [])

  const stop = useCallback(() => {
    stopWatch()
    setState({ status: 'idle' })
  }, [stopWatch])

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'unavailable' })
      return
    }

    stopWatch()
    trackingIdRef.current += 1
    const trackingId = trackingIdRef.current
    let failedSynchronously = false
    setState({ status: 'requesting' })

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const fix: LocationFix = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }
        setState({ status: 'active', fix, trackingId })
      },
      (error) => {
        failedSynchronously = watchIdRef.current === null
        stopWatch()
        if (error.code === error.PERMISSION_DENIED) {
          setState({ status: 'permission-denied' })
        } else if (error.code === error.TIMEOUT) {
          setState({ status: 'error', reason: 'timeout' })
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setState({ status: 'error', reason: 'position-unavailable' })
        } else {
          setState({ status: 'error', reason: 'unknown' })
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 },
    )

    if (failedSynchronously) navigator.geolocation.clearWatch(watchId)
    else watchIdRef.current = watchId
  }, [stopWatch])

  useEffect(() => stopWatch, [stopWatch])

  return { state, request, stop }
}
