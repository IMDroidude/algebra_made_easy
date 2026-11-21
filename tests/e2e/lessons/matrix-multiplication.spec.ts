import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const LESSON = '/#/lessons/matrix-multiplication'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const readout = (s: Locator) => s.locator('[aria-live]').first()

test('the lesson renders all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matrix multiplication')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('swapping the order gives a different product', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(readout(s)).toContainText('single matrix AB, with rows (0, -1) and (1, 1)')
  await s.getByRole('button', { name: 'BA: A first, then B' }).click()
  await expect(s.getByRole('button', { name: 'BA: A first, then B' })).toHaveAttribute('aria-pressed', 'true')
  await expect(readout(s)).toContainText('Done: A first, then B.')
  await expect(readout(s)).toContainText('single matrix BA, with rows (1, -1) and (1, 0)')
})

test('the animation can be scrubbed by keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const slider = s.getByRole('slider')
  await slider.focus()
  await page.keyboard.press('Home')
  await expect(readout(s)).toContainText('Nothing has been applied yet.')
  for (let k = 0; k < 10; k++) await page.keyboard.press('ArrowRight')
  await expect(readout(s)).toContainText('B is done; A comes next.')
})

test('typing into A updates the product, the equation and the NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  await step(page, 2).getByLabel('A row 1, column 1').fill('2')
  const s = step(page, 4)
  await expect(s.getByLabel('Output')).toHaveText('[[2 1]\n [1 1]]\n[[ 3 -1]\n [ 1  0]]')
  await s.getByRole('button', { name: 'Row 2, column 1' }).click()
  await expect(readout(s)).toContainText('B sends î to (1, 0)')
  await expect(readout(s)).toContainText('row 2 of that column, is 1')
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(readout(s)).toContainText('unmoved')
  await s.getByLabel(/In the same place/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/transformations do\s+not/)).toBeVisible()
  await expect(readout(s)).toContainText('AB (solid) has rows (0, 1), (1, 0)')
  await s.getByRole('button', { name: /try again/i }).click()
  await expect(readout(s)).toContainText('unmoved')
  await s.getByLabel(/across different lines/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('a ReLU between the layers stops them collapsing into one matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output')).toHaveText(
    '[[ 3.5  0.5]\n [-0.5  3.5]\n [-3.5 -0.5]\n [ 0.5 -3.5]]\nTrue',
  )
  await s.getByLabel(/Put a ReLU/).check()
  await expect(s.getByLabel('Output')).toHaveText(
    '[[ 3.   1.5]\n [-0.5  3.5]\n [-0.5  1. ]\n [ 0.   0. ]]\nFalse',
  )
  await expect(readout(s)).toContainText('3 of 4 outputs differ from W x')
})

test('challenges are ticked by the live matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 3 solved')).toBeVisible()
  // B = [[0, −0.5], [2, 0]], typed in an order that never passes a diagonal B.
  await s.getByLabel('B row 1, column 2').fill('-0.5')
  await s.getByLabel('B row 2, column 1').fill('2')
  await s.getByLabel('B row 1, column 1').fill('0')
  await s.getByLabel('B row 2, column 2').fill('0')
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  await expect(readout(s)).toContainText('AB has rows (0, -1) and (1, 0)')
})

test('no horizontal scrolling at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('running example: two steps on the houses are one matrix, and order matters', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: 'Two steps on the houses, one matrix' })
  await expect(box).toBeVisible()
  await expect(box.getByText(/the space score is 169\.35 either way/)).toBeVisible()
  await expect(box.getByRole('row', { name: /Corner house/ })).toContainText('142.14')
  await expect(box.getByLabel('Output')).toHaveText('[169.35    3.     -3.107]\n[169.35    3.     -3.107]\n[142.137   3.     -3.107]')
  for (let n = 1; n <= 6; n++) await expect(page.locator(`section[aria-labelledby="step-${n}"]`)).toBeVisible()
})
