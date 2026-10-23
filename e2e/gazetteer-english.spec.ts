import { expect, test } from '@playwright/test'
import translations from '../data/translations/gazetteer-en.json' with { type: 'json' }

test('shows ten complete English gazetteer panels without changing historical names or citations', async ({ page }) => {
  for (const [id, translation] of Object.entries(translations.entries)) {
    await page.goto(`?feature=${id.slice(4)}&lang=en`)
    const panel = page.locator('.gazetteer-panel')
    await expect(panel.getByRole('heading', { name: 'Name and survival' })).toBeVisible()
    await expect(panel).toContainText(translation.date_note)
    await expect(panel).toContainText(translation.attestation_note)
    await expect(panel).toContainText(translation.survival_note)
    await expect(panel).toContainText(translation.notes)
    await expect(page.locator('.sources-section ol li').first()).toBeAttached()
  }
})

test('switches the Generalife evidence and preserves the untranslated-panel behavior', async ({ page }) => {
  await page.goto('?feature=royal.generalife&lang=en')
  await expect(page.locator('.gazetteer-panel')).toContainText('Yannat al-Arif')
  await expect(page.locator('.gazetteer-panel')).toContainText('There are variants of the exact historical form of the name.')
  await page.getByRole('button', { name: 'Close information panel' }).click()
  await page.getByRole('button', { name: 'Change language to Spanish' }).click()
  const search = page.getByRole('button', { name: 'Buscar en la Granada histórica' })
  if (await search.isVisible()) await search.click()
  await page.getByRole('combobox').fill('Generalife')
  await page.getByRole('combobox').press('Enter')
  await expect(page.locator('.gazetteer-panel')).toContainText('La forma histórica exacta presenta variantes.')
  await expect(page.locator('.gazetteer-panel')).toContainText('Yannat al-Arif')
  await page.goto('?feature=gate.monaita&lang=en')
  await expect(page.getByRole('heading', { name: 'Puerta Monaita' })).toBeVisible()
  await expect(page.locator('.gazetteer-panel')).toHaveCount(0)
  await page.goto('?feature=gate.monaita&lang=es')
  await expect(page.locator('.gazetteer-panel')).toBeVisible()
})
