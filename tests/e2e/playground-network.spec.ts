import { expect, test } from '@playwright/test'

const LAB = '/#/playground?lab=network'

test('the network lab opens from its link and trains live', async ({ page }) => {
  await page.goto(LAB)
  await expect(page.getByTestId('epoch')).toHaveText('0')
  await page.getByRole('button', { name: /^3\. Add two hidden neurons/ }).click()
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.getByTestId('status')).toContainText('48 of 48 training examples correct', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Pause' }).click()
  const epoch = Number(await page.getByTestId('epoch').textContent())
  expect(epoch).toBeGreaterThan(50)
  // paused: the count stays where it is
  await page.waitForTimeout(300)
  await expect(page.getByTestId('epoch')).toHaveText(String(epoch))
  // a cat-sized animal is a cat, a tiger-sized one is not
  await expect(page.getByTestId('verdict')).toContainText('the network says cat')
  await page.getByRole('slider', { name: 'size' }).fill('9')
  await expect(page.getByTestId('verdict')).toContainText('the network says not a cat')
})

test('the coloured plane is drawn and follows the network', async ({ page }) => {
  await page.goto(LAB)
  await page.getByRole('button', { name: /^1\. One neuron/ }).click()
  const corners = () =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('section[aria-label="Output"] canvas')!
      const ctx = canvas.getContext('2d')!
      const mid = Math.floor(canvas.height / 2)
      return [ctx.getImageData(2, mid, 1, 1).data, ctx.getImageData(canvas.width - 3, mid, 1, 1).data].map((d) => [d[0], d[1], d[2]])
    })
  const step = page.getByRole('button', { name: 'Step one epoch' })
  for (let i = 0; i < 40; i++) await step.click()
  const [left, right] = await corners()
  // small animals (left) are cats: teal, more blue than red. Tiger-sized (right): orange, more red than blue.
  expect(left[2]).toBeGreaterThan(left[0])
  expect(right[0]).toBeGreaterThan(right[2])
})

test('clicking the plane moves the new animal', async ({ page }) => {
  await page.goto(LAB)
  const plane = page.locator('section[aria-label="Output"] .cursor-crosshair')
  await plane.scrollIntoViewIfNeeded()
  const box = (await plane.boundingBox())!
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.2)
  await expect(page.getByTestId('verdict')).toContainText('size 8, stripes 8')
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(LAB)
  await expect(page.getByTestId('epoch')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('lesson 4.2 links to the lab', async ({ page }) => {
  await page.goto('/#/lessons/matrix-multiplication')
  await page.getByRole('link', { name: 'neural network lab' }).click()
  await expect(page.getByRole('button', { name: 'Neural network: cat or tiger?' })).toHaveAttribute('aria-pressed', 'true')
})
