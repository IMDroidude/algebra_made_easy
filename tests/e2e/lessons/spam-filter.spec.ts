import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/spam-filter'
const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('renders the hero, six steps, the running example and the takeaways', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Build a spam filter')
  await expect(page.getByRole('heading', { name: '8 emails, 8 points, 1 line' })).toBeVisible()
  for (const n of [1, 2, 3, 4, 5, 6]) await expect(step(page, n)).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'The same recipe sorts the houses' })).toHaveCount(1)
  await expect(page.locator('section[aria-labelledby="key-takeaways"]')).toContainText('X @ w scores every email')
})

test('step 2: moving an email with the keyboard moves its centre a quarter as far', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  // The movable points are in data order: N1 is first.
  const n1 = s.locator('.mafs-movable-point').first()
  await n1.focus()
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight')
  await expect(s.locator('[aria-live]')).toContainText('Normal centre = ((5 + 0 + 1 + 2) / 4, (0 + 1 + 2 + 1) / 4) = (2, 1)')
  await expect(s.getByLabel('Output')).toHaveText('[2. 1.]\n[4. 4.]\n[2. 3.]')
  await s.getByRole('button', { name: 'Put the emails back' }).click()
  await expect(s.locator('[aria-live]')).toContainText('= (1, 1)')
})

test('step 5: typing counts classifies a new email live', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByLabel('exclamation marks').fill('5')
  await expect(s.locator('[aria-live]')).toContainText('(1, 5) scores w · x = 1 + 5 = 6, above 5, so spam')
  await expect(s.getByLabel('Output')).toContainText('6 True')
})

test('step 6: challenges tick from live state, by keyboard', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  const points = s.locator('.mafs-movable-point')
  const fresh = points.last() // the new email starts at (5, 1)
  await fresh.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(s.locator('[aria-live]')).toContainText('New email (4, 1): score 5, on the line (counts as normal).')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft')
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowUp')
  await expect(s.locator('[aria-live]')).toContainText('New email (1, 5): score 6, spam.')
  await expect(s.getByText('2 of 4 solved')).toBeVisible()
  // S1 (the fifth point) dragged down to (4, 1) moves the spam centre and the line.
  await points.nth(4).focus()
  for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown')
  await expect(s.locator('[aria-live]')).toContainText('Learned line: x + 0.83y = 4.38')
  await expect(s.getByText(/of 4 solved/)).toHaveText('3 of 4 solved')
  await expect(s.getByText('You moved S1.')).toBeVisible()
})

test('no horizontal scroll on a phone, in either theme', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(LESSON)
    await page.getByText('Optional, advanced').click()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  }
})
