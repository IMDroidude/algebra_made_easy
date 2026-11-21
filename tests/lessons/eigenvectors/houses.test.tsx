import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/eigenvectors/Lesson'
import {
  HOUSE_CODE,
  HOUSE_COV,
  HOUSE_OUTPUT,
  HOUSE_PC1_SHARE,
  HOUSE_PCS,
  HOUSE_POINTS,
  standardise,
} from '../../../src/lessons/eigenvectors/houses'
import { fmt, fmtVec } from '../../../src/lib/format'

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

describe('running example: PCA on house size and bedrooms', () => {
  it('prints exactly what real NumPy 2 prints for HOUSE_CODE', () => {
    // Captured by running HOUSE_CODE in Python with NumPy 2.
    expect(HOUSE_OUTPUT).toBe(['[[1.    0.942]', ' [0.942 1.   ]]', '[0.058 1.942]', '[0.029 0.971]'].join('\n'))
    expect(HOUSE_CODE).toContain('np.linalg.eigh(C)')
  })

  it('standardise gives every column mean 0 and standard deviation 1', () => {
    const Z = standardise([
      [1, 10],
      [3, 30],
      [5, 20],
    ])
    for (let j = 0; j < 2; j++) {
      const col = Z.map((r) => r[j])
      const mean = col.reduce((s, x) => s + x, 0) / 3
      expect(mean).toBeCloseTo(0, 12)
      expect(col.reduce((s, x) => s + (x - mean) ** 2, 0) / 3).toBeCloseTo(1, 12)
    }
  })

  it('has the covariance, eigenvalues, directions and share shown', () => {
    expect(HOUSE_POINTS).toHaveLength(8)
    expect(HOUSE_COV.flat().map((x) => fmt(x, 3))).toEqual(['1', '0.942', '0.942', '1'])
    expect(HOUSE_PCS.map((p) => fmt(p.value, 3))).toEqual(['1.942', '0.058'])
    expect(fmtVec(HOUSE_PCS[0].vector)).toBe('(0.71, 0.71)')
    expect(fmtVec(HOUSE_PCS[1].vector)).toBe('(0.71, -0.71)')
    expect(fmt(100 * HOUSE_PC1_SHARE, 1)).toBe('97.1')
  })

  it('renders inside the lesson between steps 5 and 6', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: 'The main direction of the houses: overall size' })
    const s = within(box)
    expect(s.getByText(/Its eigenvalues are 1.942 and 0.058/)).toBeInTheDocument()
    expect(s.getByText(/97.1% of the spread/)).toBeInTheDocument()
    expect(s.getByText(/points along \(0.71, 0.71\) with variance 1.942/)).toBeInTheDocument()
    const step5 = screen.getByRole('region', { name: /^PCA/ })
    expect(step5.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const step6 = screen.getByRole('region', { name: /^Build matrices/ })
    expect(box.compareDocumentPosition(step6) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
