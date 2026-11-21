import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/matrices-as-transformations'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('home page starts at the beginning, or skips to vectors', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Start from the beginning' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dimensions and the origin')
  await page.goto('/')
  await page.getByRole('link', { name: 'Skip to vectors' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vector arithmetic')
})

test('every lesson is marked available and links work', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Coming soon')).toHaveCount(0)
  await expect(page.getByText('Available', { exact: true })).toHaveCount(21)
})

test('lesson navigation links to the next lesson', async ({ page }) => {
  await page.goto('/#/lessons/matrices-as-transformations')
  await page.getByRole('link', { name: /Next · 4\.2/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matrix multiplication')
})

test('typing into the matrix moves the basis vector', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('A row 1, column 1').fill('2')
  await expect(s.getByText('lands at (2, 0)')).toBeVisible()
})

test('dragging a basis vector updates the matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 40, y - 60, { steps: 8 })
  await page.mouse.up()
  await expect(s.getByLabel('A row 1, column 1')).not.toHaveValue('1')
  await expect(s.getByLabel('A row 2, column 1')).not.toHaveValue('0')
})

test('a basis vector can be moved with the keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByLabel('A row 1, column 1')).toHaveValue('1.5')
})

test('a singular matrix is explained, not hidden', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('A row 2, column 2').fill('0')
  await expect(s.getByText(/treated as singular/)).toBeVisible()
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/nothing has moved yet/)).toBeVisible()
  await s.getByLabel(/twice its height/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/Read it by/)).toBeVisible()
  await expect(s.getByText('î is at (2, 0), ĵ is at (0, 1).')).toBeVisible()

  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/twice its width/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('equation and NumPy output follow the matrix', async ({ page }) => {
  await page.goto(LESSON)
  await step(page, 2).getByLabel('A row 1, column 2').fill('1')
  // v = (2, 1), A = [[1, 1], [0, 1]]  =>  Av = (3, 1)
  const s = step(page, 4)
  await expect(s.getByLabel('Output')).toHaveText('[3 1]')
  await expect(s.getByText('Av = (3, 1)')).toBeVisible()
})

test('bias moves the origin', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByText(/stays at \(0, 0\)/)).toBeVisible()
  await s.getByLabel(/Add a bias/).check()
  await expect(s.getByText(/sent to \(1.5, 1\)/)).toBeVisible()
  await expect(s.locator('pre code')).toContainText('Y = X @ W.T + b')
})

test('challenges are ticked by the live matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('A row 1, column 1').fill('-1')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await s.getByRole('button', { name: 'Reset to identity' }).click()
  await s.getByLabel('A row 1, column 2').fill('1')
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
})

test('each lesson shows its prerequisites, linking to earlier lessons', async ({ page }) => {
  await page.goto('/#/lessons/dimensions-and-origin')
  const box = page.locator('section[aria-labelledby="before-you-start"]')
  await expect(box).toContainText('None. This is a starting point.')

  await page.goto('/#/lessons/matrix-multiplication')
  await box.getByRole('link', { name: /Matrices as transformations/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matrices as transformations')
})
