import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/real-world-positions/HouseExample'
import { Lesson } from '../../../src/lessons/real-world-positions/Lesson'
import { CHAIN, CUP_IN_GRIPPER, PRACTICE_GRIPPER, chainPositions, practiceAnswer } from '../../../src/lessons/real-world-positions/frames'
import {
  AVERAGE_HOUSE,
  HOUSE_FRAME_CODE,
  HOUSE_FRAME_OUTPUT,
  cellText,
  houseInFrame,
} from '../../../src/lessons/real-world-positions/houses'

const section = () => document.querySelector<HTMLElement>('section[aria-labelledby="running-example"]')!

describe('running example: an origin and units for the houses', () => {
  it('the average house, centring and square metres', () => {
    expect(AVERAGE_HOUSE).toEqual([1500, 2.625, 7.5])
    expect(houseInFrame(HOUSES[0], 'zero', 'sqft')).toEqual([1100, 2, 8])
    expect(houseInFrame(HOUSES[0], 'average', 'sqft')).toEqual([-400, -0.625, 0.5])
    expect(houseInFrame(HOUSES[0], 'zero', 'm2')).toEqual([102.2, 2, 8])
    expect(houseInFrame(HOUSES[0], 'average', 'm2')).toEqual([-37.2, -0.625, 0.5])
    expect(houseInFrame(HOUSES[6], 'zero', 'm2')[0]).toBe(223)
    expect(cellText(223, 0, 'm2')).toBe('223.0')
    expect(cellText(-0.625, 1, 'm2')).toBe('−0.625')
    // centring leaves every column averaging zero
    const centred = HOUSES.map((h) => houseInFrame(h, 'average', 'sqft'))
    for (let i = 0; i < 3; i++) expect(centred.reduce((s, r) => s + r[i], 0)).toBeCloseTo(0, 10)
  })

  it('prints exactly what NumPy prints (checked against NumPy 2)', () => {
    expect(HOUSE_FRAME_CODE).toContain('average = X.mean(axis=0)')
    expect(HOUSE_FRAME_CODE).toContain('size_m2 = np.round(X[:, 0] / 10.764, 1)')
    expect(HOUSE_FRAME_OUTPUT).toBe(
      [
        '[1500.       2.625    7.5  ]',
        '[-400.      -0.625    0.5  ]',
        '[102.2 139.4  83.6 185.8 120.8 167.2 223.   92.9]',
      ].join('\n'),
    )
  })

  it('renders the section; the origin and unit choices change the table', async () => {
    render(<HouseExample />)
    const s = within(section())
    expect(s.getByRole('heading', { name: 'Choosing an origin and units for the houses' })).toBeInTheDocument()
    expect(s.getByText('rows are examples')).toBeInTheDocument()
    const readout = section().querySelector('[aria-live]')!
    expect(readout).toHaveTextContent('House A is (1100, 2, 8), the raw numbers')
    await userEvent.click(s.getByRole('button', { name: 'The average house' }))
    expect(readout).toHaveTextContent('House A is (−400, −0.625, 0.5), measured from the average house.')
    await userEvent.click(s.getByRole('button', { name: 'Square metres' }))
    expect(readout).toHaveTextContent('House A is (−37.2, −0.625, 0.5)')
    expect(readout).toHaveTextContent('sqft ÷ 10.764')
    expect(s.getByRole('table')).toHaveTextContent('size (m²)')
  })
})

describe('frames inside frames: the robot arm', () => {
  it('adds one offset per frame, from gripper to map', () => {
    expect(chainPositions()).toEqual([
      [1, 0],
      [5, 3],
      [10, 5],
      [110, 45],
    ])
    expect(CUP_IN_GRIPPER).toEqual([1, 0])
    expect(CHAIN.map((c) => c.offset)).toEqual([
      [4, 3],
      [5, 2],
      [100, 40],
    ])
    expect(PRACTICE_GRIPPER).toEqual([2, 2])
    expect(practiceAnswer()).toEqual([8, 4])
  })

  it('the Robot arm tab shows the chain and ticks the check when answered', async () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const apply = within(document.querySelector<HTMLElement>('section[aria-labelledby="step-5"]')!)
    await userEvent.click(apply.getByRole('button', { name: 'Robot arm' }))
    expect(apply.getByText(/frames inside frames/)).toBeInTheDocument()
    const chain = apply.getByRole('list', { name: "The cup's coordinates in each frame" })
    expect(chain).toHaveTextContent('(110, 45) = (10, 5) + (100, 40), where the room corner sits')
    const x = apply.getByRole('spinbutton', { name: 'cup x in the room' })
    const y = apply.getByRole('spinbutton', { name: 'cup y in the room' })
    await userEvent.clear(x)
    await userEvent.type(x, '8')
    await userEvent.clear(y)
    await userEvent.type(y, '4')
    expect(apply.getByText(/^Right: \(1, 0\) \+ \(2, 2\) \+ \(5, 2\) = \(8, 4\)/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choosing an origin and units for the houses' })).toBeInTheDocument()
  })
})
