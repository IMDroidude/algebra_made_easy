import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/determinant'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('lesson renders with its title', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Determinant')
})

test('a basis vector can be moved with the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByLabel('A row 1, column 1')).toHaveValue('1.5')
  await expect(s.getByText(/Determinant 1\.5/)).toBeVisible()
})

test('dragging a basis vector changes the determinant', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 60, y, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByLabel('A row 1, column 1')).not.toHaveValue('1')
})

test('flip and collapse are described in words', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('A row 1, column 1').fill('-1')
  await expect(s.getByText(/Determinant -1/)).toBeVisible()
  await expect(s.getByText(/reads backwards, like a mirror image/)).toBeVisible()
  await s.getByLabel('A row 1, column 1').fill('0')
  await expect(s.getByText(/Determinant 0, treated as singular/)).toBeVisible()
  await s.getByLabel('A row 2, column 2').fill('0')
  await expect(s.getByText(/collapsed to a single point/)).toBeVisible()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to swap the columns/)).toBeVisible()
  await s.getByLabel(/same two arrows/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/Determinant -2\. /)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/plane is flipped over/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('box picture and NumPy output follow the arrows', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('5')
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowLeft')
  // î = (2.5, 1), ĵ = (1, 2): 2.5·2 − 1·1 = 4
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('4.0')
  await expect(s.getByText(/leaves the parallelogram: 4\./)).toBeVisible()
})

test('a singular layer has a second input with the same output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByText(/x′ = \(-1, 2\) lands on the same output/)).toBeVisible()
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[3.  1.5]\n[3.  1.5]')
  await s.getByLabel('W row 2, column 2').fill('2')
  await expect(s.getByText(/No other input lands on/)).toBeVisible()
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[3.  2.5]')
})

test('challenges are ticked by the live matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  for (const [label, v] of [
    ['A row 1, column 1', '2'],
    ['A row 1, column 2', '2'],
    ['A row 2, column 1', '-2'],
    ['A row 2, column 2', '2'],
  ]) await s.getByLabel(label).fill(v)
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await expect(s.getByText(/four times as much/)).toBeVisible()
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(sw).toBeLessThanOrEqual(390)
})

const HOUSE_TITLE = 'A feature transform that loses houses'

test('running example: det 0 merges houses, det 1 keeps them apart', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: HOUSE_TITLE })
  const readout = box.getByTestId('house-det')
  await expect(readout).toHaveText('det T = 0. 3 pairs of houses land on the same output: A and C, B and E, D and F.')
  await expect(box.getByRole('row', { name: /Garden flat/ })).toContainText('(700, 1400)')
  await expect(box.getByLabel('Output')).toHaveText('0.0\n[ 700 1400]\n[ 700 1400]')
  await box.getByRole('button', { name: /^S:/ }).click()
  await expect(readout).toHaveText('det S = 1. All 8 houses land on different outputs.')
  await expect(box.getByLabel('Output')).toHaveText('1.0\n[700   2]\n[700   1]')
  for (let n = 1; n <= 6; n++) await expect(page.locator(`section[aria-labelledby="step-${n}"]`)).toBeVisible()
})
