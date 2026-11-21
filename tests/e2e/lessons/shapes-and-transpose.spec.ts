import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/shapes-and-transpose'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('lesson renders with its title', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Shapes, transpose, non-square matrices')
  await expect(step(page, 1).getByLabel('Output', { exact: true })).toHaveText('(2, 3)\n[4 2]')
})

test('shape checker shows NumPy’s error, and B.T fixes it', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('(2, 4)')
  await s.getByLabel('Rows of B').selectOption('2')
  await s.getByLabel('Columns of B').selectOption('3')
  await expect(s.getByLabel('Output', { exact: true })).toContainText('(size 2 is different from 3)')
  await s.getByLabel(/Use/).check()
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('(2, 2)')
  await expect(s.locator('pre code')).toContainText('C = A @ B.T')
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to apply M/)).toBeVisible()
  await s.getByLabel(/drops straight down/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText('p4 = (0, 3) → 3')).toBeVisible()
  await expect(s.getByText(/p1 and p4 land on the same number, 3/)).toBeVisible()
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/squashed onto a line/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('1×2 squash follows the keyboard; 2×1 lift follows its matrix', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await s.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowRight')
  // v = (2.5, 1), M = [1 1]  =>  3.5
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[3.5]')
  await s.getByRole('button', { name: /2×1: line → plane/ }).click()
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[2 2]')
  await s.getByLabel('N row 2, column 1').fill('-0.5')
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('[ 2. -1.]')
  await s.getByRole('button', { name: 'Set N to M.T' }).click()
  await expect(s.getByLabel('N row 2, column 1')).toHaveValue('1')
})

test('transpose explorer highlights the partner entry', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await s.getByRole('button', { name: 'A row 2, column 1: 1' }).click()
  await expect(s.getByRole('button', { name: 'A.T row 1, column 2: 1' })).toHaveAttribute('aria-pressed', 'true')
})

test('projection output follows W', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByLabel('W row 1, column 2').fill('0.5')
  await expect(s.getByLabel('Output', { exact: true })).toHaveText('(4, 1)\n[[ 2.5]\n [ 2.5]\n [-1. ]\n [-2.5]]')
})

test('shape challenges tick themselves', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.getByLabel('Rows of A').selectOption('2')
  await s.getByLabel('Columns of A').selectOption('3')
  await s.getByLabel('Rows of B').selectOption('3')
  await s.getByLabel('Columns of B').selectOption('2')
  const item = (title: string) => s.getByRole('listitem').filter({ hasText: title })
  await expect(item('Both orders, different answers')).toContainText('(solved)')
  await expect(item('More out than in')).toContainText('(not solved yet)')
  await s.getByLabel('Rows of A').selectOption('3')
  await s.getByLabel('Columns of A').selectOption('1')
  await s.getByLabel('Rows of B').selectOption('1')
  await s.getByLabel('Columns of B').selectOption('3')
  await expect(item('More out than in')).toContainText('(solved)')
  await expect(item('More out than in')).toContainText(/outer product/)
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(sw).toBeLessThanOrEqual(390)
})
