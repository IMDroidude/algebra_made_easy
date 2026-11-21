import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/matrix-multiplication/HouseExample'
import { Lesson } from '../../../src/lessons/matrix-multiplication/Lesson'
import {
  HOUSE_B,
  houseSnippet,
  oneMatrix,
  scoreText,
  swapped,
  twoSteps,
} from '../../../src/lessons/matrix-multiplication/runningExample'
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

describe('running example: convert units, then mix', () => {
  it('the NumPy snippet and its output match real NumPy', () => {
    const s = houseSnippet()
    expect(s.code).toBe(fixture.cases[0].code)
    expect(s.output).toBe(fixture.cases[0].numpy)
    expect(s.code).toContain('X = np.array([[1100, 2, 8],')
  })

  it('two steps and the single product matrix agree for every house', () => {
    HOUSES.forEach((h) => {
      twoSteps(h).forEach((x, k) => expect(oneMatrix(h)[k]).toBeCloseTo(x, 10))
      // By hand: m² + 10 per bedroom, bedrooms, −miles.
      expect(oneMatrix(h)[0]).toBeCloseTo(h.sqft * 0.0929 + 10 * h.bedrooms, 10)
      expect(oneMatrix(h)[2]).toBeCloseTo(-h.distanceKm * 0.6214, 10)
      // Swapped: the 10 per bedroom is added to sqft, then shrunk with it.
      expect(swapped(h)[0]).toBeCloseTo(0.0929 * (h.sqft + 10 * h.bedrooms), 10)
    })
  })

  it('table values', () => {
    expect(HOUSES.map((h) => scoreText(oneMatrix(h)[0]))).toEqual(
      ['122.19', '169.35', '93.61', '225.8', '140.77', '197.22', '262.96', '112.9'],
    )
    expect(HOUSES.map((h) => scoreText(swapped(h)[0]))).toEqual(
      ['104.05', '142.14', '84.54', '189.52', '122.63', '170.01', '226.68', '94.76'],
    )
  })

  it('renders the table, the text numbers and the snippet', () => {
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: 'Two steps on the houses, one matrix' })
    expect(box).toHaveTextContent(`house ${HOUSE_B.id} the space score is 169.35 either way`)
    expect(box).toHaveTextContent('scores 142.14 instead')
    const rowB = within(box).getByRole('row', { name: /Corner house/ })
    expect(rowB).toHaveTextContent('169.35')
    expect(rowB).toHaveTextContent('142.14')
    expect(within(box).getByLabelText('Output').textContent).toBe(fixture.cases[0].numpy)
  })

  it('appears once in the lesson, after Apply and before Practice', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: 'Two steps on the houses, one matrix' })
    const apply = document.querySelector('section[aria-labelledby="step-5"]')!
    const practice = document.querySelector('section[aria-labelledby="step-6"]')!
    expect(apply.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(box.compareDocumentPosition(practice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.querySelectorAll('section[aria-labelledby="running-example"]')).toHaveLength(1)
  })
})
