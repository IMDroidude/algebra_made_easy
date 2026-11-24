import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const LESSON = '/#/lessons/distance-and-similarity'

const section = (page: Page, id: string) => page.locator(`section[aria-labelledby="${id}"]`)
const step = (page: Page, n: number) => section(page, `step-${n}`)
const readout = (s: Locator) => s.locator('[aria-live]').first()

async function press(page: Page, key: string, times: number) {
  for (let k = 0; k < times; k++) await page.keyboard.press(key)
}

test('the lesson renders all six steps and its extra sections', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Distance and similarity: choosing a measure')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  await expect(section(page, 'baskets-heading')).toBeVisible()
  await expect(section(page, 'ratings-heading')).toBeVisible()
})

test('moving B by keyboard changes all three distances and the NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(readout(s)).toContainText('Euclidean 4.47, Manhattan 6, Chebyshev 4')
  // B = (6, 4) → (6, 2): directly beside A = (2, 2), so all three agree.
  await s.locator('.mafs-movable-point').nth(1).focus()
  await press(page, 'ArrowDown', 2)
  await expect(readout(s)).toContainText('B = (6, 2)')
  await expect(readout(s)).toContainText('Euclidean 4, Manhattan 4, Chebyshev 4')
  await expect(step(page, 4).getByLabel('Output')).toHaveText('4.0\n4.0\n4.0')
})

test('a longer article flips the nearest document by distance only', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(readout(s)).toContainText('The two measures agree.')
  await s.getByLabel('length of B').fill('6')
  await expect(readout(s)).toContainText('The two measures disagree')
  await expect(s.getByLabel('Output')).toHaveText('A-B  distance 11.18  cosine 1.000\nA-C  distance 2.83  cosine 0.200')
})

test('a bigger shop inflates matching but not Jaccard', async ({ page }) => {
  await page.goto(LESSON)
  const s = section(page, 'baskets-heading')
  await s.getByRole('button', { name: '10,000' }).click()
  await expect(readout(s)).toContainText('a share of 0.9997')
  await expect(readout(s)).toContainText('Jaccard similarity 2 ÷ 5 = 0.400')
})

test('practice goals are ticked by the live point, and the quiz gives feedback', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 3 solved')).toBeVisible()
  // B = (5, 3) → (5, 4): an exact diagonal from A = (2, 1).
  await s.locator('.mafs-movable-point').first().focus()
  await press(page, 'ArrowUp', 1)
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  // → (6, 3): three times A, same direction and far away.
  await press(page, 'ArrowRight', 1)
  await press(page, 'ArrowDown', 1)
  await expect(s.getByText('2 of 3 solved')).toBeVisible()
  await s.getByRole('combobox', { name: /warehouse robot/ }).selectOption('Manhattan')
  await expect(s.getByText('1 of 7 matched')).toBeVisible()
})

test('no horizontal scrolling at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
