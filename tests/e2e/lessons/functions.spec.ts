import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/functions'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('the lesson renders with its title and six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Functions')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('feeding inputs drops points and fills the table', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('button', { name: 'Feed 3 into f' }).click()
  await s.getByLabel('Input x').fill('-1')
  await s.getByRole('button', { name: 'Feed -1 into f' }).click()
  await expect(s.getByText(/2 points dropped: \(3, 7\), \(-1, -1\)/)).toBeVisible()
  await expect(s.getByRole('table')).toContainText('f(x)')
})

test('the input point can be moved along the x-axis by keyboard, and shows coordinates', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point')
  await handle.focus()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(s.getByLabel('Input x')).toHaveValue('2')
  await expect(s.getByText('Input 2 gives f(2) = 5')).toBeVisible()
  await expect(s.locator('.coord-tooltip')).toContainText('x = 2, y = 0')
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to change the rule/)).toBeVisible()
  await s.getByLabel(/Every point moves up by 1/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/The point at x = 0 has not moved/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/pivoting around the point/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('editing the rule updates table, readout and NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[-3 -2 -1  0  1  2  3]\n[-5 -3 -1  1  3  5  7]')
  await s.getByLabel('multiply by m').fill('0.5')
  await s.getByLabel('then add b').fill('-0.5')
  await expect(s.getByLabel('Output', { exact: true })).toHaveText(
    '[-3 -2 -1  0  1  2  3]\n[-2.  -1.5 -1.  -0.5  0.   0.5  1. ]',
  )
  await expect(s.locator('pre code')).toContainText('y = 0.5 * x - 0.5')
})

test('the model predictions follow w and b', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[3. 4. 5. 7.]')
  await s.getByLabel('weight w').fill('2.5')
  await s.getByLabel('bias b').fill('0.5')
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[3.   4.25 5.5  8.  ]')
})

test('practice challenges tick from the live rule', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('Practice: multiply by m').fill('0')
  await s.getByLabel('Practice: then add b').fill('4')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await s.getByLabel('Practice: multiply by m').fill('2')
  await s.getByLabel('Practice: then add b').fill('3')
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(LESSON)
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})
