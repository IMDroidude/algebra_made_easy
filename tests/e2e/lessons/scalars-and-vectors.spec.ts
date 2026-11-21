import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/scalars-and-vectors'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const press = async (page: Page, key: string, times: number) => {
  for (let i = 0; i < times; i++) await page.keyboard.press(key)
}

test('the lesson renders all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vector arithmetic')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('dragging w in step 1 updates its numbers', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 1)
  const readout = s.locator('[aria-live]')
  await expect(readout).toContainText('w = (3, 2):')
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 120, y + 40, { steps: 8 })
  await page.mouse.up()
  await expect(readout).not.toContainText('w = (3, 2):')
})

test('the same vector can be drawn from another start point', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 1)
  await s.getByLabel(/different starting point/).check()
  await expect(s.getByText('Drawn from the start point (-4, 1), the same w ends at (-1, 3).')).toBeVisible()
})

test('u can be moved with the keyboard and the sum follows', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText(/u \+ v = \(1.5, 3\)/)).toBeVisible()
})

test('the k slider works by keyboard and step 4 code follows', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('button', { name: 'Scale: k · u' }).click()
  await s.getByRole('slider', { name: 'k' }).focus()
  await press(page, 'ArrowLeft', 4) // 2 -> 0
  await expect(s.getByText(/Multiplying by 0 shrinks any arrow/)).toBeVisible()
  await press(page, 'ArrowLeft', 2) // -> -1
  await expect(s.getByText(/flips the arrow/)).toBeVisible()
  await expect(step(page, 4).getByLabel('Output')).toHaveText('[1 3]\n[ 3 -1]\n[-2 -1]')
})

test('subtraction is drawn between the tips', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('button', { name: 'Subtract: u − v' }).click()
  await expect(s.getByText(/u − v = \(3, -1\), drawn from the tip of v to the tip of u/)).toBeVisible()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to draw/)).toBeVisible()
  await s.getByLabel('From the tip of u to the tip of v.').check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/u − v = \(2, -2\): from the tip of v/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel('From the tip of v to the tip of u.').check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('word points show their coordinates on hover', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output')).toHaveText('[4.5 3.5]')
  await s.locator('.mafs-movable-point').first().focus()
  await expect(s.locator('.coord-tooltip')).toContainText('x = ')
})

test('a practice challenge is solved with the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  // u starts at (1, -2), v at (-2, 1); move u to (-1, 1) so u + v = (-3, 2)
  await s.locator('.mafs-movable-point').first().focus()
  await press(page, 'ArrowLeft', 4)
  await press(page, 'ArrowUp', 6)
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})

test('the running example does vector arithmetic on the houses', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: 'Houses are vectors too' })
  await box.scrollIntoViewIfNeeded()
  await expect(box).toContainText('400 sqft bigger, 1 more bedroom, and 3 km closer')
  await expect(box.getByLabel('Output')).toHaveText('[400   1  -3]\n[2200    4   16]\n[1500.       2.625    7.5  ]')
  // it sits between Apply and Practice, and the six steps stay intact
  const order = await page.locator('section[aria-labelledby]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-labelledby')))
  expect(order.indexOf('running-example')).toBe(order.indexOf('step-5') + 1)
  expect(order.indexOf('step-6')).toBe(order.indexOf('running-example') + 1)
})
