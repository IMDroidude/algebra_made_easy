import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/points-and-vectors'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const press = async (page: Page, key: string, times: number) => {
  for (let i = 0; i < times; i++) await page.keyboard.press(key)
}

test('the lesson renders all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Points and vectors')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
})

test('moving the start of v keeps the same vector; moving P changes the point', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const readout = s.locator('[aria-live]')
  const handles = s.locator('.mafs-movable-point')
  await handles.nth(0).focus()
  await press(page, 'ArrowRight', 2)
  await expect(readout).toContainText('v = (3, 2): 3 east, 2 north. It starts at (-3, -3)')
  await expect(readout).toContainText('v is still (3, 2): the same movement')
  await handles.nth(2).focus()
  await press(page, 'ArrowLeft', 2)
  await expect(readout).toContainText('P is the place (1, 3), a different place from (2, 3).')
})

test('dragging the tip of v with the mouse changes its numbers', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const readout = s.locator('[aria-live]')
  const tip = s.locator('.mafs-movable-point').nth(1)
  await tip.scrollIntoViewIfNeeded()
  const box = (await tip.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 90, y - 90, { steps: 8 })
  await page.mouse.up()
  await expect(readout).not.toContainText('v = (3, 2):')
})

test('the prediction explains a wrong answer and reveals the trip', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await s.getByLabel('The spot halfway between home and the shop.').check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Halfway between \(3, 1\) and \(1, 3\) is \(2, 2\)/)).toBeVisible()
  await expect(s.locator('[aria-live]')).toContainText('B − A = (-2, 2): 2 west, 2 north')
})

test('moving B by keyboard updates the equation, readout and NumPy output', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await s.locator('.mafs-movable-point').nth(1).focus()
  await press(page, 'ArrowDown', 2) // B (1, 3) -> (1, 2)
  await expect(s.locator('[aria-live]')).toContainText('v = B − A = (3, 3): 3 east, 3 north')
  await expect(s.getByLabel('Output')).toHaveText('[3 3]\n[1 2]\n4.242640687119285')
})

test('the robot follows its moves', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByRole('button', { name: 'Next move' }).click()
  await s.getByRole('button', { name: 'Next move' }).click()
  await expect(s.locator('[aria-live]')).toContainText('After 2 moves the robot is at (0, 0)')
})

test('practice challenges tick from the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  const a = s.locator('.mafs-movable-point').nth(0)
  await a.focus()
  await press(page, 'ArrowDown', 6) // A (-3, 2) -> (-3, -1): A + m lands on the flag
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  await expect(s.getByText(/worked backwards: flag − m/)).toBeVisible()
  const b = s.locator('.mafs-movable-point').nth(1)
  await b.focus()
  // B (-1, 3) -> (-3, -1): on top of A, the zero vector
  await press(page, 'ArrowLeft', 4)
  await press(page, 'ArrowDown', 8)
  await expect(s.getByText('2 of 3 solved')).toBeVisible()
  await expect(s.getByText(/zero vector/).first()).toBeVisible()
})
