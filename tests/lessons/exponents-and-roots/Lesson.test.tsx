import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/exponents-and-roots/Lesson'

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

describe('Exponents lesson', () => {
  it('renders all six steps', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Exponents and roots')
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
  })

  it('area mode gives the side as a square root', async () => {
    renderLesson()
    const s = within(step(2))
    expect(s.getByText(/area is 2.5² = 6.25/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/Set the area instead/))
    const box = s.getByLabelText('area')
    await userEvent.clear(box)
    await userEvent.type(box, '16')
    expect(s.getByText(/side is √16 = 4/)).toBeInTheDocument()
  })

  it('step 4 shows (-3)² = 9 and the non-negative root, matching NumPy', () => {
    renderLesson()
    const s = within(step(4))
    expect(s.getByText(/\(-3\)² = 9|3² = 9/)).toBeInTheDocument()
    expect(s.getByText(/√9 is 3, the non-negative one/)).toBeInTheDocument()
    expect(s.getByLabelText('Output').textContent).toBe('9.0\n3.0\n[ 1  4  9 16]\n[ 2  4  8 16]')
  })

  it('step 5 switches between squared error and distance', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByLabelText('Output').textContent).toBe('0.625\n0.4375')
    await userEvent.click(s.getByRole('button', { name: 'Distance between embeddings' }))
    expect(s.getByLabelText('Output').textContent).toBe('3.605551275463989\n3.605551275463989')
    expect(s.getByText(/√13 = 3.606/)).toBeInTheDocument()
  })

  it('practice starts unsolved', () => {
    renderLesson()
    expect(within(step(6)).getByText('0 of 3 solved')).toBeInTheDocument()
  })
})
