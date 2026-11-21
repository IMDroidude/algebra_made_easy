import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/variables-and-equations'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('the lesson renders with its title and six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Variables and equations')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('a one-sided move tips the scale; the same move on both sides solves it', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('Step 2: amount').fill('5')
  await s.getByRole('button', { name: 'Subtract 5 from the left side only' }).click()
  await expect(s.getByText(/The scale has tipped: the right side is heavier/)).toBeVisible()
  await expect(s.getByText('tipped!')).toBeVisible()
  await s.getByRole('button', { name: 'Undo' }).click()
  await s.getByRole('button', { name: 'Subtract 5 from both sides' }).click()
  await expect(s.getByText(/Solved: x = 7/)).toBeVisible()
  await expect(step(page, 4).getByLabel('Output', { exact: true })).toHaveText('7.0\n[7.]')
})

test('the solver works by keyboard alone', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('button', { name: '3x = 15' }).focus()
  await page.keyboard.press('Enter')
  await s.getByRole('button', { name: /Divide$/ }).focus()
  await page.keyboard.press('Enter')
  await s.getByLabel('Step 2: amount').focus()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await s.getByRole('button', { name: 'Divide both sides by 3' }).focus()
  await page.keyboard.press('Enter')
  await expect(s.getByText(/Solved: x = 5/)).toBeVisible()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to apply the move/)).toBeVisible()
  await s.getByLabel(/The scale tips/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/can never tip the scale/)).toBeVisible()
  await expect(s.getByText(/After subtracting 3 from both sides: 3x − 3 = 12/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/Still level/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('training steps move w towards 2.5', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  for (let k = 0; k < 3; k++) await s.getByRole('button', { name: 'Take a training step' }).click()
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('2.488')
  await expect(s.locator('pre code')).toContainText('for step in range(3):')
})

test('practice challenges tick from the live equation', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByRole('button', { name: '2x − 6 = 8' }).click()
  await s.getByRole('button', { name: /Add$/ }).click()
  await s.getByLabel('Practice: amount').fill('6')
  await s.getByRole('button', { name: 'Add 6 to both sides' }).click()
  await s.getByRole('button', { name: /Divide$/ }).click()
  await s.getByLabel('Practice: amount').fill('2')
  await s.getByRole('button', { name: 'Divide both sides by 2' }).click()
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
  await expect(s.getByText(/pops all six balloons/)).toBeVisible()
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(LESSON)
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})
