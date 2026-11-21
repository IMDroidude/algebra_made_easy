import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FunctionMachine } from '../../../src/lessons/functions/FunctionMachine'

describe('FunctionMachine', () => {
  it('shows the working for f(3) with 2x + 1', () => {
    render(<FunctionMachine rule={{ m: 2, b: 1 }} input={3} />)
    expect(
      screen.getByRole('img', { name: 'Function machine f: input 3, times 2 gives 6, + 1 gives output 7' }),
    ).toBeInTheDocument()
    expect(screen.getByText('f(3) = 2 × 3 + 1 = 7')).toBeInTheDocument()
  })

  it('brackets negative inputs and writes subtraction for a negative b', () => {
    render(<FunctionMachine rule={{ m: 0.5, b: -0.5 }} input={-3} />)
    expect(screen.getByText('f(−3) = 0.5 × (−3) − 0.5 = −2')).toBeInTheDocument()
  })
})
