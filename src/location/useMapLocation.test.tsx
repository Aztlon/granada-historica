import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useMapLocation } from './useMapLocation'

describe('useMapLocation', () => {
  it('waits for an explicit request, streams fixes and stops the shared watcher', () => {
    let success: PositionCallback | null = null
    const clearWatch = vi.fn()
    const watchPosition = vi.fn((callback: PositionCallback) => {
      success = callback
      return 23
    })
    installGeolocation({ watchPosition, clearWatch })

    const { result, unmount } = renderHook(() => useMapLocation())
    expect(result.current.state).toEqual({ status: 'idle' })
    expect(watchPosition).not.toHaveBeenCalled()

    act(() => result.current.request())
    expect(result.current.state).toEqual({ status: 'requesting' })
    expect(watchPosition).toHaveBeenCalledTimes(1)

    act(() => success?.(position(-3.59975, 37.17464, 14)))
    expect(result.current.state).toMatchObject({
      status: 'active',
      fix: { longitude: -3.59975, latitude: 37.17464, accuracy: 14 },
      trackingId: 1,
    })

    act(() => result.current.stop())
    expect(clearWatch).toHaveBeenCalledWith(23)
    expect(result.current.state).toEqual({ status: 'idle' })

    act(() => result.current.request())
    unmount()
    expect(clearWatch).toHaveBeenLastCalledWith(23)
    expect(clearWatch).toHaveBeenCalledTimes(2)
  })

  it('classifies synchronous permission denial and clears the failed watch', () => {
    const clearWatch = vi.fn()
    installGeolocation({
      watchPosition: vi.fn((_success: PositionCallback, failure: PositionErrorCallback) => {
        failure({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
        return 91
      }),
      clearWatch,
    })

    const { result } = renderHook(() => useMapLocation())
    act(() => result.current.request())

    expect(result.current.state).toEqual({ status: 'permission-denied' })
    expect(clearWatch).toHaveBeenCalledWith(91)
  })

  it('reports unsupported geolocation without starting a watcher', () => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined })
    const { result } = renderHook(() => useMapLocation())

    act(() => result.current.request())

    expect(result.current.state).toEqual({ status: 'unavailable' })
  })
})

function installGeolocation({
  watchPosition,
  clearWatch,
}: {
  watchPosition: Geolocation['watchPosition']
  clearWatch: Geolocation['clearWatch']
}) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { watchPosition, clearWatch },
  })
}

function position(longitude: number, latitude: number, accuracy: number): GeolocationPosition {
  return {
    coords: {
      longitude,
      latitude,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  }
}
