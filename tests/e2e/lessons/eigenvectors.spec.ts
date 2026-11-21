import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/eigenvectors'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('the lesson loads without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eigenvectors and eigenvalues')
  await expect(step(page, 6)).toBeVisible()
  expect(errors).toEqual([])
})

test('dragging v round the circle changes Av', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(s.getByText(/at 0°\./)).toBeVisible()
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 30, y - 60, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByText(/at 0°\./)).toHaveCount(0)
})

test('v can be turned with the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowUp')
  await expect(s.getByText(/at 0°\./)).toHaveCount(0)
  // The slider works by keyboard too.
  await s.getByRole('slider').focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByRole('slider')).not.toHaveValue('0')
})

test('the angle slider finds an eigenvector', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('slider').fill('45')
  await expect(s.getByText(/v is an eigenvector, eigenvalue 3/)).toBeVisible()
  await s.getByLabel('Show eigen directions').check()
  await expect(s.getByText(/Two eigen directions/)).toBeVisible()
})

test('sweep pauses on eigen directions', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('button', { name: 'Sweep v around' }).click()
  await expect(s.getByText(/v is an eigenvector, eigenvalue 3/)).toBeVisible({ timeout: 4000 })
  await s.getByRole('button', { name: 'Stop' }).click()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Showing v only/)).toBeVisible()
  await s.getByLabel(/does not change lengths/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/Keeping lengths is not keeping direction/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/None\. Every vector/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
  await expect(s.getByText(/no direction stayed on its line/)).toBeVisible({ timeout: 6000 })
})

test('PCA: principal directions follow the data', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByRole('button', { name: '3 · Principal directions' }).click()
  await expect(s.getByText(/PC1 points along/)).toBeVisible()
  const before = await s.getByLabel('Output').textContent()
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(s.getByLabel('Output')).not.toHaveText(before!)
  await s.getByLabel(/Keep only PC1/).check()
  await expect(s.getByText(/one number per point instead of two/)).toBeVisible()
  await s.getByRole('button', { name: 'New random cloud' }).click()
  await expect(s.getByText(/PC1 points along/)).toBeVisible()
})

test('a practice challenge ticks itself from the live matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('A row 1, column 1').fill('2')
  await s.getByLabel('A row 2, column 2').fill('-1')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await expect(s.getByText(/eigenvalues add up to\s+the trace/)).toBeVisible()
})

test('no sideways scrolling on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})
