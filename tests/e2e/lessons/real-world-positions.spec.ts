import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LESSON = '/#/lessons/real-world-positions'

const step = (page: Page, n: number) => page.locator(`section[aria-labelledby="step-${n}"]`)

test('lesson renders with six steps, recap and takeaways', async ({ page }) => {
  await page.goto(LESSON)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Positions in the real world')
  for (let n = 1; n <= 6; n++) await expect(step(page, n)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Can you explain…?' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Key takeaways' })).toBeVisible()
})

test('the origin moves by keyboard and the lamp keeps its place', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 2)
  const handle = s.locator('.mafs-movable-point').first()
  await handle.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(s.getByText(/lamp is at \(4, 3\)/)).toBeVisible()
  await s.getByRole('button', { name: /floor tiles/ }).click()
  await expect(s.getByText(/lamp is at \(8, 6\)/)).toBeVisible()
})

test('dragging the origin in practice solves the chair challenge', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  const plane = s.getByRole('group', { name: /Classroom floor plan/ })
  await plane.scrollIntoViewIfNeeded()
  const handle = plane.locator('.mafs-movable-point')
  const box = (await handle.boundingBox())!
  const svg = (await plane.locator('svg').first().boundingBox())!
  // The room spans x -1…9.6 across the plane; find pixels per metre from the width.
  const perMetre = svg.width / (9.6 + 1 + 0.6)
  const x0 = box.x + box.width / 2
  const y0 = box.y + box.height / 2
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  await page.mouse.move(x0 + 4 * perMetre, y0 - 2.5 * perMetre, { steps: 8 })
  await page.mouse.up()
  // Nudge by keyboard if the drag landed half a metre off.
  for (let k = 0; k < 4; k++) {
    if (await s.getByText(/Chair at \(2, 1\)/).isVisible()) break
    const text = (await s.getByText(/Chair at \(/).textContent()) ?? ''
    const [, a, b] = text.match(/Chair at \((-?[\d.]+), (-?[\d.]+)\)/) ?? []
    await handle.focus()
    if (Number(a) > 2) await page.keyboard.press('ArrowRight')
    if (Number(a) < 2) await page.keyboard.press('ArrowLeft')
    if (Number(b) > 1) await page.keyboard.press('ArrowUp')
    if (Number(b) < 1) await page.keyboard.press('ArrowDown')
  }
  await expect(s.getByText(/Chair at \(2, 1\)/)).toBeVisible()
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
})

test('drone sliders solve the window challenge', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 6)
  await s.getByRole('slider', { name: 'x' }).fill('10')
  await s.getByRole('slider', { name: 'y' }).fill('10')
  await s.getByRole('slider', { name: 'z' }).fill('2')
  await expect(s.getByText(/Drone at \(10, 10, 2\)/)).toBeVisible()
  await expect(s.getByText('1 of 3 solved')).toBeVisible()
})

test('recap link opens the lesson it names', async ({ page }) => {
  await page.goto(LESSON)
  const recap = page.locator('section[aria-labelledby="module-recap"]')
  await recap.getByRole('button', { name: 'Show answer' }).first().click()
  await expect(recap.getByText(/One independent direction/)).toBeVisible()
  await recap.getByRole('link', { name: /1\.3/ }).click()
  await expect(page).toHaveURL(/#\/lessons\/3d-space/)
})

test('running example: centring the houses and switching to square metres', async ({ page }) => {
  await page.goto(LESSON)
  const s = page.locator('section[aria-labelledby="running-example"]')
  await expect(s.getByRole('heading', { name: 'Choosing an origin and units for the houses' })).toBeVisible()
  await s.getByRole('button', { name: 'The average house' }).click()
  await expect(s.locator('[aria-live]').first()).toContainText('House A is (−400, −0.625, 0.5)')
  await s.getByRole('button', { name: 'Square metres' }).click()
  await expect(s.locator('[aria-live]').first()).toContainText('House A is (−37.2, −0.625, 0.5)')
  await expect(s.getByText('[102.2 139.4  83.6 185.8 120.8 167.2 223.   92.9]', { exact: false })).toBeVisible()
})

test('robot arm: frames inside frames, and the check ticks', async ({ page }) => {
  await page.goto(LESSON)
  const s = step(page, 5)
  await s.getByRole('button', { name: 'Robot arm' }).click()
  await expect(s.getByRole('list', { name: "The cup's coordinates in each frame" })).toContainText('(110, 45)')
  await s.getByRole('spinbutton', { name: 'cup x in the room' }).fill('8')
  await s.getByRole('spinbutton', { name: 'cup y in the room' }).fill('4')
  await expect(s.getByText(/^Right: .* = \(8, 4\)/)).toBeVisible()
})
