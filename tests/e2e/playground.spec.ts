import { expect, test } from '@playwright/test'

test('vector lab adds two vectors', async ({ page }) => {
  await page.goto('/#/playground')
  await expect(page.getByText('u + v = (3, 3)')).toBeVisible()
  await expect(page.getByLabel('Output')).toHaveText('[3 3]')
})

test('vector lab scales a vector', async ({ page }) => {
  await page.goto('/#/playground')
  await page.getByRole('button', { name: 'Scale a vector' }).click()
  await expect(page.getByText('2u = (4, 2)')).toBeVisible()
  await page.getByRole('slider').fill('-1')
  await expect(page.getByText('-1u = (-2, -1)')).toBeVisible()
  await expect(page.getByText(/flips the vector/)).toBeVisible()
})

test('matrix lab presets load and report singular matrices', async ({ page }) => {
  await page.goto('/#/playground')
  await page.getByRole('button', { name: 'Matrix: transform the plane' }).click()
  await page.getByRole('button', { name: 'Rotate 90°' }).click()
  await expect(page.getByLabel('A row 2, column 1')).toHaveValue('1')
  await expect(page.getByText(/areas are multiplied by 1/)).toBeVisible()
  await page.getByRole('button', { name: 'Singular', exact: true }).click()
  await expect(page.getByText(/there is no inverse/)).toBeVisible()
})

test('hovering a point shows its coordinates', async ({ page }) => {
  await page.goto('/#/playground')
  const handle = page.locator('.mafs-movable-point').first()
  await handle.hover()
  await expect(page.locator('.coord-tooltip')).toHaveText('x = 2, y = 1')

  await page.mouse.move(0, 0)
  await expect(page.locator('.coord-tooltip')).toHaveCount(0)

  // the tip of the sum arrow is not draggable but still shows where it is
  const sumTip = page.locator('circle[fill="transparent"]').first()
  await sumTip.hover()
  await expect(page.locator('.coord-tooltip')).toHaveText('x = 3, y = 3')
})

test('the tooltip follows a point while it is dragged', async ({ page }) => {
  await page.goto('/#/playground')
  const handle = page.locator('.mafs-movable-point').first()
  const box = (await handle.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 200, y - 200, { steps: 10 })
  await expect(page.locator('.coord-tooltip')).toBeVisible()
  await expect(page.locator('.coord-tooltip')).not.toHaveText('x = 2, y = 1')
  await page.mouse.up()
})

test('a focused point shows its coordinates for keyboard users', async ({ page }) => {
  await page.goto('/#/playground')
  await page.locator('.mafs-movable-point').first().focus()
  await page.keyboard.press('ArrowUp')
  await expect(page.locator('.coord-tooltip')).toHaveText('x = 2, y = 1.5')
})
