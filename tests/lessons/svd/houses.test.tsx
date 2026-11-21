import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/svd/Lesson'
import {
  BIG_FULL,
  BIG_RANK2,
  HOUSE_CODE,
  HOUSE_DIRECTIONS,
  HOUSE_KEPT,
  HOUSE_OUTPUT,
  HOUSE_S,
  HOUSE_STORAGE,
  HOUSE_TOTAL,
  HOUSE_Z,
} from '../../../src/lessons/svd/houses'
import { fmt } from '../../../src/lib/format'
import { frobenius } from '../../../src/linalg/svd'

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

describe('running example: SVD of the house matrix', () => {
  it('prints exactly what real NumPy 2 prints for HOUSE_CODE', () => {
    // Captured by running HOUSE_CODE in Python with NumPy 2.
    expect(HOUSE_OUTPUT).toBe(
      ['[4.03 2.74 0.5 ]', '[0.676 0.989 1.   ]', '[[0.66 0.69 0.28]', ' [0.32 0.08 0.95]]'].join('\n'),
    )
    expect(HOUSE_CODE).toContain('np.linalg.svd(Z, full_matrices=False)')
  })

  it('has the singular values, kept spread, directions and storage shown', () => {
    expect(HOUSE_S.map((s) => fmt(s, 2))).toEqual(['4.03', '2.74', '0.5'])
    // Standardised 8 × 3 data: total spread is 8 · 3 = 24, and Σσ² equals it.
    expect(HOUSE_TOTAL).toBeCloseTo(24, 10)
    expect(frobenius(HOUSE_Z) ** 2).toBeCloseTo(24, 10)
    expect(HOUSE_KEPT.map((k) => fmt(100 * k, 1))).toEqual(['67.6', '98.9', '100'])
    expect(HOUSE_DIRECTIONS.map((r) => r.map((x) => fmt(x, 2)))).toEqual([
      ['0.66', '0.69', '0.28'],
      ['0.32', '0.08', '0.95'],
    ])
    expect(HOUSE_STORAGE).toEqual([12, 24, 36])
    expect([BIG_RANK2, BIG_FULL]).toEqual([20008, 30000])
  })

  it('renders inside the lesson between steps 5 and 6', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: 'How many ideas are in the house table?' })
    const s = within(box)
    expect(s.getByText(/The singular values are 4.03, 2.74, 0.5\./)).toBeInTheDocument()
    expect(s.getByText('98.9%')).toBeInTheDocument()
    expect(s.getByText(/mixes size \(0.66\) and bedrooms \(0.69\) with a little distance \(0.28\)/)).toBeInTheDocument()
    expect(s.getByText(/mostly distance \(0.95\)/)).toBeInTheDocument()
    expect(s.getByText(/full table is 24 numbers, rank 1 stores 12 \(and keeps 67.6%\), and rank 2 stores 24/)).toBeInTheDocument()
    expect(s.getByText(/for 10,000 houses, rank 2 stores 20,008 numbers instead of 30,000/)).toBeInTheDocument()
    const step5 = document.querySelector('section[aria-labelledby="step-5"]')!
    const step6 = document.querySelector('section[aria-labelledby="step-6"]')!
    expect(step5.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(box.compareDocumentPosition(step6) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
