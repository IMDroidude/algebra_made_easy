import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/shapes-and-transpose/Lesson'
import { GridInput } from '../../../src/lessons/shapes-and-transpose/GridInput'
import { ShapePicker } from '../../../src/lessons/shapes-and-transpose/ShapePicker'
import { TransposeExplorer } from '../../../src/lessons/shapes-and-transpose/TransposeExplorer'
import type { PickerState } from '../../../src/lessons/shapes-and-transpose/shapes'
import type { Matrix } from '../../../src/linalg'

// Mafs measures its container; jsdom has no ResizeObserver, so give it a silent one.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function PickerHarness() {
  const [s, setS] = useState<PickerState>({ a: [2, 3], b: [3, 4], transposeB: false })
  return <ShapePicker state={s} onChange={setS} />
}

describe('ShapePicker', () => {
  it('shows the result shape, then NumPy’s error on a mismatch', async () => {
    render(<PickerHarness />)
    expect(screen.getByLabelText('Output').textContent).toBe('(2, 4)')
    await userEvent.selectOptions(screen.getByLabelText('Rows of B'), '2')
    expect(screen.getByLabelText('Output').textContent).toMatch(/size 2 is different from 3\)$/)
    expect(screen.getByText(/so NumPy refuses/)).toBeInTheDocument()
  })

  it('B.T flips B’s shape and the code says so', async () => {
    render(<PickerHarness />)
    await userEvent.selectOptions(screen.getByLabelText('Rows of B'), '4')
    await userEvent.selectOptions(screen.getByLabelText('Columns of B'), '3')
    await userEvent.click(screen.getByLabelText(/Use/))
    expect(screen.getByText(/C = A @ B\.T/)).toBeInTheDocument()
    expect(screen.getByLabelText('Output').textContent).toBe('(2, 4)')
  })
})

describe('TransposeExplorer', () => {
  it('highlights an entry and its partner in the transpose', async () => {
    render(<TransposeExplorer matrix={[[3, 0, 1], [1, 2, -1]]} />)
    await userEvent.click(screen.getByLabelText('A row 2, column 3: -1'))
    expect(screen.getByLabelText('A row 2, column 3: -1')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('A.T row 3, column 2: -1')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/A\.T\[2, 1\]/)).toBeInTheDocument()
  })
})

describe('GridInput', () => {
  function Harness() {
    const [m, setM] = useState<Matrix>([[1], [1]])
    return (
      <>
        <GridInput value={m} onChange={setM} name="N" />
        <output data-testid="v">{JSON.stringify(m)}</output>
      </>
    )
  }
  it('edits any shape', async () => {
    render(<Harness />)
    const cell = screen.getByLabelText('N row 2, column 1')
    await userEvent.clear(cell)
    await userEvent.type(cell, '-0.5')
    expect(screen.getByTestId('v').textContent).toBe('[[1],[-0.5]]')
  })
})

describe('the lesson', () => {
  it('renders all six steps', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(document.getElementById(`step-${n}`)).not.toBeNull()
    }
    const step5 = document.querySelector('section[aria-labelledby="step-5"]') as HTMLElement
    expect(within(step5).getByLabelText('Output').textContent).toBe(
      '(4, 1)\n[[ 3. ]\n [ 3.5]\n [-0.5]\n [-3.5]]',
    )
  })
})
