import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/scalars-and-vectors'

const section = (page: Page, id: string) => page.locator(`section[aria-labelledby="${id}"]`)

test('the three going-further sections render after the practice step', async ({ page }) => {
  await page.goto(LESSON)
  for (const id of ['kinds-of-vector', 'transformations-and-projections', 'dot-and-cross']) {
    await expect(section(page, id)).toBeVisible()
  }
})

test('kinds: moving v with the keyboard updates the unit vector', async ({ page }) => {
  await page.goto(LESSON)
  const s = section(page, 'kinds-of-vector')
  const readout = s.locator('[aria-live]').first()
  await expect(readout).toContainText('v = (3, 4) has length 5')
  await s.locator('.mafs-movable-point').first().focus()
  for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowDown')
  await expect(readout).toContainText('v = (3, 0) has length 3')
  await expect(readout).toContainText('û = (1, 0)')
  await expect(s.getByLabel('Output')).toContainText('[1. 0.]')
})

test('kinds: emptying the basket gives the zero vector', async ({ page }) => {
  await page.goto(LESSON)
  const s = section(page, 'kinds-of-vector')
  await expect(s.getByText('75% are zeros')).toBeVisible()
  await s.getByRole('button', { name: 'Empty the basket' }).click()
  await expect(s.getByText('an empty basket is the zero vector')).toBeVisible()
  await s.getByRole('button', { name: /^tea:/ }).click()
  await expect(s.getByText('Sparse storage keeps only tea: 1.')).toBeVisible()
})

test('transformations: the rotation slider works by keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = section(page, 'transformations-and-projections')
  await expect(s.getByText('p′ = (-1, 3)')).toBeVisible()
  await s.getByRole('slider', { name: 'angle' }).focus()
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight')
  await expect(s.locator('[aria-live]')).toContainText('Turning by 180°')
  await expect(s.locator('[aria-live]')).toContainText('p′ = (-3, -1)')
  await expect(s.getByLabel('Output')).toContainText('[-3. -1.]')
})

test('projection: turning the line towards 35° keeps almost all the spread', async ({ page }) => {
  await page.goto(LESSON)
  const s = section(page, 'transformations-and-projections')
  await s.getByRole('button', { name: 'Project' }).click()
  await expect(s.locator('[aria-live]')).toContainText('this line keeps 64% of the spread')
  await s.getByRole('slider', { name: 'line angle' }).focus()
  for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowRight')
  await expect(s.locator('[aria-live]')).toContainText('Line at 35°')
  await expect(s.locator('[aria-live]')).toContainText('this line keeps 99% of the spread')
  await s.getByLabel('Show the line PCA would pick').check()
  await expect(s.locator('[aria-live]')).toContainText('at 36.5°')
})

test('products: moving b clockwise of a flips the cross product', async ({ page }) => {
  await page.goto(LESSON)
  const s = section(page, 'dot-and-cross')
  const readout = s.locator('[aria-live]')
  await expect(readout).toContainText('a × b = (0, 0, 6)')
  await s.locator('.mafs-movable-point').nth(1).focus()
  for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowDown')
  await expect(readout).toContainText('b = (1, -2, 0)')
  await expect(readout).toContainText('a × b = (0, 0, -6)')
  await expect(readout).toContainText('straight down into the floor')
  await expect(s.getByLabel('Output')).toContainText('[ 0  0 -6]')
})

test('no horizontal page scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(LESSON)
  await section(page, 'dot-and-cross').scrollIntoViewIfNeeded()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
