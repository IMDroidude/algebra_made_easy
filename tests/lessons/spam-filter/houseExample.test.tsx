import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HouseExample } from '../../../src/lessons/spam-filter/HouseExample'
import {
  FISHER_VERDICTS,
  HOUSE_B,
  HOUSE_CENTRES,
  HOUSE_D,
  HOUSE_FISHER,
  HOUSE_FISHER_B,
  HOUSE_MID,
  PLAIN_VERDICTS,
  rightCount,
} from '../../../src/lessons/spam-filter/runningExample'

const r2 = (x: number) => Math.round(x * 100) / 100

describe('running example: the recipe on the houses', () => {
  it('centres, direction, midpoint and threshold', () => {
    expect(HOUSE_CENTRES.normal.map(r2)).toEqual([1.16, 6.6])
    expect(HOUSE_CENTRES.spam.map(r2)).toEqual([2.07, 9])
    expect(HOUSE_D.map(r2)).toEqual([0.91, 2.4])
    expect(HOUSE_MID.map(r2)).toEqual([1.61, 7.8])
    expect(r2(HOUSE_B)).toBe(20.18)
  })

  it('the plain recipe gets 5 of 8, wrong on A, G and H', () => {
    expect(PLAIN_VERDICTS.map((v) => r2(v.score))).toEqual([20.2, 13.36, 5.62, 30.61, 8.38, 23.23, 16.58, 36.91])
    expect(rightCount(PLAIN_VERDICTS)).toBe(5)
    expect(PLAIN_VERDICTS.filter((v) => !v.right).map((v) => v.house.id)).toEqual(['A', 'G', 'H'])
  })

  it('the scatter correction gets all 8', () => {
    expect(HOUSE_FISHER.map(r2)).toEqual([2.57, 0.07])
    expect(r2(HOUSE_FISHER_B)).toBe(4.69)
    expect(FISHER_VERDICTS.map((v) => r2(v.score))).toEqual([3.38, 4.21, 2.46, 5.98, 3.55, 5.26, 6.59, 3.61])
    expect(rightCount(FISHER_VERDICTS)).toBe(8)
  })

  it('shows the honest result, and the corrected one behind the toggle', async () => {
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: 'The same recipe sorts the houses' })
    expect(box).toHaveTextContent('Honest result: only 5 of 8, wrong on A, G, H')
    expect(box).toHaveTextContent('2 to 15 km while sizes only run from 0.9 to 2.4')
    expect(box).toHaveTextContent('(9 km against 6.6)')
    expect(box).toHaveTextContent('threshold 20.18: 5 of 8 right')
    const rows = within(box).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('A Garden flat11008265no20.2yes✗ wrong')
    expect(within(box).getByLabelText('Output')).toHaveTextContent('5 of 8 right')
    await userEvent.click(within(box).getByLabelText(/scatter correction/))
    expect(box).toHaveTextContent('With the correction, 8 of 8')
    expect(box).toHaveTextContent('w = (2.57, 0.07)')
    expect(rows[7].textContent).toBeDefined()
    expect(within(box).getAllByRole('row')[7]).toHaveTextContent('G Townhouse24006560yes6.59yes✓')
    expect(within(box).getByLabelText('Output')).toHaveTextContent('8 of 8 right')
  })
})
