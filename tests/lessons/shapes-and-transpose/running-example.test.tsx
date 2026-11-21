import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/shapes-and-transpose/HouseExample'
import { Lesson } from '../../../src/lessons/shapes-and-transpose/Lesson'
import { houseSnippet, predicted, priceText, shapeCheck } from '../../../src/lessons/shapes-and-transpose/runningExample'
import type { Choice } from '../../../src/lessons/shapes-and-transpose/runningExample'
import fixture from './house-numpy.json'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

const TITLE = 'Eight houses, three features: X is 8 × 3'

describe('running example: X @ w, X @ W.T and X @ W', () => {
  it.each(fixture.cases.map((c) => [c.choice, c] as const))('%s: snippet matches real NumPy', (_, c) => {
    const s = houseSnippet(c.choice as Choice)
    expect(s.code).toBe(c.code)
    expect(s.output).toBe(c.numpy)
  })

  it('predicted prices are w · x + 60 for every house', () => {
    HOUSES.forEach((h) => {
      expect(predicted(h)).toBeCloseTo(0.2 * h.sqft + 15 * h.bedrooms - 6 * h.distanceKm + 60, 10)
    })
    expect(HOUSES.map(priceText)).toEqual(['262', '375', '243', '448', '332', '411', '564', '200'])
  })

  it('the shape checker agrees with NumPy', () => {
    expect(shapeCheck('w').text).toContain('shape (8,)')
    expect(shapeCheck('WT').check).toEqual({ ok: true, result: [8, 2] })
    expect(shapeCheck('W').check?.ok).toBe(false)
    expect(fixture.cases[2].numpy).toContain('(size 2 is different from 3)')
  })

  it('buttons switch the check and the snippet', async () => {
    const user = userEvent.setup()
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: TITLE })
    const check = within(box).getByTestId('house-shape-check')
    const out = () => within(box).getByLabelText('Output').textContent
    expect(check).toHaveTextContent('X @ w: (8, 3) @ (3,)')
    expect(out()).toBe(fixture.cases[0].numpy)
    expect(within(box).getByRole('row', { name: /Corner house/ })).toHaveTextContent('375')
    await user.click(within(box).getByRole('button', { name: 'X @ W.T' }))
    expect(check).toHaveTextContent('shape (8, 2)')
    expect(out()).toBe(fixture.cases[1].numpy)
    await user.click(within(box).getByRole('button', { name: 'X @ W' }))
    expect(check).toHaveTextContent('NumPy refuses')
    expect(out()).toBe(fixture.cases[2].numpy)
  })

  it('appears once in the lesson, after Apply and before Practice', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: TITLE })
    const apply = document.querySelector('section[aria-labelledby="step-5"]')!
    const practice = document.querySelector('section[aria-labelledby="step-6"]')!
    expect(apply.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(box.compareDocumentPosition(practice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
