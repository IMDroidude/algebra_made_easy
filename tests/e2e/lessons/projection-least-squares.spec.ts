import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/projection-least-squares'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

async function press(page: Page, key: string, times: number) {
  for (let k = 0; k < times; k++) await page.keyboard.press(key)
}

test('lesson renders with all six steps and no errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projection and least squares')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  expect(errors).toEqual([])
})

test('dragging your line changes its error', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(s.getByText(/sum of squared residuals 17.75/)).toBeVisible()
  const handle = s.locator('.mafs-movable-point').last()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 - 80, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByText(/sum of squared residuals 17.75/)).toHaveCount(0)
  // The handle only moves vertically: the line still passes x = 4.
  await expect(s.getByText(/Your line/).first()).toBeVisible()
})

test('the outlier prediction animates the line to y = −1', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await s.getByLabel(/tilts a long way/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
  await expect(s.getByText(/Best line now: y = −1\./)).toBeVisible({ timeout: 4000 })
})

test('moving a data point with the keyboard refits the line and the NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await s.locator('.mafs-movable-point').first().focus()
  await press(page, 'ArrowUp', 1)
  // (-4, -2.5) -> (-4, -2): XᵀX unchanged, Xᵀy = [24, 1]
  await expect(s.getByLabel('Output')).toContainText('[24.  1.]')
  await expect(s.getByText(/residuals add up to 0, and x · residuals = 0/)).toBeVisible()
})

test('the query point moves along the x-axis', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.locator('.mafs-movable-point').last().focus()
  await press(page, 'ArrowRight', 1)
  await press(page, 'ArrowUp', 1)
  await expect(s.getByText(/new input x = 3 the model predicts/)).toBeVisible()
  await expect(s.getByLabel('Output')).toHaveText('2.2')
})

test('practice: flatten the trend with the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  const points = s.locator('.mafs-movable-point')
  await points.nth(2).focus()
  await press(page, 'ArrowUp', 6) // (1, -1) -> (1, 2)
  await points.nth(3).focus()
  await press(page, 'ArrowUp', 2) // (3, 0) -> (3, 1)
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await expect(s.getByText(/x tells you nothing about y/)).toBeVisible()
})
