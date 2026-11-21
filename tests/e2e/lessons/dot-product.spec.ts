import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const LESSON = '/#/lessons/dot-product'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const readout = (s: Locator) => s.locator('[aria-live]').first()

async function press(page: Page, key: string, times: number) {
  for (let k = 0; k < times; k++) await page.keyboard.press(key)
}

test('the lesson renders all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dot product, length and cosine similarity')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('dragging b changes the dot product and the NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(readout(s)).toContainText('a · b = 11, positive')
  const handle = s.locator('.mafs-movable-point').nth(1)
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  // Far to the left and down: b ends up pointing away from a.
  await page.mouse.move(x - 160, y + 120, { steps: 10 })
  await page.mouse.up()
  await expect(readout(s)).toContainText('negative')
  await expect(step(page, 4).getByLabel('Output')).not.toHaveText('11\n4.12 3.61\n0.740')
})

test('b can be moved by keyboard to a right angle with a', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').nth(1).focus()
  // b = (2, 3) → (−0.5, 2), and (4, 1) · (−0.5, 2) = 0.
  await press(page, 'ArrowLeft', 5)
  await press(page, 'ArrowDown', 2)
  await expect(readout(s)).toContainText('b = (-0.5, 2)')
  await expect(readout(s)).toContainText('a · b = 0, zero')
  await expect(step(page, 4).getByLabel('Output')).toHaveText('0.0\n4.12 2.06\n0.000')
})

test('a zero-length vector is explained, not shown as NaN', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').nth(1).focus()
  await press(page, 'ArrowLeft', 4)
  await press(page, 'ArrowDown', 6)
  await expect(readout(s)).toContainText('no direction')
  await expect(step(page, 4).getByLabel('Output')).toHaveText('0\n4.12 0.00\nnan')
  await expect(step(page, 4).getByText(/invalid value encountered/)).toBeVisible()
  await expect(page.getByText(/NaN/)).toHaveCount(0)
  expect(await page.locator('svg').evaluateAll((els) => els.some((e) => e.innerHTML.includes('NaN')))).toBe(false)
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(readout(s)).toContainText('stay hidden')
  await s.getByLabel('The vector (−3, 3)').check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/never a vector/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel('0', { exact: true }).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
  await expect(readout(s)).toContainText('a · b = 0.')
})

test('similarity search re-ranks when the query moves', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output')).toHaveText(
    '1.000  Pet-friendly cafes\n0.923  What do cats eat?\n0.894  Puppy training tips',
  )
  // The query is the last draggable on this plane; move it up towards the pasta document.
  await s.locator('.mafs-movable-point').last().focus()
  await press(page, 'ArrowLeft', 5)
  await press(page, 'ArrowUp', 4)
  await expect(s.getByLabel('Output')).toContainText('Quick pasta recipes')
  await expect(s.locator('tbody tr').first()).toContainText('Quick pasta recipes')
})

test('ranking by raw dot product favours long vectors', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByLabel(/Rank by raw dot product/).check()
  await expect(s.getByLabel('Output')).toHaveText(
    '13.000  Puppy training tips\n12.000  What do cats eat?\n9.500  Quick pasta recipes',
  )
  await expect(s.locator('pre code')).toContainText('scores = docs @ q   # raw dot products')
})

test('documents become draggable on request', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.locator('.mafs-movable-point')).toHaveCount(1)
  await s.getByLabel(/move the documents/).check()
  await expect(s.locator('.mafs-movable-point')).toHaveCount(6)
})

test('challenges are ticked by the live vector', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.locator('.mafs-movable-point').first().focus()
  // w = (3, 2) → (1, 2): perpendicular to u = (2, −1).
  await press(page, 'ArrowLeft', 4)
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  // → (3, 1): shadow ends at u's tip.
  await press(page, 'ArrowRight', 4)
  await press(page, 'ArrowDown', 2)
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
})

test('no horizontal scrolling at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('the running example predicts house prices with a dot product', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: 'A price model is a dot product' })
  await box.scrollIntoViewIfNeeded()
  await expect(box.getByRole('row', { name: /Corner house/ })).toContainText('375')
  await expect(box.getByLabel('Output')).toHaveText(
    '[262. 375. 243. 448. 332. 411. 564. 200.]\n[ 3. -5.  5. -8.  3.  7. -4.  5.]',
  )
  await box.getByRole('link', { name: 'lesson 5.1' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projection and least squares')
})
