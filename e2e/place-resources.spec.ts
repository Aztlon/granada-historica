import { expect, test } from '@playwright/test'

test('keeps the Bab al-Ramla example text-only and switches its reading links', async ({ page }) => {
  await page.goto('place/bib-rambla/?lang=en')
  const resources = page.locator('.place-panel .place-resources')
  await expect(resources.getByText(/No visual reconstruction of 1492/)).toBeVisible()
  await expect(resources.locator('img')).toHaveCount(0)
  await expect(resources.getByRole('link', { name: 'Gate of Bibarrambla — Wikipedia' }))
    .toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Gate_of_Bibarrambla')
  await page.getByRole('button', { name: 'Change language to Spanish' }).click()
  await expect(resources.getByRole('link', { name: 'Puerta de Bib-Rambla — Wikipedia' }))
    .toHaveAttribute('href', 'https://es.wikipedia.org/wiki/Puerta_de_Bib-Rambla')
  await page.getByRole('button', { name: 'Abrir la ficha histórica completa' }).click()
  const drawer = page.getByRole('dialog', { name: 'Puerta de Bibarrambla' })
  await expect(drawer.getByText(/El punto del mapa señala el emplazamiento original/)).toBeVisible()
  await expect(drawer.locator('.sources-section')).toBeVisible()
  await expect(drawer.locator('.place-resources')).toBeVisible()
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.locator('body').evaluate((body) => body.clientWidth))
})
