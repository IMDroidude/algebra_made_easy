import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { FRONT_VIEW, SIDE_VIEW, TOP_VIEW } from '../../../src/linalg/project3d'
import { HouseExample } from '../../../src/lessons/3d-space/HouseExample'
import { Lesson } from '../../../src/lessons/3d-space/Lesson'
import { DROP_WALL, HOUSE_AXIS_TICKS, dropCode, keptText, roomPoint } from '../../../src/lessons/3d-space/houses'
import { RELATION, RELATION_OFF, RELATION_ON, relationSum, relationValue } from '../../../src/lessons/3d-space/planes'
import { SIZE } from '../../../src/lessons/3d-space/cube'

const section = () => document.querySelector<HTMLElement>('section[aria-labelledby="running-example"]')!

describe('running example: houses in the room', () => {
  it('scales every house to fit inside the room', () => {
    expect(roomPoint(HOUSES[0], 'none')).toEqual([2.2, 2, 8 / 3])
    HOUSES.forEach((h) => roomPoint(h, 'none').forEach((v) => expect(v).toBeLessThanOrEqual(SIZE)))
    expect([1, 2, 5].map(HOUSE_AXIS_TICKS.x)).toEqual(['500', '1000', '2500'])
    expect([1, 5].map(HOUSE_AXIS_TICKS.z)).toEqual(['3', '15'])
  })

  it('dropping a feature puts the house on a wall and keeps two numbers', () => {
    expect(roomPoint(HOUSES[0], 2)).toEqual([2.2, 2, 0])
    expect(roomPoint(HOUSES[0], 1)).toEqual([2.2, 0, 8 / 3])
    expect(keptText(HOUSES[0], 'none')).toBe('(1100, 2, 8)')
    expect(keptText(HOUSES[0], 2)).toBe('(1100, 2)')
    expect(keptText(HOUSES[0], 0)).toBe('(2, 8)')
    expect(DROP_WALL[2].view).toEqual(FRONT_VIEW)
    expect(DROP_WALL[1].view).toEqual(TOP_VIEW)
    expect(DROP_WALL[0].view).toEqual(SIDE_VIEW)
  })

  it('prints exactly what NumPy prints (checked against NumPy 2)', () => {
    expect(dropCode('none').output).toBe('(8, 3)\n[1100    2    8]')
    expect(dropCode(2).output).toBe('(8, 2)\n[1100    2]')
    expect(dropCode(2).code).toContain('flat = X[:, [0, 1]]')
    expect(dropCode(1).output).toBe('(8, 2)\n[1100    8]')
    expect(dropCode(0).output).toBe('(8, 2)\n[2 8]')
  })

  it('renders the section; dropping distance updates the text and the code', async () => {
    render(<HouseExample />)
    const s = within(section())
    expect(s.getByRole('heading', { name: 'The houses in the room' })).toBeInTheDocument()
    const readout = section().querySelector('[aria-live]')!
    expect(readout).toHaveTextContent('house A is at (1100, 2, 8), 1100 sqft, 2 bedrooms, 8 km out.')
    expect(s.getByText('size')).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: 'Drop distance' }))
    expect(readout).toHaveTextContent('Distance dropped: every house falls flat onto the back wall. House A is now just (1100, 2).')
    expect(readout).toHaveTextContent('Front view')
    expect(s.getByText(/Houses A and H are 7 km apart in distance/)).toBeInTheDocument()
    expect(section().textContent).toContain('[1100    2]')
  })
})

describe('a plane as a relationship', () => {
  it('2x + 3y + z = 10 holds for (1, 2, 2) and not for (1, 1, 1)', () => {
    expect(RELATION).toEqual({ a: 2, b: 3, c: 1, d: 10 })
    expect(relationValue(RELATION_ON)).toBe(10)
    expect(relationValue(RELATION_OFF)).toBe(6)
    expect(relationSum(RELATION_ON)).toBe('2·1 + 3·2 + 2')
  })

  it('is written out in the planes section of the lesson', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const planes = document.querySelector<HTMLElement>('section[aria-labelledby="planes-heading"]')!
    expect(planes.textContent).toContain('2x + 3y + z = 10')
    expect(planes.textContent).toContain('(1, 2, 2) is on it: 2·1 + 3·2 + 2 = 10.')
    expect(planes.textContent).toContain('(1, 1, 1) is not: 2·1 + 3·1 + 1 = 6')
    expect(within(planes).getByText('separate two classes')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The houses in the room' })).toBeInTheDocument()
  })
})
