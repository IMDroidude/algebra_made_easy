import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/determinant/Lesson'

// Mafs measures its container; jsdom has no ResizeObserver, so give it a silent one.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const step = (n: number) =>
  document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement

describe('determinant lesson', () => {
  it('renders all six steps with live values', () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    for (const n of [1, 2, 3, 4, 5, 6]) expect(step(n)).not.toBeNull()
    expect(within(step(4)).getByLabelText('Output').textContent).toBe('5')
    expect(within(step(5)).getByLabelText('Output').textContent).toBe('[3.  1.5]\n[3.  1.5]')
  })

  it('reports a flip, a collapse and a near-zero determinant in step 2', async () => {
    render(
      <MemoryRouter>
        <Lesson />
      </MemoryRouter>,
    )
    const s = within(step(2))
    await userEvent.clear(s.getByLabelText('A row 1, column 1'))
    await userEvent.type(s.getByLabelText('A row 1, column 1'), '-1')
    expect(s.getByText(/Determinant -1/)).toBeInTheDocument()
    expect(s.getByText(/reads backwards, like a mirror image/)).toBeInTheDocument()

    await userEvent.clear(s.getByLabelText('A row 1, column 1'))
    await userEvent.type(s.getByLabelText('A row 1, column 1'), '1')
    for (const [label, text] of [
      ['A row 1, column 2', '1'],
      ['A row 2, column 1', '1'],
      ['A row 2, column 2', '1.0000001'],
    ]) {
      await userEvent.clear(s.getByLabelText(label))
      await userEvent.type(s.getByLabelText(label), text)
    }
    expect(s.getByText(/Determinant ≈ 0, treated as singular/)).toBeInTheDocument()
    expect(s.getByText(/flattened into a line/)).toBeInTheDocument()
    expect(screen.getAllByText(/Hit these determinants/).length).toBe(1)
  })
})
