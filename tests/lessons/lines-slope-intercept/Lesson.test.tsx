import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/lines-slope-intercept/Lesson'

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!

// Mafs measures its container; jsdom has no ResizeObserver.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

function renderLesson() {
  return render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

describe('Lines lesson', () => {
  it('renders all six steps', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Lines: slope, intercept and boundaries')
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
  })

  it('typing a slope updates the equation in the readout', async () => {
    renderLesson()
    const s = within(step(2))
    const box = s.getByLabelText('slope m')
    await userEvent.clear(box)
    await userEvent.type(box, '-2')
    expect(s.getByText(/goes down 2/)).toBeInTheDocument()
    expect(s.getAllByText(/y = -2x \+ 1/).length).toBeGreaterThan(0)
  })

  it('typed values snap to the slider step', async () => {
    renderLesson()
    const s = within(step(2))
    const box = s.getByLabelText('intercept b')
    await userEvent.clear(box)
    await userEvent.type(box, '0.3')
    expect(s.getByText(/crosses the y-axis at \(0, 0.25\)/)).toBeInTheDocument()
  })

  it('step 4 shows the slope and NumPy output for P and Q', () => {
    renderLesson()
    const s = within(step(4))
    expect(s.getByLabelText('Output')).toHaveTextContent('0.5 -1.5')
    expect(s.getByText(/gives slope 0.5; the line is y = 0.5x - 1.5/)).toBeInTheDocument()
  })

  it('the neuron output follows the weight', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByLabelText('Output').textContent).toBe('3.5\n[-2.5 -1.   0.5  2.   3.5]')
    const box = s.getByLabelText('weight w')
    await userEvent.clear(box)
    await userEvent.type(box, '2')
    expect(s.getByLabelText('Output').textContent).toBe('4.5\n[-3.5 -1.5  0.5  2.5  4.5]')
  })

  it('a practice challenge ticks itself from the live line', async () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 4 solved')).toBeInTheDocument()
    for (const [label, value] of [
      ['practice slope m', '0.5'],
      ['practice intercept b', '0.5'],
    ]) {
      const box = s.getByLabelText(label)
      await userEvent.clear(box)
      await userEvent.type(box, value)
    }
    expect(s.getByText('1 of 4 solved')).toBeInTheDocument()
    expect(s.getByLabelText('Output')).toHaveTextContent('0.0')
  })
})
