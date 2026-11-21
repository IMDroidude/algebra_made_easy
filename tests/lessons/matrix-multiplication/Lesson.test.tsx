import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/matrix-multiplication/Lesson'

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // Reduced motion makes animations jump straight to their end.
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

const step = (n: number) => document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement
const readout = (n: number) => step(n).querySelector('[aria-live]')!.textContent

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

const type = (scope: HTMLElement, label: string, value: string) =>
  fireEvent.change(within(scope).getByLabelText(label), { target: { value } })

describe('Matrix multiplication lesson', () => {
  it('has the six steps in order', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Matrix multiplication')
    const kinds = [1, 2, 3, 4, 5, 6].map((n) => step(n).querySelector('p')!.textContent)
    expect(kinds).toEqual([
      'Step 1 · See',
      'Step 2 · Manipulate',
      'Step 3 · Predict',
      'Step 4 · Understand',
      'Step 5 · Apply',
      'Step 6 · Practice',
    ])
  })

  it('step 2 shows AB by default and BA after swapping the order', async () => {
    renderLesson()
    expect(readout(2)).toContain('Done: B first, then A.')
    expect(readout(2)).toContain('single matrix AB, with rows (0, -1) and (1, 1)')
    await userEvent.click(within(step(2)).getByRole('button', { name: 'BA: A first, then B' }))
    expect(readout(2)).toContain('Done: A first, then B.')
    expect(readout(2)).toContain('single matrix BA, with rows (1, -1) and (1, 0)')
  })

  it('the progress slider stops halfway, after the first matrix only', () => {
    renderLesson()
    fireEvent.change(within(step(2)).getByRole('slider'), { target: { value: '50' } })
    expect(readout(2)).toContain('B is done; A comes next.')
  })

  it('editing A in step 2 updates the step 4 equation and NumPy output', () => {
    renderLesson()
    const out = () => within(step(4)).getByLabelText('Output').textContent
    expect(out()).toBe('[[ 0 -1]\n [ 1  1]]\n[[ 1 -1]\n [ 1  0]]')
    type(step(2), 'A row 1, column 1', '2')
    // A = [[2, -1], [1, 0]], B = [[1, 1], [0, 1]]
    expect(out()).toBe('[[2 1]\n [1 1]]\n[[ 3 -1]\n [ 1  0]]')
    expect(readout(4)).toContain('row 1 of that column, is 1')
  })

  it('identical orders are pointed out when the matrices commute', () => {
    renderLesson()
    type(step(2), 'A row 1, column 2', '0')
    type(step(2), 'A row 2, column 1', '0')
    expect(readout(2)).toContain('AB and BA happen to be equal')
  })

  it('the prediction reveals both mirrors only after locking in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(readout(3)).toContain('unmoved')
    await userEvent.click(s.getByLabelText(/one of them is mirrored/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Not quite/)).toBeInTheDocument()
    expect(s.getByText(/exactly one flip/)).toBeInTheDocument()
    expect(readout(3)).toContain('AB (solid) has rows (0, 1), (1, 0). BA (dashed) has rows (0, -1), (-1, 0).')
  })

  it('a ReLU between the layers breaks the collapse into one matrix', async () => {
    renderLesson()
    const s = within(step(5))
    expect(readout(5)).toContain('The two layers are really one.')
    expect(s.getByLabelText('Output').textContent).toMatch(/True$/)
    await userEvent.click(s.getByLabelText(/Put a ReLU/))
    expect(readout(5)).toContain('3 of 4 outputs differ from W x')
    expect(s.getByLabelText('Output').textContent).toMatch(/False$/)
    expect(s.getByText(/np\.maximum\(0, X @ W1\.T\)/)).toBeInTheDocument()
  })

  it('practice challenges tick from the live matrix B', () => {
    renderLesson()
    const s = step(6)
    expect(within(s).getByText('0 of 3 solved')).toBeInTheDocument()
    type(s, 'B row 1, column 1', '0.5')
    type(s, 'B row 2, column 2', '2')
    // B = A⁻¹ also commutes with A.
    expect(within(s).getByText('2 of 3 solved')).toBeInTheDocument()
  })
})
