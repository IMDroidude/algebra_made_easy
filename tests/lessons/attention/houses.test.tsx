import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/attention/Lesson'
import {
  HOUSE_CODE,
  HOUSE_ESTIMATE,
  HOUSE_KEYS,
  HOUSE_OUTPUT,
  HOUSE_QUERY,
  HOUSE_SCORES,
  HOUSE_WEIGHTS,
  TOP_TWO,
} from '../../../src/lessons/attention/houses'
import { prices } from '../../../src/data/houses'
import { fmt } from '../../../src/lib/format'

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

describe('running example: similar houses vote on the price', () => {
  it('prints exactly what real NumPy 2 prints for HOUSE_CODE', () => {
    // Captured by running HOUSE_CODE in Python with NumPy 2.
    expect(HOUSE_OUTPUT).toBe(['[0.01 0.04 0.   0.38 0.01 0.09 0.44 0.02]', '480.0'].join('\n'))
    expect(HOUSE_CODE).toContain('q = (np.array([2200, 4, 10]) - mu) / sd')
  })

  it('has the scaled query, scores, weights and estimate shown', () => {
    expect(HOUSE_QUERY.map((x) => fmt(x, 2))).toEqual(['1.41', '1.39', '0.6'])
    expect(HOUSE_KEYS).toHaveLength(8)
    expect(HOUSE_SCORES.map((x) => fmt(x, 2))).toEqual(['-1.12', '0.09', '-2.76', '2.31', '-1.21', '0.92', '2.47', '-0.7'])
    expect(HOUSE_WEIGHTS.map((x) => fmt(x, 2))).toEqual(['0.01', '0.04', '0', '0.38', '0.01', '0.09', '0.44', '0.02'])
    expect(HOUSE_WEIGHTS.reduce((s, w) => s + w, 0)).toBeCloseTo(1, 12)
    expect(HOUSE_ESTIMATE).toBeCloseTo(HOUSE_WEIGHTS.reduce((s, w, i) => s + w * prices()[i], 0), 10)
    expect(fmt(HOUSE_ESTIMATE, 1)).toBe('480')
    expect(TOP_TWO).toEqual(['G', 'D'])
  })

  it('renders inside the lesson between steps 5 and 6', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: 'Similar houses vote on the price' })
    const s = within(box)
    expect(s.getByText(/A buyer wants about 2200 sqft, 4 bedrooms, 10 km/)).toBeInTheDocument()
    expect(s.getByText(/The Townhouse \(G\) and the Family home \(D\) get most of the weight/)).toBeInTheDocument()
    expect(s.getByText(/the estimate, \$480k, lands between their prices/)).toBeInTheDocument()
    expect(s.getByText('0.44')).toBeInTheDocument()
    expect(s.getByText('2.31')).toBeInTheDocument()
    expect(s.getByText(/learns matrices W_Q, W_K and W_V/)).toBeInTheDocument()
    const step5 = document.querySelector('section[aria-labelledby="step-5"]')!
    const step6 = document.querySelector('section[aria-labelledby="step-6"]')!
    expect(step5.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(box.compareDocumentPosition(step6) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
