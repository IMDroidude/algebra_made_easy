import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/matrices-as-transformations'
const gallery = (page: Page) => page.locator('section[aria-labelledby="gallery"]')
const card = (page: Page, name: string) => gallery(page).getByRole('article', { name })

test('the four cards sit in a 2×2 grid on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(LESSON)
  const boxes = await Promise.all(
    ['Rotation', 'Scaling', 'Reflection', 'Shear'].map(async (n) => (await card(page, n).boundingBox())!),
  )
  expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2)
  expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width)
  expect(boxes[2].y).toBeGreaterThan(boxes[0].y + boxes[0].height)
  expect(Math.abs(boxes[2].x - boxes[0].x)).toBeLessThan(2)
})

test('cards stack on a phone, without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  const a = (await card(page, 'Rotation').boundingBox())!
  const b = (await card(page, 'Scaling').boundingBox())!
  expect(b.y).toBeGreaterThan(a.y + a.height)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('a slider changes its card, and "Try it" loads the matrix into step 2', async ({ page }) => {
  await page.goto(LESSON)
  const shear = card(page, 'Shear')
  const k = shear.getByLabel('k')
  await k.focus()
  await page.keyboard.press('ArrowRight')
  await expect(shear.getByText('î → (1, 0), ĵ → (1.25, 1). Area × 1 (determinant 1).')).toBeVisible()
  await shear.getByRole('button', { name: 'Try shear in step 2' }).click()
  const s2 = page.locator('section[aria-labelledby="step-2"]')
  await expect(s2.getByLabel('A row 1, column 2')).toHaveValue('1.25')
  await expect(s2.getByText('lands at (1.25, 1)')).toBeVisible()
  await expect(s2.getByRole('heading', { level: 2 })).toBeInViewport()
})

test('choosing a mirror line flips the square across it', async ({ page }) => {
  await page.goto(LESSON)
  const r = card(page, 'Reflection')
  await r.getByLabel('y-axis').check()
  await expect(r.getByText(/î → \(-1, 0\), ĵ → \(0, 1\)/)).toBeVisible()
})

test('the gallery NumPy follows the last card changed', async ({ page }) => {
  await page.goto(LESSON)
  const scaling = card(page, 'Scaling')
  await scaling.getByLabel('sy').focus()
  await page.keyboard.press('ArrowRight')
  await gallery(page).getByLabel(/Show the NumPy/).check()
  await expect(gallery(page).getByLabel('Output')).toHaveText('[[0.   2.   2.   0.  ]\n [0.   0.   0.75 0.75]]')
})

test('dragging P in step 4 moves P′ with the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s4 = page.locator('section[aria-labelledby="step-4"]')
  await s4.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowUp')
  await expect(s4.getByText(/P = \(2, 1.5\) is sent to P′ = \(2, 1.5\)/)).toBeVisible()
  await expect(s4.getByLabel('Output')).toHaveText('[2.  1.5]')
})

test('the running example moves all eight houses with one matrix', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: 'One matrix moves every house' })
  await box.scrollIntoViewIfNeeded()
  await expect(box.locator('[aria-live]')).toContainText('Before A: sizes run from 900 to 2400 sqft')
  await box.getByRole('button', { name: 'Apply A to every house' }).click()
  await expect(box.locator('[aria-live]')).toContainText('sizes now run from 83.61 to 222.96 m²')
  await expect(box.getByLabel('Output')).toContainText('[[102.19   2.  ]')
  await box.getByRole('button', { name: 'Back to sqft' }).click()
  await expect(box.getByRole('button', { name: 'Apply A to every house' })).toBeEnabled()
})
