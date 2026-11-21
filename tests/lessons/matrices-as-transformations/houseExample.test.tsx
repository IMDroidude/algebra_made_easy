import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HouseExample } from '../../../src/lessons/matrices-as-transformations/HouseExample'
import { HOUSE_OUTPUT, IN_M2, housesAt } from '../../../src/lessons/matrices-as-transformations/houseMath'

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

describe('running example: one matrix moves every house', () => {
  it('turns (sqft, bedrooms) into (m², bedrooms)', () => {
    expect(IN_M2[0][0]).toBeCloseTo(102.19, 9)
    expect(IN_M2.map((p) => p[1])).toEqual([2, 3, 1, 4, 2, 3, 4, 2])
    expect(housesAt(0)[6]).toEqual([2400, 4])
    expect(housesAt(1)).toEqual(IN_M2)
  })

  it('prints exactly what NumPy 2.4 prints', () => {
    expect(HOUSE_OUTPUT).toBe(
      [
        '[[102.19   2.  ]',
        ' [139.35   3.  ]',
        ' [ 83.61   1.  ]',
        ' [185.8    4.  ]',
        ' [120.77   2.  ]',
        ' [167.22   3.  ]',
        ' [222.96   4.  ]',
        ' [ 92.9    2.  ]]',
      ].join('\n'),
    )
  })

  it('applies A to every house when the button is pressed', async () => {
    // Reduced motion makes the tween jump straight to the end.
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<HouseExample />)
    const box = screen.getByRole('region', { name: 'One matrix moves every house' })
    expect(box).toHaveTextContent('Before A: sizes run from 900 to 2400 sqft, bedrooms from 1 to 4.')
    expect(within(box).getAllByRole('row')[1]).toHaveTextContent('A Garden flat11002102.19')
    await act(() => userEvent.click(within(box).getByRole('button', { name: 'Apply A to every house' })))
    expect(box).toHaveTextContent('sizes now run from 83.61 to 222.96 m²')
    expect(within(box).getByRole('button', { name: 'Back to sqft' })).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
