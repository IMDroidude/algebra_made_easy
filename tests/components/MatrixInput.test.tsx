import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { MatrixInput } from '../../src/components/MatrixInput'
import type { Mat2 } from '../../src/linalg'

function Harness({ initial }: { initial: Mat2 }) {
  const [m, setM] = useState<Mat2>(initial)
  return (
    <>
      <MatrixInput value={m} onChange={setM} />
      <output data-testid="value">{JSON.stringify(m)}</output>
      <button onClick={() => setM([[9, 8], [7, 6]])}>external change</button>
    </>
  )
}

const cell = (row: number, col: number) =>
  screen.getByLabelText(`A row ${row}, column ${col}`) as HTMLInputElement

describe('MatrixInput', () => {
  it('shows the matrix row by row and labels the columns', () => {
    render(<Harness initial={[[1, 2], [3, 4]]} />)
    expect(cell(1, 1).value).toBe('1')
    expect(cell(1, 2).value).toBe('2')
    expect(cell(2, 1).value).toBe('3')
    expect(cell(2, 2).value).toBe('4')
    expect(screen.getByText('î lands at')).toBeInTheDocument()
    expect(screen.getByText('ĵ lands at')).toBeInTheDocument()
  })

  it('updates the right entry when typed into', async () => {
    render(<Harness initial={[[1, 0], [0, 1]]} />)
    await userEvent.clear(cell(1, 2))
    await userEvent.type(cell(1, 2), '-2.5')
    expect(screen.getByTestId('value').textContent).toBe('[[1,-2.5],[0,1]]')
  })

  it('flags invalid text and keeps the last valid value', async () => {
    render(<Harness initial={[[1, 0], [0, 1]]} />)
    await userEvent.clear(cell(1, 1))
    expect(cell(1, 1)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('value').textContent).toBe('[[1,0],[0,1]]')

    await userEvent.tab()
    expect(cell(1, 1).value).toBe('1')
    expect(cell(1, 1)).toHaveAttribute('aria-invalid', 'false')
  })

  it('rejects numbers outside the allowed range', async () => {
    render(<Harness initial={[[1, 0], [0, 1]]} />)
    await userEvent.clear(cell(2, 2))
    await userEvent.type(cell(2, 2), '50')
    expect(cell(2, 2)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByTestId('value').textContent).toBe('[[1,0],[0,5]]')
  })

  it('follows changes made elsewhere, such as dragging', async () => {
    render(<Harness initial={[[1, 0], [0, 1]]} />)
    await userEvent.click(screen.getByText('external change'))
    expect(cell(1, 1).value).toBe('9')
    expect(cell(2, 2).value).toBe('6')
  })
})
