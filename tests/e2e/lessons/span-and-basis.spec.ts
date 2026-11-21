import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/span-and-basis'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const press = async (page: Page, key: string, times: number) => {
  for (let i = 0; i < times; i++) await page.keyboard.press(key)
}

test('the lesson renders all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Linear combinations, span, basis')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('the a slider works by keyboard; readout and code follow', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByRole('slider', { name: 'a' }).focus()
  await press(page, 'ArrowRight', 2) // 1 -> 1.5
  await expect(s.locator('[aria-live]')).toContainText('w = 1.5·u + 2·v = (3, 1.5) + (-2, 2) = (1, 3.5)')
  await expect(step(page, 4).getByLabel('Output')).toHaveText('[1.  3.5]\n2')
})

test('moving v onto the line of u collapses the span; moving it off restores it', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel(/Show every reachable point/).check()
  await expect(s.getByText(/the span is the whole plane/)).toBeVisible()
  // v starts at (-1, 1); move it to (-2, -1), which is -1 × u
  await s.locator('.mafs-movable-point').nth(1).focus()
  await press(page, 'ArrowLeft', 2)
  await press(page, 'ArrowDown', 4)
  await expect(s.getByText(/the span is only a line/)).toBeVisible()
  await expect(step(page, 4).getByLabel('Output')).toContainText('\n1')
  await page.keyboard.press('ArrowUp')
  await expect(s.getByText(/the span is the whole plane/)).toBeVisible()
})

test('u alone reaches only a line', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('Use u alone').check()
  await expect(s.getByText(/With u alone/)).toBeVisible()
  await expect(s.getByRole('slider', { name: 'b' })).toBeDisabled()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to see/)).toBeVisible()
  await s.getByLabel(/Every point of the plane/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/Every combination lands on the line/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/Only the points on one line/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('the redundant feature collapses the basis in step 5', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output')).toHaveText('[2. 1.]\n[3. 1.]')
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowUp') // movie (3, 1.5)
  await expect(s.getByLabel('Output')).toHaveText('[2.25 0.75]\n[3.  1.5]')
  await s.getByLabel(/redundant feature/).check()
  await expect(s.getByLabel('Output')).toContainText('LinAlgError: Singular matrix')
})

test('practice: collapse, restore and reach the star by keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  // reach: a 1 -> -1.75 (11 steps of 0.25), b 1 -> -0.5 (6 steps)
  await s.getByRole('slider', { name: 'a' }).focus()
  await press(page, 'ArrowLeft', 11)
  await s.getByRole('slider', { name: 'b' }).focus()
  await press(page, 'ArrowLeft', 6)
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  // collapse: v (1, 1.5) -> (-1, 0.5), which is -0.5 × u
  await s.locator('.mafs-movable-point').nth(1).focus()
  await press(page, 'ArrowLeft', 4)
  await press(page, 'ArrowDown', 2)
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
  await page.keyboard.press('ArrowUp')
  await expect(s.getByText('3 of 4 solved')).toBeVisible()
})

test('the star shows its coordinates on hover', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await s.getByRole('group', { name: /Draggable vectors u and v/ }).scrollIntoViewIfNeeded()
  // Hover targets are invisible circles; hover each until the star's coordinates show.
  const targets = s.locator('circle[fill="transparent"]')
  const texts: string[] = []
  for (let i = 0; i < (await targets.count()); i++) {
    await targets.nth(i).hover({ force: true })
    texts.push((await s.locator('.coord-tooltip').allTextContents()).join())
  }
  expect(texts).toContain('x = -4, y = 1')
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})
