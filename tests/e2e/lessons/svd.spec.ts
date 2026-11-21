import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/svd'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('the lesson loads without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Singular value decomposition')
  await expect(step(page, 6)).toBeVisible()
  expect(errors).toEqual([])
})

test('the three steps play in order', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(s.getByText(/^Start: the unit circle/)).toBeVisible()
  await s.getByRole('button', { name: 'Next step' }).click()
  await expect(s.getByText(/After step 1 \(Vᵀ\)/)).toBeVisible({ timeout: 4000 })
  await s.getByRole('button', { name: 'Next step' }).click()
  await expect(s.getByText(/After step 2 \(Σ\)/)).toBeVisible({ timeout: 4000 })
  await s.getByRole('button', { name: 'Back to the circle' }).click()
  await s.getByRole('button', { name: 'Play all three steps' }).click()
  await expect(s.getByText(/After step 3 \(U\)/)).toBeVisible({ timeout: 8000 })
})

test('the progress slider works by keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const slider = s.getByRole('slider')
  await slider.focus()
  await page.keyboard.press('End')
  await expect(s.getByText(/After step 3 \(U\)/)).toBeVisible()
})

test('editing the matrix updates the factors and the NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  await step(page, 2).getByLabel('A row 1, column 2').fill('0')
  // A = [[2, 0], [0, 1]]: already diagonal
  await expect(step(page, 2).getByText(/Vᵀ does not turn at all/)).toBeVisible()
  await expect(step(page, 4).getByLabel('Output')).toHaveText('[2. 1.]\nTrue')
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to apply it/)).toBeVisible()
  await s.getByLabel(/stays a circle/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/tilted ellipse/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
  await expect(s.getByText(/semi-axes 1\.62 and 0\.62/)).toBeVisible({ timeout: 4000 })
})

test('image compression: the k slider trades storage for error', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByRole('img', { name: /rebuilt from the 4 largest/ })).toBeVisible()
  const slider = s.getByRole('slider')
  await slider.fill('1')
  await expect(s.getByLabel('Output')).toContainText('65 numbers instead of 1024\nerror: 20.6%')
  await slider.fill('15')
  await expect(s.getByLabel('Output')).toContainText('error: 0.0%')
})

test('a practice challenge ticks itself from the live matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('A row 1, column 1').fill('0')
  await s.getByLabel('A row 1, column 2').fill('2')
  await s.getByLabel('A row 2, column 1').fill('1')
  await s.getByLabel('A row 2, column 2').fill('0')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await expect(s.getByText(/singular values ignore the flip/)).toBeVisible()
})

test('no sideways scrolling on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})

test('the running example applies the lesson to the house dataset', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: 'How many ideas are in the house table?' })
  await box.scrollIntoViewIfNeeded()
  await expect(box.getByText('Running example · the house dataset')).toBeVisible()
  await expect(box.getByText(/The singular values are 4\.03, 2\.74, 0\.5\./)).toBeVisible()
  await expect(box.getByText(/rank 2 stores 20,008 numbers/)).toBeVisible()
  await expect(box.getByLabel('Output')).toContainText('[4.03 2.74 0.5 ]')
  // It sits between the Apply step and the Practice step.
  const order = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('section[aria-labelledby]')].map((s) => s.getAttribute('aria-labelledby'))
    return ids.indexOf('running-example') - ids.indexOf('step-5')
  })
  expect(order).toBe(1)
})
