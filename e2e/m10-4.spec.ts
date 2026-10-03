import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe.configure({ mode: 'serial' })
test.setTimeout(45_000)

test('offers an accessible discrete period selector with durable URLs', async ({ page, browserName }) => {
  await page.goto('?period=c1492&lang=en')

  const group = page.getByRole('group', { name: 'Historical period' })
  await expect(group).toBeVisible()
  await expect(page.getByText('Internal review · not for publication')).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow')

  const c1492 = page.getByRole('radio', { name: 'c. 1492' })
  const c1550 = page.getByRole('radio', { name: 'c. 1550' })
  await expect(c1550).toBeEnabled({ timeout: browserName === 'webkit' ? 20_000 : 5_000 })
  if (browserName !== 'webkit') {
    await c1492.focus()
    await page.keyboard.press('ArrowRight')
    await expect(c1550).toBeChecked()
    await expect(page).toHaveURL(/period=c1550/)
    await expect(page.getByText('Two documented snapshots; no year-by-year timeline.')).toBeVisible()
  }

  if (browserName !== 'webkit') {
    const selectorBox = await page.getByTestId('internal-period-selector').boundingBox()
    const viewport = page.viewportSize()
    expect(selectorBox).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect(selectorBox!.x).toBeGreaterThanOrEqual(0)
    expect(selectorBox!.x + selectorBox!.width).toBeLessThanOrEqual(viewport!.width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    const results = await new AxeBuilder({ page })
      .include('[data-testid="internal-period-selector"]')
      .analyze()
    expect(seriousViolations(results.violations)).toEqual([])
  }
})

test('shows unfinished state, sources and cartographic ambiguity without a finished footprint', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Detailed internal-data interactions run in Chromium; WebKit retains the mobile shell smoke test.')
  await page.goto('?period=c1550&feature=royal.palace-charles-v&lang=en')

  await expect(page.getByRole('heading', { name: 'Palace of Charles V' }))
    .toBeVisible({ timeout: browserName === 'webkit' ? 30_000 : 5_000 })
  await expect(page.getByText('Newly built')).toBeVisible()
  await expect(page.getByText('Under construction', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible()
  await expect(page.getByText(/use of the completed footprint is rejected/i)).toBeVisible()
  await expect(page.getByText(/without erasing continuity of the Nasrid enclosure/i)).toBeVisible()
  await expect(page.getByText(/6 of 6 sign-offs pending/i)).toBeVisible()

  if (browserName !== 'webkit') {
    const results = await new AxeBuilder({ page }).include('.feature-drawer').analyze()
    expect(seriousViolations(results.violations)).toEqual([])
  }
})

test('never turns a review-slice omission into historical absence', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Detailed internal-data interactions run in Chromium; WebKit retains the mobile shell smoke test.')
  await page.goto('?period=c1492&feature=gate.mawrur&lang=en')
  await expect(page.getByRole('heading', { name: 'Puerta del Mauror' })).toBeVisible()

  if (browserName === 'webkit') {
    await page.goto('?period=c1550&feature=gate.mawrur&lang=en')
  } else {
    await page.getByRole('button', { name: 'Compare in c. 1550' }).click()
  }
  await expect(page.getByText('Not represented in this review slice'))
    .toBeVisible({ timeout: browserName === 'webkit' ? 30_000 : 5_000 })
  await expect(page.getByText(/must not be interpreted as historically absent/)).toBeVisible()
  await expect(page.getByText('You are still viewing c. 1550.')).toBeVisible()
  await expect(page).toHaveURL(/period=c1550/)
  await expect(page).toHaveURL(/feature=gate.mawrur/)
})

test('shows an added M10.5 entity with relationship and phase limits', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Detailed internal-data interactions run in Chromium; WebKit retains the mobile shell smoke test.')
  await page.goto('?period=c1550&feature=civic.real-chancilleria&lang=en')

  await expect(page.getByText(/M10.5 candidate · 39 research features/))
    .toBeVisible({ timeout: browserName === 'webkit' ? 30_000 : 5_000 })
  await expect(page.getByRole('heading', { name: 'Royal Chancery' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Relationships around 1550' })).toBeVisible()
  await expect(page.getByText(/square formed a new civic frontage/i)).toBeVisible()
  await expect(page.getByText(/exclude the façade of 1587/i)).toBeVisible()
})

function seriousViolations(violations: {
  impact?: string | null
  id: string
  nodes: unknown[]
}[]) {
  return violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length }))
}
