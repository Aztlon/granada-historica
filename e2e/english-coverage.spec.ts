import { expect, test, type Page } from '@playwright/test'
import presentations from '../data/entity-presentations.json' with { type: 'json' }
import translations from '../data/translations/en.json' with { type: 'json' }

async function switchLanguageAndReopen(page: Page, from: 'es' | 'en', search: string) {
  // The information drawer is modal; its backdrop intentionally blocks the header.
  await page.getByRole('button', { name: from === 'es' ? 'Cerrar el panel informativo' : 'Close information panel' }).click()
  await page.getByRole('button', { name: from === 'es' ? 'Cambiar idioma a inglés' : 'Change language to Spanish' }).click()
  const mobileSearch = page.getByRole('button', { name: from === 'es' ? 'Search historical Granada' : 'Buscar en la Granada histórica' })
  if (await mobileSearch.isVisible()) await mobileSearch.click()
  await page.getByRole('combobox').fill(search)
  await page.getByRole('combobox').press('Enter')
}

test('switches a newly translated record between Spanish and English', async ({ page }) => {
  const presentation = presentations.presentations.find(({ entity_id }) => entity_id === 'water.banuelo')!
  await page.goto('?feature=water.banuelo&lang=es')
  await expect(page.locator('.drawer-lede')).toHaveText(presentation.general_description.es)
  await switchLanguageAndReopen(page, 'es', 'El Bañuelo')
  await expect(page).toHaveURL(/lang=en/)
  await expect(page.locator('.drawer-lede')).toHaveText(presentation.general_description.en)
  await expect(page.getByText(translations.features['water.banuelo'].context_1492)).toBeVisible()
  await expect(page.locator('.language-fallback')).toHaveCount(0)
  await switchLanguageAndReopen(page, 'en', 'El Bañuelo')
  await expect(page.locator('.drawer-lede')).toHaveText(presentation.general_description.es)
  await expect(page.getByText(/El baño atendía a un sector densamente poblado/)).toBeVisible()
})

test('shows English introductions on all six previously translated drawers', async ({ page }) => {
  for (const id of [
    'gate.bib-rambla', 'route.zacatin-axis', 'commerce.alcaiceria',
    'religious.madraza-yusufiyya', 'religious.medina-great-mosque', 'walls.medina-lower',
  ]) {
    const presentation = presentations.presentations.find(({ entity_id }) => entity_id === id)!
    await page.goto(`?feature=${id}&lang=en`)
    await expect(page.locator('.drawer-lede')).toHaveText(presentation.general_description.en)
    await expect(page.locator('.language-fallback')).toHaveCount(0)
  }
})

test('labels the Spanish full-record fallback while showing an English introduction', async ({ page }) => {
  const presentation = presentations.presentations.find(({ entity_id }) => entity_id === 'gate.monaita')!
  await page.goto('?feature=gate.monaita&lang=en')
  await expect(page.locator('.drawer-lede')).toHaveText(presentation.general_description.en)
  await expect(page.getByText('This historical record is currently available in Spanish.')).toBeVisible()
  await switchLanguageAndReopen(page, 'en', 'Puerta Monaita')
  await expect(page.locator('.drawer-lede')).toHaveText(presentation.general_description.es)
  await expect(page.locator('.language-fallback')).toHaveCount(0)
})
