import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/3d-space'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('lesson renders with all six steps', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('3D space: the room')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  await expect(step(page, 1).getByText('P (2, 3, 1)')).toBeVisible()
})

test('sliders move the point and its shadows', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel('y coordinate').fill('4.5')
  await expect(s.getByText(/on the floor \(2, 0, 1\), on the back wall \(2, 4\.5, 0\)/)).toBeVisible()
  await expect(s.getByText('P (2, 4.5, 1)')).toBeVisible()
  // The slider is keyboard-operable.
  await s.getByLabel('x coordinate').focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText('P (2.5, 4.5, 1)')).toBeVisible()
})

test('dragging the picture turns the cube', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const svg = s.getByRole('group', { name: /movable point P/ })
  await svg.scrollIntoViewIfNeeded()
  await expect(svg).toHaveAttribute('data-view', 'corner view')
  const box = (await svg.boundingBox())!
  // Start near a corner of the picture, away from the point and its shadows.
  const x = box.x + 20
  const y = box.y + box.height - 20
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 60, y, { steps: 6 })
  await page.mouse.up()
  await expect(svg).not.toHaveAttribute('data-view', 'corner view')
  await expect(s.getByText(/Turned -5°, tilted 22°/)).toBeVisible()
})

test('the cube turns with the arrow keys and the view buttons', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const svg = s.getByRole('group', { name: /movable point P/ })
  await svg.focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText(/Turned -25°, tilted 22°/)).toBeVisible()
  await s.getByRole('button', { name: 'Front (xy)' }).click()
  await expect(svg).toHaveAttribute('data-view', 'front view')
  await expect(s.getByText(/Front view: looking straight at the back wall/)).toBeVisible()
})

test('dragging the floor shadow moves the point along the floor', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('[data-handle="floor"]')
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 80, y, { steps: 8 })
  await page.mouse.up()
  // Height is unchanged, x changed; the view did not turn.
  await expect(s.getByText(/P = \(\d+(\.5)?, 3, /)).toBeVisible()
  await expect(s.getByText(/P = \(2, 3, 1\)/)).toHaveCount(0)
  await expect(s.getByText(/Corner view/)).toBeVisible()
})

test('hovering a shadow shows its coordinates', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('[data-handle="floor"]').hover()
  await expect(s.locator('.coord-tooltip')).toContainText('shadow on floor (xz): (2, 0, 1)')
})

test('prediction turns to the front view only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction to turn/)).toBeVisible()
  await s.getByLabel(/disappears behind/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText(/Q is drawn exactly on top of its back-wall shadow \(3, 2, 0\)/)).toBeVisible({ timeout: 10_000 })
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/exactly on its back-wall shadow/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('apply: choosing a fruit updates the readout and NumPy', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByRole('button', { name: /A3 apple/ }).click()
  await expect(s.getByText(/row 4 of the table, at \(4, 3, 0\.5\)/)).toBeVisible()
  await expect(s.getByLabel('Output')).toHaveText('(8, 3)\n[4.  3.  0.5]')
  await expect(s.getByText('A3 (4, 3, 0.5)')).toBeVisible()
})

test('practice: shadow detective is solved with the sliders', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 3 solved')).toBeVisible()
  await s.getByLabel('x coordinate').fill('4')
  await s.getByLabel('y coordinate').fill('2.5')
  await s.getByLabel('z coordinate').fill('1')
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
  await expect(s.getByText(/two different shadows together give back all three/)).toBeVisible()
})

test('step 2: the walk updates live, handles zeros, and the presets work', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const panel = s.getByTestId('walk-panel')
  await expect(panel).toContainText('Move 2 right along the width (x).')
  await expect(s.locator('[data-leg="x"]')).toContainText('1. 2 right')
  await s.getByLabel('z coordinate').fill('0')
  await expect(panel).toContainText('Stay put along z: the depth is 0.')
  await expect(s.locator('[data-leg="z"]')).toHaveCount(0)
  await s.getByRole('button', { name: 'Equal coordinates (3, 3, 3)' }).click()
  await expect(panel).toContainText('Move 3 forward, toward you (z).')
  await expect(panel).toContainText('diagonal')
  await expect(s.getByText('P (3, 3, 3)')).toBeVisible()
  await s.getByRole('button', { name: 'Origin (0, 0, 0)' }).click()
  await expect(panel).toContainText('This is the origin')
  await expect(s.locator('[data-walk] line')).toHaveCount(0)
  await s.getByRole('button', { name: 'Reset' }).click()
  await expect(s.getByText('P (2, 3, 1)')).toBeVisible()
  // The walk drawing can be switched off.
  await s.getByLabel('Draw the walk in the room').uncheck()
  await expect(s.locator('[data-walk]')).toHaveCount(0)
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('planes: the floor, a wall and a tilted sheet, each with a point on either side', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(LESSON)
  const s = page.locator('section[aria-labelledby="planes-heading"]')
  await expect(s.locator('[data-plane="Floor: y = 0"]')).toBeVisible()
  await expect(s.getByText(/is below the floor \(y < 0\)/)).toBeVisible()
  await s.getByRole('button', { name: 'Back wall (z = 0)' }).click()
  await expect(s.locator('[data-plane="Back wall: z = 0"]')).toBeVisible()
  await expect(s.getByText(/is behind the wall \(z < 0\)/)).toBeVisible()
  await s.getByRole('button', { name: 'Tilted sheet (y = z)' }).click()
  await expect(s.locator('[data-plane="Tilted sheet: y = z"]')).toBeVisible()
  await s.getByLabel('Show two groups split by a tilted sheet').check()
  await expect(s.getByText(/No point is on the wrong side/)).toBeVisible()
  await expect(s.getByRole('button', { name: 'Tilted sheet (y = z)' })).toHaveAttribute('aria-pressed', 'false')
  // The picture still turns by keyboard.
  await s.getByRole('group', { name: /ten points/ }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText(/Turned -50°, tilted 22°/)).toBeVisible()
  expect(errors).toEqual([])
})
