import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const LESSON = '/#/lessons/coordinate-plane'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)
const readout = (s: Locator) => s.locator('[aria-live]').first()
const tag = (s: Locator) => s.locator('.quadrant-tag')
const coords = (s: Locator) => s.locator('.coord-label')

test('lesson renders with all six steps and points to lesson 1.3', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The coordinate plane')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  await expect(page.getByRole('link', { name: /1\.3: 3D space: the room/ })).toBeVisible()
})

test('step 1 starts with a number line, then the plane with the walk', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 1)
  await expect(s.getByRole('group', { name: /number line/ })).toBeVisible()
  await expect(readout(s)).toHaveText('P = (3, 2): Move 3 right (x), then 2 up (y).')
  await expect(tag(s)).toHaveText('Quadrant I')
  await expect(coords(s)).toHaveText('(3, 2)')
})

test('dragging the point updates its coordinates, quadrant label and sliders', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 200, y + 160, { steps: 10 })
  // While dragging, the coordinates are shown next to the point.
  await expect(s.locator('.coord-tooltip')).toBeVisible()
  await page.mouse.up()
  await expect(readout(s)).toContainText('It is in quadrant III: x negative, y negative')
  await expect(tag(s)).toHaveText('Quadrant III')
  // Sliders follow the drag: same numbers as the point's label.
  const label = (await coords(s).textContent())!
  const [, px, py] = label.match(/\((-?\d+), (-?\d+)\)/)!
  await expect(s.getByRole('slider', { name: 'x' })).toHaveValue(px)
  await expect(s.getByRole('slider', { name: 'y' })).toHaveValue(py)
})

test('moving a slider moves the point', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const plane = s.getByRole('group').first()
  // Position of the handle inside the plane, so page scrolling does not matter.
  const at = async () => {
    const [h, b] = [(await handle.boundingBox())!, (await plane.boundingBox())!]
    return { x: h.x - b.x, y: h.y - b.y }
  }
  const before = await at()
  await s.getByRole('slider', { name: 'y' }).fill('-4')
  await expect(coords(s)).toHaveText('(3, -4)')
  await expect(tag(s)).toHaveText('Quadrant IV')
  const after = await at()
  expect(after.x).toBeCloseTo(before.x, 0)
  expect(after.y).toBeGreaterThan(before.y + 100)
})

test('the point can reach x = 10 and x = -10', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.scrollIntoViewIfNeeded()
  const box = (await handle.boundingBox())!
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  // Drag far past the right end: stops at x = 10.
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 1500, cy, { steps: 15 })
  await page.mouse.up()
  await expect(coords(s)).toHaveText('(10, 2)')
  await expect(s.getByRole('slider', { name: 'x' })).toHaveValue('10')
  // The x slider's Home key goes to the other end.
  await s.getByRole('slider', { name: 'x' }).focus()
  await page.keyboard.press('Home')
  await expect(coords(s)).toHaveText('(-10, 2)')
  await expect(readout(s)).toContainText('Move 10 left (x)')
})

test('one arrow key press moves exactly one step; the label changes across the y-axis', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.locator('.mafs-movable-point').first().focus()
  await expect(tag(s)).toHaveText('Quadrant I')
  await page.keyboard.press('ArrowRight')
  await expect(coords(s)).toHaveText('(4, 2)')
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft')
  await expect(coords(s)).toHaveText('(0, 2)')
  await expect(tag(s)).toHaveText('on the y-axis')
  await page.keyboard.press('ArrowLeft')
  await expect(tag(s)).toHaveText('Quadrant II')
  await expect(readout(s)).toContainText('P = (-1, 2): Move 1 left (x), then 2 up (y)')
  for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown')
  await expect(tag(s)).toHaveText('on the x-axis')
  await page.keyboard.press('ArrowRight')
  await expect(tag(s)).toHaveText('origin')
})

test('hovering a fixed point shows its coordinates', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 1)
  await s.locator('.coord-tooltip').count().then((n) => expect(n).toBe(0))
  const plane = s.getByRole('group', { name: /point P at \(3, 2\)/ })
  await plane.scrollIntoViewIfNeeded()
  const dot = plane.locator('circle[fill="transparent"]').first()
  await dot.hover()
  await expect(s.locator('.coord-tooltip')).toContainText('x = 3, y = 2')
})

test('prediction is revealed only after locking in', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 3)
  await expect(s.getByText(/Lock in a prediction/)).toBeVisible()
  await s.getByLabel(/Straight down/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Not quite/)).toBeVisible()
  await expect(s.getByText('The point is now at (-5, 3). Same height, same distance from the y-axis, other side.')).toBeVisible({ timeout: 10_000 })
  await expect(tag(s)).toHaveText('Quadrant II')
  await s.getByRole('button', { name: /try again/i }).click()
  await s.getByLabel(/other side of the y-axis/).check()
  await s.getByRole('button', { name: /lock in/i }).click()
  await expect(s.getByText(/Correct/)).toBeVisible()
})

test('practice: placing the point at (-3, 2) ticks the challenge', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await expect(s.getByText('0 of 4 solved')).toBeVisible()
  await s.locator('.mafs-movable-point').first().focus()
  // From (1, 1) in whole steps: 4 left, 1 up.
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowUp')
  await expect(readout(s)).toContainText('P = (-3, 2)')
  await expect(s.getByText('1 of 4 solved')).toBeVisible()
  await expect(s.getByText(/That is quadrant II/)).toBeVisible()
})

test('apply: dragging the new email rewrites its NumPy row', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await expect(s.getByLabel('Output')).toHaveText('(8, 2)\n[2 3]')
  await s.locator('.mafs-movable-point').first().focus()
  // Counts snap to whole numbers: one press is one more link.
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText(/the row \[3, 3\]/)).toBeVisible()
  await expect(s.getByLabel('Output')).toHaveText('(8, 2)\n[3 3]')
})

test('no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LESSON)
  await expect(step(page, 6)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
})

test('practice quiz: read, plot by clicking, and move questions give diagnosed feedback', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await s.getByRole('button', { name: 'Quick quiz' }).click()
  // 1. Read (-4, 3): picking the swapped pair names the slip.
  await s.getByRole('button', { name: '(3, -4)' }).click()
  await expect(s.getByRole('status').last()).toContainText('You swapped x and y')
  await expect(readout(s)).toHaveText('The answer is (-4, 3). Your answer, (3, -4), is marked in red.')
  await s.getByRole('button', { name: 'Next question' }).click()
  // 2. Plot (2, -5) by clicking the plane at that spot.
  const plane = s.getByRole('group', { name: 'Quiz plane' })
  await plane.scrollIntoViewIfNeeded()
  const box = (await plane.boundingBox())!
  // The plane shows x and y from -10.8 to 10.8 on the shorter side; units are square.
  const unit = Math.min(box.width, box.height) / 21.6
  await page.mouse.click(box.x + box.width / 2 + 2 * unit, box.y + box.height / 2 + 5 * unit)
  await s.getByRole('button', { name: 'Check my answer' }).click()
  await expect(s.getByText('Correct: (2, -5).')).toBeVisible()
  await expect(s.getByText('Question 2 of 6 · 1 correct so far')).toBeVisible()
  await s.getByRole('button', { name: 'Next question' }).click()
  // 3. Read (0, -6) correctly.
  await s.getByRole('button', { name: '(0, -6)' }).click()
  await expect(s.getByText('Correct: (0, -6).')).toBeVisible()
  await s.getByRole('button', { name: 'Next question' }).click()
  // 4. Plot (-7, -2) with the keyboard.
  await s.locator('.mafs-movable-point').first().focus()
  for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowLeft')
  for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown')
  await s.getByRole('button', { name: 'Check my answer' }).click()
  await expect(s.getByText('Correct: (-7, -2).')).toBeVisible()
  await s.getByRole('button', { name: 'Next question' }).click()
  // 5. Move from (-3, -1): counting from the origin is caught.
  await s.getByRole('button', { name: '(-4, 4)' }).click()
  await expect(s.getByRole('status').last()).toContainText('counted the move from the origin')
  await s.getByRole('button', { name: 'Next question' }).click()
  await s.getByRole('button', { name: '(5, -8)' }).click()
  await s.getByRole('button', { name: 'See my score' }).click()
  await expect(s.getByText('Quiz finished: 4 of 6 correct.')).toBeVisible()
  await s.getByRole('button', { name: 'Start again' }).click()
  await expect(s.getByText('Question 1 of 6 · 0 correct so far')).toBeVisible()
})

test('step 2: pinned points fill a table and can be joined into a shape', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  await s.getByLabel(/Pin several points/).check()
  for (const [x, y] of [[-4, -2], [4, -2], [4, 4], [-4, 4]]) {
    await s.getByRole('slider', { name: 'x' }).fill(String(x))
    await s.getByRole('slider', { name: 'y' }).fill(String(y))
    await s.getByRole('button', { name: /^Pin [A-H] at/ }).click()
  }
  const rows = s.getByRole('table').getByRole('row')
  await expect(rows).toHaveCount(5)
  await expect(rows.nth(1)).toHaveText(/A\s*-?−?4\s*-?−?2\s*Quadrant III/)
  await expect(rows.nth(4)).toContainText('Quadrant II')
  await expect(s.locator('.mafs-group polygon, polygon').first()).toBeVisible()
  await s.getByRole('button', { name: 'Clear pins' }).click()
  await expect(s.getByRole('table')).toHaveCount(0)
})

test('running example: eight houses on a plane, G top-right, hover shows coordinates', async ({ page }) => {
  await page.goto(LESSON)
  const s = page.locator('section[aria-labelledby="running-example"]')
  await expect(s.getByRole('heading', { name: 'Eight houses on a plane' })).toBeVisible()
  await expect(s.locator('[data-house]')).toHaveCount(8)
  await expect(readout(s)).toContainText('House G (Townhouse) is the point (2400, 560)')
  await s.getByRole('button', { name: 'B', exact: true }).click()
  await expect(readout(s)).toContainText('House B (Corner house) is the point (1500, 370)')
  await s.locator('[data-house="A"] circle[fill="transparent"]').hover()
  await expect(s.locator('.coord-tooltip')).toHaveText('x = 1100, y = 265')
  await expect(s.getByText('(8, 2)\n[1500  370]')).toBeVisible()
})
