import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/coordinate-plane/HouseExample'
import {
  PRICE_RANGE,
  SQFT_RANGE,
  housePlaneCode,
  housePoint,
  housePointText,
  topRightHouse,
} from '../../../src/lessons/coordinate-plane/houses'

const section = () => document.querySelector<HTMLElement>('section[aria-labelledby="running-example"]')!

describe('running example: houses on a plane', () => {
  it('draws each house at (size, price), all inside the visible ranges', () => {
    expect(housePoint(HOUSES[0])).toEqual([1100, 265])
    HOUSES.forEach((h) => {
      const [x, y] = housePoint(h)
      expect(x).toBeGreaterThan(SQFT_RANGE[0])
      expect(x).toBeLessThan(SQFT_RANGE[1])
      expect(y).toBeGreaterThan(PRICE_RANGE[0])
      expect(y).toBeLessThan(PRICE_RANGE[1])
    })
  })

  it('house G is the top-right point: the biggest and the dearest', () => {
    const g = topRightHouse()!
    expect(g.id).toBe('G')
    expect(housePointText(g)).toBe('G (2400, 560)')
  })

  it('prints exactly what NumPy prints (checked against NumPy 2)', () => {
    expect(housePlaneCode(6).output).toBe('(8, 2)\n[2400  560]')
    expect(housePlaneCode(0).output).toBe('(8, 2)\n[1100  265]')
    expect(housePlaneCode(6).code).toContain('points = np.column_stack([X[:, 0], y])')
  })

  it('renders the section with G selected, and switches house', async () => {
    render(<HouseExample />)
    const s = within(section())
    expect(s.getByRole('heading', { name: 'Eight houses on a plane' })).toBeInTheDocument()
    const readout = section().querySelector('[aria-live]')!
    expect(readout).toHaveTextContent('House G (Townhouse) is the point (2400, 560)')
    expect(readout).toHaveTextContent('It is the top-right point')
    await userEvent.click(s.getByRole('button', { name: 'A' }))
    expect(readout).toHaveTextContent('House A (Garden flat) is the point (1100, 265): 1100 sqft along x, $265k up y.')
    expect(readout).not.toHaveTextContent('top-right')
    expect(s.getByText(/shows only sizes from 600 to 2600 and prices from 150 to 600/)).toBeInTheDocument()
  })
})
