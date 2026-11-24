import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/dot-product/Lesson'

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // Reduced motion makes reveal animations jump straight to their end.
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

const step = (n: number) => document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement
const search = () => document.querySelector('section[aria-labelledby="search-heading"]') as HTMLElement
const readout = (n: number) => step(n).querySelector('[aria-live]')!.textContent

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

describe('Dot product lesson', () => {
  it('has the six steps in order', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dot product, length and cosine similarity')
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

  it('step 1 shows the shadow and the dot product agreeing', () => {
    renderLesson()
    expect(readout(1)).toContain('runs from the origin to (2, 0), length 2')
    expect(readout(1)).toContain('a · b = 8 = 4 × 2')
  })

  it('step 2 readout, step 4 equation and step 4 NumPy output show the same numbers', () => {
    renderLesson()
    expect(readout(2)).toContain('a · b = 11, positive')
    expect(readout(2)).toContain('Angle θ = 42.3°')
    expect(readout(2)).toContain('shadow length 2.67, ending at (2.59, 0.65)')
    expect(within(step(4)).getByLabelText('Output').textContent).toBe('11\n4.12 3.61\n0.740')
    expect(readout(4)).toContain('0.740 long')
  })

  it('the prediction stays hidden until locked in, explains a wrong answer, then reveals 0', async () => {
    renderLesson()
    const s = within(step(3))
    expect(readout(3)).toContain('stay hidden')
    await userEvent.click(s.getByLabelText('10, the two lengths multiplied'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Not quite/)).toBeInTheDocument()
    expect(s.getByText(/cos θ = 0/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    expect(readout(3)).toContain('stay hidden')
    await userEvent.click(s.getByLabelText('0'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Correct/)).toBeInTheDocument()
    expect(readout(3)).toContain('b is at (-1, 3), 90° from a. a · b = 0.')
  })

  it('the search section ranks by cosine, and the dot-product toggle changes the winners', async () => {
    renderLesson()
    const s = within(search())
    expect(s.getByLabelText('Output').textContent).toBe(
      '1.000  Pet-friendly cafes\n0.923  What do cats eat?\n0.894  Puppy training tips',
    )
    await userEvent.click(s.getByLabelText(/Rank by raw dot product/))
    expect(s.getByLabelText('Output').textContent).toBe(
      '13.000  Puppy training tips\n12.000  What do cats eat?\n9.500  Quick pasta recipes',
    )
    expect(s.getByRole('columnheader', { name: 'd · q' })).toBeInTheDocument()
  })

  it('step 6 starts with nothing solved', () => {
    renderLesson()
    expect(within(step(6)).getByText('0 of 4 solved')).toBeInTheDocument()
    expect(readout(6)).toContain('u · w = 4')
  })
})
