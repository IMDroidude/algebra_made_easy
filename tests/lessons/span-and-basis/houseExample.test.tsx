import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HouseExample } from '../../../src/lessons/span-and-basis/HouseExample'
import { B_FULL, B_TWO, HOUSE_OUTPUT, mixOfBasis } from '../../../src/lessons/span-and-basis/houseMath'

describe('running example: what your features can describe', () => {
  it('rebuilds house B from the basis, and loses distance without e_dist', () => {
    expect(B_FULL).toEqual([1500, 3, 5])
    expect(B_TWO).toEqual([1500, 3, 0])
    // No house keeps its distance with only two directions.
    expect(mixOfBasis([1000, 2, 15], false)[2]).toBe(0)
  })

  it('prints exactly what NumPy 2.4 prints', () => {
    expect(HOUSE_OUTPUT).toBe('[1500    3    5]\n[1500    3    0]')
  })

  it('shows houses A and H, and adds distance on demand', async () => {
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: 'What your features can describe' })
    expect(box).toHaveTextContent('The best you can build for B is [1500, 3, 0]')
    expect(within(box).getByLabelText('Output')).toHaveTextContent('[1500 3 5] [1500 3 0]')
    expect(within(box).getAllByRole('row')).toHaveLength(3)
    expect(within(box).queryByText('distance to centre (km)')).toBeNull()
    expect(box).toHaveTextContent('A and H differ by just 100 sqft, yet H costs $60k less')
    await userEvent.click(within(box).getByLabelText(/third basis direction/))
    expect(within(box).getByText('distance to centre (km)')).toBeInTheDocument()
    expect(box).toHaveTextContent('A is 8 km out and H is 15 km out')
  })
})
