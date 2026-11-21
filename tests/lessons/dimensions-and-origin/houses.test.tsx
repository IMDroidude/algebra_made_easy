import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { HouseExample } from '../../../src/lessons/dimensions-and-origin/HouseExample'
import { Lesson } from '../../../src/lessons/dimensions-and-origin/Lesson'
import { HOUSE_A, LADDER, houseADrawing, houseAText, housesCode } from '../../../src/lessons/dimensions-and-origin/model'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const section = () => document.querySelector<HTMLElement>('section[aria-labelledby="running-example"]')!

describe('running example: house A as a point', () => {
  it('adds one number per feature', () => {
    expect(houseAText(1)).toBe('(1100)')
    expect(houseAText(2)).toBe('(1100, 2)')
    expect(houseAText(3)).toBe('(1100, 2, 8)')
    expect(HOUSE_A.priceK).toBe(265)
    houseADrawing(3).forEach((v) => {
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThanOrEqual(4)
    })
  })

  it('prints exactly what NumPy prints (checked against NumPy 2)', () => {
    const { code, output } = housesCode()
    expect(code).toContain('X = np.array([[1100, 2, 8],')
    expect(code).toContain('print(X[0].shape)')
    expect(output).toBe('[1100    2    8]\n(3,)\n(8, 3)\n265')
  })

  it('renders the section and steps through the features', async () => {
    render(<HouseExample />)
    const s = within(section())
    expect(s.getByRole('heading', { name: 'One house, one more number at a time' })).toBeInTheDocument()
    expect(section().querySelector('[aria-live]')).toHaveTextContent('House A is the point (1100): 1 number, so a point in 1 dimension.')
    await userEvent.click(s.getByRole('button', { name: '+ distance' }))
    expect(section().querySelector('[aria-live]')).toHaveTextContent('House A is the point (1100, 2, 8): 3 numbers, so a point in 3 dimensions.')
    expect(s.getByText(/The price, 265 \(\$k\), would be a 4th number/)).toBeInTheDocument()
  })
})

describe('the dimension ladder', () => {
  it('goes 1D, 2D, 3D, n-D, and is shown in the Apply step of the lesson', () => {
    expect(LADDER.map((r) => r.dims)).toEqual(['1D', '2D', '3D', 'n-D'])
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const apply = within(document.querySelector<HTMLElement>('section[aria-labelledby="step-5"]')!)
    const table = apply.getByRole('table', { name: 'The dimension ladder' })
    expect(within(table).getByText('x = 5')).toBeInTheDocument()
    expect(within(table).getByText('(x₁, x₂, …, xₙ)')).toBeInTheDocument()
    expect(apply.getByText('Past 3 dimensions it is hard to picture, but the same rules apply.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'One house, one more number at a time' })).toBeInTheDocument()
  })
})
