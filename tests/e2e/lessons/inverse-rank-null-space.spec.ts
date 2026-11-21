import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/inverse-rank-null-space'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('lesson renders with all six steps and no errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inverse, rank, null space')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  expect(errors).toEqual([])
})

test('step 1 animates there and back', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 1)
  await s.getByRole('button', { name: /Play/ }).click()
  await expect(s.getByText(/Back exactly where it started/)).toBeVisible({ timeout: 6000 })
})

test('squeezing with the keyboard reaches "≈ 0, treated as singular"', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const slider = s.getByRole('slider')
  await slider.focus()
  for (let k = 0; k < 6; k++) await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveAttribute('aria-valuetext', 'determinant ≈ 0')
  await expect(s.getByText(/treated as singular\. The exact value is 0\.0000001/)).toBeVisible()
  await expect(s.getByRole('button', { name: /Undo with/ })).toBeDisabled()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction/)).toBeVisible()
  await s.getByLabel(/same point/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
  await expect(s.getByText(/All three landed on the same spot/)).toBeVisible()
})

test('typing a parallel system shows no solution and updates NumPy', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await s.getByLabel('A row 2, column 2').fill('1')
  await expect(s.getByText(/parallel and never meet/)).toBeVisible()
  await expect(s.getByLabel('Output')).toHaveText('1')
  await s.getByLabel('b, row 2').fill('3')
  await expect(s.getByText(/infinitely many/).first()).toBeVisible()
})

test('dragging u in the low-rank demo updates ΔW', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.focus()
  await page.keyboard.press('ArrowUp')
  await expect(s.getByText(/u = \(2, 1.5\)/)).toBeVisible()
  await expect(s.getByLabel('Output')).toContainText('[[ 2.   -1.  ]\n [ 1.5  -0.75]]')
})

test('practice challenges tick from the live matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('A row 1, column 2').fill('2')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await s.getByRole('button', { name: 'Reset to identity' }).click()
  await s.getByLabel('A row 1, column 1').fill('0')
  await s.getByLabel('A row 1, column 2').fill('0')
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
  await expect(s.getByText(/Null space/).first()).toBeVisible()
})

const HOUSE_TITLE = 'A column that adds nothing, and weights from three houses'

test('running example: the m² column keeps rank 3 and solve recovers the weights', async ({ page }) => {
  await page.goto(LESSON)
  const box = page.getByRole('region', { name: HOUSE_TITLE })
  await expect(box.getByTestId('house-rank')).toHaveText('3')
  await expect(box.getByText(/w = \(0\.2, 15, -6\)/)).toBeVisible()
  await expect(box.getByRole('row', { name: /Corner house/ })).toContainText('139.35')
  await expect(box.getByLabel('Output')).toHaveText('(8, 4)\n3 3\n[ 0.2 15.  -6. ]')
  for (let n = 1; n <= 6; n++) await expect(page.locator(`section[aria-labelledby="step-${n}"]`)).toBeVisible()
})
