import { expect, test } from '@playwright/test'

test('offers one shared location watcher across the main map and pilot routes', async ({ page }) => {
  await page.addInitScript(() => {
    let watchCalls = 0
    let clearCalls = 0
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition(success: PositionCallback) {
          watchCalls += 1
          queueMicrotask(() => success({
            coords: { latitude: 37.17464, longitude: -3.59975, accuracy: 16, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
            timestamp: Date.now(),
            toJSON: () => ({}),
          }))
          return 41
        },
        clearWatch() { clearCalls += 1 },
      },
    })
    Object.defineProperty(window, '__locationMetrics', {
      value: () => ({ watchCalls, clearCalls }),
    })
  })

  await page.goto('?lang=en')
  const locationControl = page.getByRole('button', { name: 'Show my location' })
  await expect(locationControl).toBeVisible()
  expect(await locationMetrics(page)).toEqual({ watchCalls: 0, clearCalls: 0 })

  await locationControl.click()
  await expect(page.getByText('Location tracking is active.')).toBeAttached()
  await expect(page.locator('.map-location-button')).toHaveAttribute('aria-pressed', 'true')
  expect(await locationMetrics(page)).toEqual({ watchCalls: 1, clearCalls: 0 })

  await page.evaluate(() => {
    window.history.pushState({}, '', '/granada-historica/place/bib-rambla/?lang=en')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page.getByRole('heading', { name: 'Bibarrambla Gate' })).toBeVisible()
  await expect(page.getByText(/Nearest stop: Bibarrambla Gate/)).toBeVisible()
  expect(await locationMetrics(page)).toEqual({ watchCalls: 1, clearCalls: 0 })

  await page.evaluate(() => {
    window.history.pushState({}, '', '/granada-historica/?lang=en')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page.getByRole('heading', { name: 'Bibarrambla Gate' })).not.toBeVisible()
  await expect(page.getByText('Location tracking is active.')).toBeAttached()
  expect(await locationMetrics(page)).toEqual({ watchCalls: 1, clearCalls: 0 })
})

test('gives browser-settings recovery guidance after permission denial', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition(_success: PositionCallback, failure: PositionErrorCallback) {
          failure({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
          return 7
        },
        clearWatch() {},
      },
    })
  })

  await page.goto('?lang=en')
  await page.getByRole('button', { name: 'Show my location' }).click()
  await expect(page.locator('.map-location-feedback[role="alert"]')).toContainText('Allow location for this site in your browser settings')
  await expect(page.getByRole('button', { name: 'Show my location' })).toBeEnabled()
})

async function locationMetrics(page: import('@playwright/test').Page) {
  return page.evaluate(() => (
    window as typeof window & { __locationMetrics: () => { watchCalls: number; clearCalls: number } }
  ).__locationMetrics())
}
