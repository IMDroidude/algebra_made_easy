import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { HOUSES, featureMatrix } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/inverse-rank-null-space/HouseExample'
import { Lesson } from '../../../src/lessons/inverse-rank-null-space/Lesson'
import {
  SOLVE_HOUSES,
  areaText,
  houseSnippet,
  rank,
  ruleFigures,
  solve,
  withArea,
} from '../../../src/lessons/inverse-rank-null-space/runningExample'
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

const TITLE = 'A column that adds nothing, and weights from three houses'

describe('running example: a redundant column and exact weights', () => {
  it('the NumPy snippet matches real NumPy (matrix_rank and solve)', () => {
    const s = houseSnippet()
    expect(s.code).toBe(fixture.cases[0].code)
    expect(s.output).toBe(fixture.cases[0].numpy)
    expect(fixture.cases[0].numpy).toBe('(8, 4)\n3 3\n[ 0.2 15.  -6. ]')
  })

  it('rank: 3 for X, still 3 with the m² column, and the helper sees real drops', () => {
    expect(rank(featureMatrix())).toBe(3)
    expect(rank(withArea())).toBe(3)
    expect(rank([[1, 2], [2, 4]])).toBe(1)
    expect(rank([[0, 0], [0, 0]])).toBe(0)
    expect(rank(featureMatrix(SOLVE_HOUSES))).toBe(3)
  })

  it('solve recovers the rule from houses A, B, C', () => {
    expect(ruleFigures()).toEqual([202, 315, 183])
    const w = solve(featureMatrix(SOLVE_HOUSES), ruleFigures())
    ;[0.2, 15, -6].forEach((x, k) => expect(w[k]).toBeCloseTo(x, 10))
    expect(HOUSES.map(areaText)).toEqual(['102.19', '139.35', '83.61', '185.8', '120.77', '167.22', '222.96', '92.9'])
  })

  it('renders the numbers it states', () => {
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: TITLE })
    expect(within(box).getByTestId('house-rank')).toHaveTextContent('3')
    expect(box).toHaveTextContent('figures 202, 315, 183')
    expect(box).toHaveTextContent('w = (0.2, 15, -6)')
    expect(box).toHaveTextContent('$0.2k per sqft, $15k per bedroom and $6k less per km')
    expect(within(box).getByRole('row', { name: /Corner house/ })).toHaveTextContent('139.35')
    expect(within(box).getByLabelText('Output').textContent).toBe(fixture.cases[0].numpy)
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
