import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/span-and-basis/Lesson'

// Mafs measures its container; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const step = (n: number) => document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

describe('Linear combinations, span, basis lesson', () => {
  it('has the six steps in order', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Linear combinations, span, basis')
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

  it('the sliders in step 2 drive the readout and the step 4 NumPy output', () => {
    renderLesson()
    const s = within(step(2))
    const readout = () => step(2).querySelector('[aria-live]')!.textContent
    expect(readout()).toContain('w = 1·u + 2·v = (2, 1) + (-2, 2) = (0, 3)')
    expect(within(step(4)).getByLabelText('Output').textContent).toBe('[0 3]\n2')
    fireEvent.change(s.getByRole('slider', { name: 'a' }), { target: { value: '-0.5' } })
    expect(readout()).toContain('w = (-0.5)·u + 2·v = (-1, -0.5) + (-2, 2) = (-3, 1.5)')
    expect(within(step(4)).getByLabelText('Output').textContent).toBe('[-3.   1.5]\n2')
  })

  it('"Use u alone" says the span is a line', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.click(s.getByLabelText('Use u alone'))
    expect(s.getByText(/the span is a line through the origin/)).toBeInTheDocument()
    expect(s.getByRole('slider', { name: 'b' })).toBeDisabled()
  })

  it('the prediction is revealed only after locking in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByText(/Lock in a prediction to see every point/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/Only the origin/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/They cancel only for some choices/)).toBeInTheDocument()
    expect(await s.findByText(/Every combination lands on the line/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    await userEvent.click(s.getByLabelText(/Only the points on one line/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Correct/)).toBeInTheDocument()
  })

  it('step 5: the redundant feature makes NumPy refuse', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByLabelText('Output').textContent).toBe('[2. 1.]\n[3. 1.]')
    await userEvent.click(s.getByLabelText(/redundant feature/))
    expect(s.getByLabelText('Output').textContent).toMatch(/LinAlgError: Singular matrix$/)
    expect(s.getByText(/NumPy refuses to solve/)).toBeInTheDocument()
  })

  it('practice: the sliders alone can reach the star', () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 4 solved')).toBeInTheDocument()
    fireEvent.change(s.getByRole('slider', { name: 'a' }), { target: { value: '-1.75' } })
    fireEvent.change(s.getByRole('slider', { name: 'b' }), { target: { value: '-0.5' } })
    expect(s.getByText('1 of 4 solved')).toBeInTheDocument()
    expect(s.getByText(/this is the only pair that works/)).toBeInTheDocument()
  })
})
