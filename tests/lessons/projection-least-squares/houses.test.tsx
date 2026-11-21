import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/projection-least-squares/Lesson'
import {
  HOUSE_A,
  HOUSE_CODE,
  HOUSE_MAX_GAP,
  HOUSE_OUTPUT,
  HOUSE_PRED,
  HOUSE_RESID,
  HOUSE_SSE,
  HOUSE_WEIGHTS,
  SIZE_FIT,
  SIZE_SSE,
} from '../../../src/lessons/projection-least-squares/houses'
import { fmt } from '../../../src/lib/format'

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

describe('running example: regression on the houses', () => {
  it('prints exactly what real NumPy 2 prints for HOUSE_CODE', () => {
    // Captured by running HOUSE_CODE in Python with NumPy 2.
    expect(HOUSE_OUTPUT).toBe(
      ['[ 0.219  1.142 -5.231 62.858]', '[264.2 368.6 250.6 442.7 334.2 413.4 561.6 205.7]', '41.5'].join('\n'),
    )
    expect(HOUSE_CODE).toContain('np.column_stack([X, np.ones(len(X))])')
    expect(HOUSE_CODE).toContain('np.linalg.lstsq(A, y)')
  })

  it('has the weights, residuals and comparison numbers shown', () => {
    expect(HOUSE_WEIGHTS.map((w) => fmt(w, 3))).toEqual(['0.219', '1.142', '-5.231', '62.858'])
    expect(HOUSE_PRED.map((p) => fmt(p, 1))).toEqual(['264.2', '368.6', '250.6', '442.7', '334.2', '413.4', '561.6', '205.7'])
    expect(HOUSE_RESID.map((r) => fmt(r, 1))).toEqual(['0.8', '1.4', '-2.6', '-2.7', '0.8', '4.6', '-1.6', '-0.7'])
    expect(fmt(HOUSE_MAX_GAP, 1)).toBe('4.6')
    expect(fmt(HOUSE_SSE, 1)).toBe('41.5')
    expect(fmt(SIZE_FIT.slope, 3)).toBe('0.217')
    expect(fmt(SIZE_FIT.intercept, 1)).toBe('29.8')
    expect(fmt(SIZE_SSE, 1)).toBe('3693.9')
  })

  it('residuals are perpendicular to every column (normal equations hold)', () => {
    // Aᵀr ≈ 0: Σ residual × column is zero for each feature and for the bias column.
    for (let j = 0; j < 4; j++) {
      const dot = HOUSE_A.reduce((s, row, i) => s + row[j] * HOUSE_RESID[i], 0)
      expect(Math.abs(dot)).toBeLessThan(1e-6)
    }
  })

  it('renders inside the lesson after the Apply step with the numbers', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: "Predict a house's price from all three features" })
    const s = within(box)
    expect(s.getByText(/within \$4.6k of the real price/)).toBeInTheDocument()
    expect(s.getByText(/price ≈ 0.217·sqft \+ 29.8, with a sum of squared residuals of 3693.9/)).toBeInTheDocument()
    expect(s.getByText(/gives bedrooms only 1.14, not 15/)).toBeInTheDocument()
    expect(s.getByText('442.7')).toBeInTheDocument()
    expect(s.getByText('-2.7')).toBeInTheDocument()
    // It sits between step 5 and step 6.
    const step5 = document.querySelector('section[aria-labelledby="step-5"]')!
    const step6 = document.querySelector('section[aria-labelledby="step-6"]')!
    expect(step5.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(box.compareDocumentPosition(step6) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
