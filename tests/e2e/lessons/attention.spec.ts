import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/attention'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('the lesson renders with all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Capstone: attention')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('clicking a heat-map cell selects that query and key', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('button', { name: 'q3 fen · k2 zorp = 1' }).click()
  await expect(s.getByText(/Selected cell: q3 · k2 = 1\./)).toBeVisible()
  await expect(s.getByText(/Highest: k3 \(fen\)/)).toBeVisible()
})

test('moving the query with the keyboard updates scores everywhere', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  // The query handle is drawn last. q1 = (1, 1.5) → (1.5, 1.5)
  await s.locator('.mafs-movable-point').last().focus()
  await page.keyboard.press('ArrowRight')
  // q1·k1 = 1.5·2 = 3
  await expect(s.getByRole('button', { name: 'q1 blip · k1 blip = 3' })).toBeVisible()
  await expect(step(page, 4).locator('pre code')).toContainText('[[1.5, 1.5]')
})

test('dragging a key changes its scores', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 120, y - 60, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByRole('button', { name: 'q1 blip · k1 blip = 2' })).toHaveCount(0)
})

test('prediction: k3 turns only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Weights: 0.92, 0.03, 0.05. Lock in/)).toBeVisible()
  await s.getByLabel(/takes most of the attention/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
  await expect(s.getByText(/k3 is at \(2, 1\)\. Scores: 3.5, -1.5, 5\. Weights: 0.26, 0.01, 0.74\./)).toBeVisible()
})

test('temperature slider sharpens the weights and rewrites the code', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[ 1.41  2.12 -1.59]\n[0.32 0.66 0.02]')
  await s.getByRole('slider').focus()
  await page.keyboard.press('Home')
  await expect(s.locator('pre code')).toContainText('scores = Q @ K.T / T')
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[ 8. 12. -9.]\n[0.02 0.98 0.  ]')
})

test('zero-query prediction sends the output to the plain average', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[[-0.33  1.61]\n [ 1.89  1.  ]\n [-0.29 -0.12]]')
  await s.getByLabel(/At the origin/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/plain average of the three values\./).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/= \(0.33, 0.33\)\. The plain average of the values is \(0.33, 0.33\)\./)).toBeVisible()
})

test('practice: a zero query makes attention uniform', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 3 solved')).toBeVisible()
  // q1 = (1, 0.5) is the last handle; move it to (0, 0) by keyboard.
  await s.locator('.mafs-movable-point').last().focus()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowDown')
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  await expect(s.getByText(/All three scores are equal/)).toBeVisible()
})
