import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const LESSON = '/#/lessons/dimensions-and-origin'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const readout = (s: Locator) => s.locator('[aria-live]').first()
/** Movable points in a step: the origin pin comes first in the SVG, the bead last. */
const handles = (s: Locator) => s.locator('.mafs-movable-point')

async function press(handle: Locator, key: string, times: number) {
  await handle.focus()
  for (let i = 0; i < times; i++) await handle.press(key)
}

test('lesson renders with all six steps and links to 1.2', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dimensions and the origin')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  await expect(page.getByRole('link', { name: /1\.2: The coordinate plane/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Key takeaways' })).toBeVisible()
})

test('dragging the bead to the left gives it a negative number', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const bead = handles(s).last()
  await bead.scrollIntoViewIfNeeded()
  const box = (await bead.boundingBox())!
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2]
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 400, y, { steps: 10 })
  await page.mouse.up()
  await expect(readout(s)).toContainText(/number is −\d: it is \d steps? left of the origin/)
})

test('bead moves one step per arrow key', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await press(handles(s).last(), 'ArrowLeft', 5)
  await expect(readout(s)).toHaveText('The bead’s number is −2: it is 2 steps left of the origin.')
})

test('moving the origin renumbers the line but does not move the bead', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await expect(handles(s)).toHaveCount(1)
  await s.getByRole('checkbox', { name: /move the origin/ }).check()
  await expect(handles(s)).toHaveCount(2)
  const bead = handles(s).last()
  const before = (await bead.boundingBox())!
  await press(handles(s).first(), 'ArrowRight', 5)
  await expect(readout(s)).toHaveText(
    'The bead’s number is −2: it is 2 steps left of the origin. Counted from the first origin it would be 3. The bead has not moved; only the starting point has.',
  )
  const after = (await bead.boundingBox())!
  expect(after.x).toBeCloseTo(before.x, 0)
  // The bead's label follows its new number.
  await expect(s.getByText('bead: −2')).toBeVisible()
  await s.getByRole('button', { name: 'Put the origin back' }).click()
  await expect(readout(s)).toHaveText('The bead’s number is 3: it is 3 steps right of the origin.')
})

test('the prediction reveals the origin moving and the bead reading −1', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await s.getByRole('radio', { name: /now reads −1/ }).check()
  await s.getByRole('button', { name: 'Lock in my prediction' }).click()
  await expect(readout(s)).toHaveText(
    'The origin is now 4 steps to the right. The bead has not moved, and its number is −1: 1 step left of the origin.',
  )
  await expect(s.getByText('old origin')).toBeVisible()
  await expect(s.getByText('bead: −1')).toBeVisible()
})

test('step 4: rule and NumPy follow the dragged bead and origin', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 4)
  await press(handles(s).first(), 'ArrowLeft', 3)
  await press(handles(s).last(), 'ArrowLeft', 1)
  await expect(readout(s)).toContainText('In numbers: 5 = 2 − (−3).')
  await expect(s.getByLabel('Output')).toHaveText('[5]\n(1,)')
  await expect(s.locator('figure code')).toContainText('origin = np.array([-3])')
})

test('practice: two line challenges tick from live state', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 3 solved')).toBeVisible()
  // Origin 5 left of the bead, bead untouched: number 5.
  await press(handles(s).first(), 'ArrowLeft', 3)
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  await expect(s.getByText(/Same place, new number/)).toContainText('(solved)')
  // Origin to 8, bead still at 2: number −6.
  await press(handles(s).first(), 'ArrowRight', 11)
  await expect(readout(s)).toContainText('number is −6')
  await expect(s.getByText('2 of 3 solved')).toBeVisible()
  await s.getByLabel('Dimensions of one weather reading').fill('4')
  await expect(s.getByText('3 of 3 solved')).toBeVisible()
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})

test('running example: house A gains one number per feature', async ({ page }) => {
  await page.goto(LESSON)
  const s = page.locator('section[aria-labelledby="running-example"]')
  await expect(s.getByRole('heading', { name: 'One house, one more number at a time' })).toBeVisible()
  await s.getByRole('button', { name: '+ bedrooms' }).click()
  await expect(readout(s)).toHaveText('House A is the point (1100, 2): 2 numbers, so a point in 2 dimensions.')
  await s.getByRole('button', { name: '+ distance' }).click()
  await expect(s.getByRole('img', { name: /House A in 3 dimensions/ })).toBeVisible()
  await expect(s.getByText('[1100    2    8]\n(3,)\n(8, 3)\n265')).toBeVisible()
  await expect(step(page, 5).getByRole('table', { name: 'The dimension ladder' })).toBeVisible()
})
