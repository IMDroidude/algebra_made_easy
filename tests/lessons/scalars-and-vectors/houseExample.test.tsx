import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HouseExample } from '../../../src/lessons/scalars-and-vectors/HouseExample'
import {
  AVERAGE_HOUSE,
  B_MINUS_A,
  HOUSE_OUTPUT,
  HOUSE_SUM,
  TWO_A,
} from '../../../src/lessons/scalars-and-vectors/houseMath'

describe('running example: houses are vectors', () => {
  it('computes b − a, 2a and the average house', () => {
    expect(B_MINUS_A).toEqual([400, 1, -3])
    expect(TWO_A).toEqual([2200, 4, 16])
    expect(HOUSE_SUM).toEqual([12000, 21, 60])
    expect(AVERAGE_HOUSE).toEqual([1500, 2.625, 7.5])
  })

  it('prints exactly what NumPy 2.4 prints', () => {
    // Real output of the lesson snippet, run with the project's NumPy.
    expect(HOUSE_OUTPUT).toBe('[400   1  -3]\n[2200    4   16]\n[1500.       2.625    7.5  ]')
  })

  it('shows the numbers in the text, equation and code', () => {
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: 'Houses are vectors too' })
    expect(box).toHaveTextContent('400 sqft bigger, 1 more bedroom, and 3 km closer to the centre')
    expect(box).toHaveTextContent('2a = [2200, 4, 16]')
    expect(box).toHaveTextContent('The total is [12000, 21, 60], so the average house is [1500, 2.625, 7.5]')
    expect(within(box).getByLabelText('Output')).toHaveTextContent('[400 1 -3] [2200 4 16] [1500. 2.625 7.5 ]')
  })
})
