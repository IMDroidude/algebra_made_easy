import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/exponents-and-roots'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const output = (page: Page, n: number) => step(page, n).getByLabel('Output', { exact: true })

test('the lesson renders all six steps without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Exponents and roots')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  expect(errors).toEqual([])
})

test('the square corner moves by keyboard and by dragging', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const corner = s.locator('.mafs-movable-point')
  await corner.focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText('area is 3² = 9')).toBeVisible()

  await corner.scrollIntoViewIfNeeded()
  const box = (await corner.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 60, y + 60, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByText('area is 3² = 9')).not.toBeVisible()
})

test('area mode finds the side with a square root', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel(/Set the area instead/).check()
  await s.getByLabel('area', { exact: true }).fill('16')
  await expect(s.getByText('side is √16 = 4')).toBeVisible()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to double the side/)).toBeVisible()
  await s.getByLabel(/It doubles/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/area grows in two directions/)).toBeVisible()
  await expect(s.getByText(/Side 4, area 16/)).toBeVisible()

  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/four times as big/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('moving x updates the readout and NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await expect(output(page, 4)).toContainText('9.0\n3.0')
  await s.locator('.mafs-movable-point').focus()
  await page.keyboard.press('ArrowRight')
  // x = -2.5
  await expect(s.getByText(/it is 6.25/)).toBeVisible()
  await expect(output(page, 4)).toContainText('6.25\n2.5')
  await s.getByLabel(/Also show y = 2ˣ/).check()
  await expect(s.getByText(/on y = 2ˣ it is 0.177/)).toBeVisible()
})

test('dragging the outlier grows the squared error faster', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(output(page, 5)).toHaveText('0.625\n0.4375')
  await s.locator('.mafs-movable-point').focus()
  for (let k = 0; k < 4; k++) await page.keyboard.press('ArrowUp')
  // last target 5 → error 3
  await expect(output(page, 5)).toHaveText('1.125\n2.4375')
})

test('the distance demo follows the embeddings', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByRole('button', { name: 'Distance between embeddings' }).click()
  await expect(output(page, 5)).toHaveText('3.605551275463989\n3.605551275463989')
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  // a = (3, 2.5), b = (-1, -0.5): Δ = (4, 3), distance 5
  await expect(output(page, 5)).toHaveText('5.0\n5.0')
})

test('practice challenges tick from the live point', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 3 solved')).toBeVisible()
  const b = s.locator('.mafs-movable-point')
  await b.focus()
  // B from (2, 1) to (2, 3): Δ = (3, 4), distance 5
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  // to (1.5, 3): Δx = 2.5, area 6.25
  await page.keyboard.press('ArrowLeft')
  await expect(s.getByText('2 of 3 solved')).toBeVisible()
})

test('no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})
