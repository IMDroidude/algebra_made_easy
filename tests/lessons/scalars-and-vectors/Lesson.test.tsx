import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/scalars-and-vectors/Lesson'

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

describe('Vector arithmetic lesson', () => {
  it('has the six steps in order', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vector arithmetic')
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

  it('step 4 prints the NumPy output for the step 2 values', () => {
    renderLesson()
    expect(within(step(4)).getByLabelText('Output')).toHaveTextContent('[1 3] [ 3 -1] [4 2]')
  })

  it('switching step 2 to scale mode and moving k updates step 4', async () => {
    renderLesson()
    await userEvent.click(within(step(2)).getByRole('button', { name: 'Scale: k · u' }))
    const slider = within(step(2)).getByRole('slider', { name: 'k' })
    // jsdom does not move range inputs with the keyboard; the browser tests cover that.
    fireEvent.change(slider, { target: { value: '-0.5' } })
    expect(within(step(2)).getByText(/A negative scalar flips the arrow/)).toBeInTheDocument()
    expect(within(step(4)).getByLabelText('Output').textContent).toContain('[-1.  -0.5]')
  })

  it('the prediction is revealed only after locking in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByText(/Lock in a prediction to draw u − v/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText('From the tip of u to the tip of v.'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/That arrow is v − u/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    await userEvent.click(s.getByLabelText('From the tip of v to the tip of u.'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Correct/)).toBeInTheDocument()
  })

  it('step 5 shows the analogy result and the nearest word', () => {
    renderLesson()
    expect(within(step(5)).getByLabelText('Output')).toHaveTextContent('[4.5 3.5]')
    expect(within(step(5)).getByText(/nearest other word is/)).toHaveTextContent(
      'The nearest other word is queen at (4.5, 4), a distance of 0.5 away.',
    )
  })

  it('practice: setting k to 0 in scale mode ticks "Make it vanish"', async () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 4 solved')).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: 'Scale: k · u' }))
    fireEvent.change(s.getByRole('slider', { name: 'k' }), { target: { value: '0' } })
    expect(s.getByText('1 of 4 solved')).toBeInTheDocument()
    expect(s.getByText(/k = 0 sends every vector to the origin/)).toBeInTheDocument()
  })
})
