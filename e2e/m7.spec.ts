import { expect, test } from '@playwright/test'

const stops = [
  ['bib-rambla', 'Puerta de Bibarrambla'],
  ['zacatin', 'Zacatín'],
  ['alcaiceria', 'Alcaicería'],
  ['madraza', 'Madraza Yusufiyya'],
  ['mezquita-mayor', 'Mezquita Mayor de la medina'],
] as const

for (const [slug, title] of stops) {
  test(`opens the durable ${slug} place and QR URLs`, async ({ page, request }) => {
    await page.goto(`place/${slug}/?lang=es`)
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await expect(page.getByText(/Parada \d de 5/)).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    const qr = await request.get(`pilot/qr/${slug}.svg`)
    expect(qr.ok()).toBeTruthy()
    expect(await qr.text()).toContain('<svg')
  })
}

test('navigates the route in order and restores place, feature and language history', async ({ page }) => {
  await page.goto('route/bib-rambla/?lang=es')
  await expect(page.getByRole('heading', { name: 'De Bibarrambla al corazón de la medina' })).toBeVisible()
  await page.getByRole('button', { name: /Puerta de Bibarrambla/ }).click()
  await page.getByRole('button', { name: 'Abrir la ficha histórica completa' }).click()
  await expect(page).toHaveURL(/feature=gate\.bib-rambla/)
  await page.goBack()
  await expect(page.getByText('Parada 1 de 5')).toBeVisible()
  await page.getByRole('button', { name: 'Cambiar idioma a inglés' }).click()
  await expect(page.getByText('Stop 1 of 5')).toBeVisible()
  await page.goBack()
  await expect(page.getByText('Parada 1 de 5')).toBeVisible()
  await page.goForward()
  await expect(page.getByText('Stop 1 of 5')).toBeVisible()
})

test('switches to complete English pilot content', async ({ page }) => {
  await page.goto('place/mezquita-mayor/?lang=en')
  await expect(page.getByRole('heading', { name: 'Great Mosque of the medina' })).toBeVisible()
  await page.getByRole('button', { name: 'Open the complete historical record' }).click()
  await expect(page.getByRole('heading', { name: 'How do we know?' })).toBeVisible()
})

test('does not request location before the second opt-in step', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ longitude: -3.59975, latitude: 37.17464 })
  await page.goto('place/bib-rambla/?lang=en')
  await page.getByRole('button', { name: 'Use my location' }).click()
  await expect(page.getByText(/used once on this device/)).toBeVisible()
  expect(page.url()).not.toContain('latitude')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText(/Nearest stop: Bibarrambla Gate/)).toBeVisible()
  expect(page.url()).not.toMatch(/-?\d+\.\d{4}/)
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})

test('handles denied and low-accuracy location without blocking the route', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition(success: PositionCallback, failure: PositionErrorCallback) {
          calls += 1
          if (calls === 1) {
            failure({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
          } else {
            success({
              coords: { latitude: 37.17464, longitude: -3.59975, accuracy: 450, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
              timestamp: Date.now(),
              toJSON: () => ({}),
            })
          }
        },
      },
    })
  })
  await page.goto('place/bib-rambla/?lang=en')
  await page.getByRole('button', { name: 'Use my location' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText(/Location permission was denied/)).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText(/low-accuracy fix/)).toBeVisible()
  await page.getByRole('button', { name: 'Stop using my location' }).click()
  await expect(page.getByRole('button', { name: 'Use my location' })).toBeVisible()
})

test('keeps place content usable when the basemap fails', async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', (route) => route.abort())
  await page.goto('place/alcaiceria/?lang=en')
  await expect(page.getByRole('heading', { name: 'Alcaicería' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('basemap could not be loaded')
})

test('restores focus and honours reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('place/bib-rambla/?lang=en')
  const close = page.getByRole('button', { name: 'Show the full map' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  const reopen = page.getByRole('button', { name: 'Bibarrambla Gate' })
  await reopen.click()
  await page.keyboard.press('Escape')
  await expect(reopen).toBeFocused()
  const transitionSeconds = await page.locator('.place-panel').evaluate((element) => (
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  ))
  expect(transitionSeconds).toBeLessThanOrEqual(0.00001)
})
