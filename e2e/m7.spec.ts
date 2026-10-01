import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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

test('publishes the noindex review hub and printable field materials', async ({ page, request }) => {
  await page.goto('pilot/review/')
  await expect(page.getByRole('heading', { name: /Revisión del piloto/ })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow')

  for (const path of [
    'pilot/test-sheet.html',
    'pilot/field-checklist.html',
    ...stops.map(([slug]) => `pilot/cards/${slug}.html`),
  ]) {
    expect((await request.get(path)).ok(), `${path} should be available`).toBeTruthy()
  }
})

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
  const applicationRequests: string[] = []
  const consoleMessages: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin === 'http://127.0.0.1:4173') applicationRequests.push(url.href)
  })
  page.on('console', (message) => consoleMessages.push(message.text()))
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
  expect(applicationRequests.join('\n')).not.toMatch(/37\.17464|-3\.59975/)
  expect(consoleMessages.join('\n')).not.toMatch(/37\.17464|-3\.59975/)
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

for (const [code, expected] of [
  [2, 'Location is unavailable on this device.'],
  [3, 'Location timed out.'],
] as const) {
  test(`handles geolocation error ${code}`, async ({ page }) => {
    await page.addInitScript((errorCode) => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition(_success: PositionCallback, failure: PositionErrorCallback) {
            failure({ code: errorCode, message: 'test error', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
          },
        },
      })
    }, code)
    await page.goto('place/bib-rambla/?lang=en')
    await page.getByRole('button', { name: 'Use my location' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(new RegExp(expected))).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
}

test('handles an unsupported browser', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined })
  })
  await page.goto('place/bib-rambla/?lang=en')
  await page.getByRole('button', { name: 'Use my location' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Location is unavailable on this device.')).toBeVisible()
})

test('reports an outside-pilot fix without leaving the route', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ longitude: -3.7038, latitude: 40.4168 })
  await page.goto('place/bib-rambla/?lang=en')
  await page.getByRole('button', { name: 'Use my location' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText(/outside the 2 km pilot area/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bibarrambla Gate' })).toBeVisible()
})

test('has no serious accessibility violations in the route and feature panels', async ({ page }) => {
  await page.goto('route/bib-rambla/?lang=es')
  const routeResults = await new AxeBuilder({ page }).include('.place-panel').analyze()
  expect(seriousViolations(routeResults.violations)).toEqual([])

  await page.getByRole('button', { name: /Puerta de Bibarrambla/ }).click()
  await page.getByRole('button', { name: 'Abrir la ficha histórica completa' }).click()
  const featureResults = await new AxeBuilder({ page }).include('.feature-drawer').analyze()
  expect(seriousViolations(featureResults.violations)).toEqual([])
})

test('has no serious accessibility violations in the generated review materials', async ({ page }) => {
  for (const path of [
    'pilot/review/',
    'pilot/test-sheet.html',
    'pilot/field-checklist.html',
    'pilot/cards/bib-rambla.html',
  ]) {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).analyze()
    expect(seriousViolations(results.violations), path).toEqual([])
  }
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

function seriousViolations(violations: {
  impact?: string | null
  id: string
  help: string
  nodes: { target: { toString(): string }[] }[]
}[]) {
  return violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      targets: nodes.flatMap((node) => node.target.map(String)),
    }))
}
