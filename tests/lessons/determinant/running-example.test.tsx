import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/determinant/HouseExample'
import { Lesson } from '../../../src/lessons/determinant/Lesson'
import {
  FLAT,
  KEEP,
  collidingPairs,
  houseSnippet,
  output,
  outputText,
} from '../../../src/lessons/determinant/runningExample'
import type { Which } from '../../../src/lessons/determinant/runningExample'
import { det2 } from '../../../src/linalg'
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

const TITLE = 'A feature transform that loses houses'
const ids = (pairs: ReturnType<typeof collidingPairs>) => pairs.map(([p, q]) => p.id + q.id)

describe('running example: a det-0 feature transform', () => {
  it.each(fixture.cases.map((c) => [c.which, c] as const))('%s: snippet matches real NumPy', (_, c) => {
    const s = houseSnippet(c.which as Which)
    expect(s.code).toBe(c.code)
    expect(s.output).toBe(c.numpy)
  })

  it('T has det 0 and merges three pairs; S has det 1 and merges none', () => {
    expect(det2(FLAT)).toBe(0)
    expect(det2(KEEP)).toBe(1)
    expect(ids(collidingPairs(FLAT))).toEqual(['AC', 'BE', 'DF'])
    expect(collidingPairs(KEEP)).toEqual([])
    // Houses A and C both have 700 sqft of spare space.
    expect(output(FLAT, HOUSES[0])).toEqual([700, 1400])
    expect(output(FLAT, HOUSES[2])).toEqual([700, 1400])
    expect(HOUSES.map((h) => outputText(KEEP, h))).toEqual(
      HOUSES.map((h) => `(${h.sqft - 200 * h.bedrooms}, ${h.bedrooms})`),
    )
  })

  it('the buttons switch the transform, table and snippet', async () => {
    const user = userEvent.setup()
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: TITLE })
    expect(box).toHaveTextContent('both have 700 sqft of spare space')
    const readout = within(box).getByTestId('house-det')
    expect(readout).toHaveTextContent('det T = 0. 3 pairs of houses land on the same output: A and C, B and E, D and F.')
    const rowA = () => within(box).getByRole('row', { name: /Garden flat/ })
    expect(rowA()).toHaveTextContent('(700, 1400)')
    expect(rowA()).toHaveTextContent('C')
    expect(within(box).getByLabelText('Output').textContent).toBe(fixture.cases[0].numpy)
    await user.click(within(box).getByRole('button', { name: /^S:/ }))
    expect(readout).toHaveTextContent('det S = 1. All 8 houses land on different outputs.')
    expect(rowA()).toHaveTextContent('(700, 2)')
    expect(within(box).getByLabelText('Output').textContent).toBe(fixture.cases[1].numpy)
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
