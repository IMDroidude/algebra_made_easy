import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/lines-slope-intercept'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('the lesson renders all six steps without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lines: slope, intercept and boundaries')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  expect(errors).toEqual([])
})

test('the slope slider works by keyboard and updates the readout', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('slope m slider').focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByLabel('slope m', { exact: true })).toHaveValue('0.75')
  await expect(s.getByText('the line goes up 0.75')).toBeVisible()
  await expect(s.getByText('rise 1.5 ÷ run 2')).toBeVisible()
})

test('a negative slope reads as downhill', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('slope m', { exact: true }).fill('-1')
  await expect(s.getByText('the line goes down 1')).toBeVisible()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to change the slope/)).toBeVisible()
  await s.getByLabel(/slides down/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/Sliding up or down is the job of/)).toBeVisible()
  await expect(s.getByText(/Now showing y = -2x \+ 1/)).toBeVisible()

  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/tilts the other way/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('dragging Q changes the slope, the equation and the NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('0.5 -1.5')
  const handle = s.locator('.mafs-movable-point').nth(1)
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x, y - 80, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByLabel('Output', { exact: true })).not.toHaveText('0.5 -1.5')
})

test('Q moves by keyboard; a vertical pair is explained', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  const q = s.locator('.mafs-movable-point').nth(1)
  await q.focus()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  // P = (-1, -2), Q = (3, 1): rise 3 over run 4
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('0.75 -1.25')
  for (let k = 0; k < 8; k++) await page.keyboard.press('ArrowLeft')
  await expect(s.getByText(/the line is vertical/)).toBeVisible()
})

test('the neuron input moves along the x-axis', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.locator('.mafs-movable-point').focus()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowUp')
  // x = 1.5 (up does nothing: the input stays on the axis); y = 1.5 · 1.5 + 0.5 = 2.75
  await expect(s.getByText('Input x = 1.5')).toBeVisible()
  await expect(s.getByLabel('Output', { exact: true })).toContainText('2.75')
})

test('practice challenges tick from the live line', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('practice slope m', { exact: true }).fill('0.5')
  await s.getByLabel('practice intercept b', { exact: true }).fill('0.5')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()

  await s.getByRole('button', { name: 'Downhill' }).click()
  await s.getByLabel('practice slope m', { exact: true }).fill('-0.75')
  await s.getByLabel('practice intercept b', { exact: true }).fill('1.25')
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('0.3125')
})

test('no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})

test('the boundary section: tilt the line until no fruit is on the wrong side', async ({ page }) => {
  await page.goto(LESSON)
  const s = page.locator('section[aria-labelledby="boundary-heading"]')
  await expect(s.getByText('2 on the wrong side', { exact: true })).toBeVisible()
  await expect(s.locator('[data-wrong]')).toHaveCount(2)
  await s.getByLabel('boundary slope m slider').focus()
  for (let k = 0; k < 2; k++) await page.keyboard.press('ArrowRight')
  await s.getByLabel('boundary intercept b', { exact: true }).fill('2.5')
  await expect(s.getByText(/No fruit on the wrong side/)).toBeVisible()
  await expect(s.locator('[data-wrong]')).toHaveCount(0)
  await expect(s.getByLabel('Output', { exact: true })).toContainText('[ True  True  True  True  True False False False False False]')
  await expect(s.getByLabel('Output', { exact: true })).toContainText('0 on the wrong side')
})

test('practice: the two groups are split with 0 mistakes', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await s.getByRole('button', { name: 'Two groups' }).click()
  await expect(s.getByText(/Mistakes = 4/)).toBeVisible()
  await s.getByLabel('practice slope m', { exact: true }).fill('-0.5')
  await s.getByLabel('practice intercept b', { exact: true }).fill('0')
  await expect(s.getByText(/Mistakes = 0/)).toBeVisible()
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await expect(s.getByText(/the line has to slope downhill/)).toBeVisible()
})
