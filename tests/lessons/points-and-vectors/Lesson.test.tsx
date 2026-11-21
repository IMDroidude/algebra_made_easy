import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/points-and-vectors/Lesson'

// Mafs measures its container; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const readout = (n: number) =>
  step(n).querySelector('[aria-live]') as HTMLElement
const step = (n: number) => document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

describe('Points and vectors lesson', () => {
  it('has the six steps in order', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Points and vectors')
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

  it('every plane has a label and a live readout', () => {
    renderLesson()
    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(within(step(n)).getAllByRole('group').length).toBeGreaterThan(0)
      expect(step(n).querySelector('[aria-live]')).not.toBeNull()
    }
  })

  it('step 1 describes the place and the movement', () => {
    renderLesson()
    expect(within(step(1)).getByText(/3 east, 2 north/)).toBeInTheDocument()
  })

  it('step 2 shows the copies', async () => {
    renderLesson()
    const s = within(step(2))
    expect(readout(2)).toHaveTextContent('v = (3, 2): 3 east, 2 north. It starts at (-4, -3) and ends at (-1, -1).')
    await userEvent.click(s.getByLabelText(/same v from other starting places/))
    expect(s.getByLabelText(/same v from other starting places/)).toBeChecked()
  })

  it('the prediction is revealed only after locking in, with misconception feedback', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByText(/Lock in a prediction to see more/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText('How to get from home to the shop.'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/The trip from home to the shop is a/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    await userEvent.click(s.getByLabelText('The spot halfway between home and the shop.'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Halfway between \(3, 1\) and \(1, 3\) is \(2, 2\)/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    await userEvent.click(s.getByLabelText('Nothing useful. It is just some other spot on the map.'))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/point \+ point means nothing/)).toBeInTheDocument()
  })

  it('step 4 shows B − A, its length and the NumPy output', () => {
    renderLesson()
    const s = within(step(4))
    expect(readout(4)).toHaveTextContent('v = B − A = (3, 4): 3 east, 4 north. It goes exactly 5 units')
    expect(s.getByLabelText('Output').textContent).toBe('[3 4]\n[1 3]\n5.0')
    expect(s.getByText(/B − A = \(3, 4, 2\)/)).toBeInTheDocument()
  })

  it('step 4 position vectors toggle adds the bridge sentence', async () => {
    renderLesson()
    const s = within(step(4))
    await userEvent.click(s.getByLabelText(/arrows from the origin/))
    expect(readout(4)).toHaveTextContent('The arrow from the origin to A is (-2, -1), the same numbers as A.')
  })

  it('step 5 walks the robot move by move', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByText(/waiting at the depot, \(-4, -4\)/)).toBeInTheDocument()
    const next = s.getByRole('button', { name: 'Next move' })
    await userEvent.click(next)
    expect(s.getByText(/After 1 move the robot is at \(-1, -3\)/)).toBeInTheDocument()
    await userEvent.click(next)
    await userEvent.click(next)
    expect(s.getByText(/After 3 moves the robot is at \(-2, 2\)/)).toBeInTheDocument()
    expect(next).toBeDisabled()
    expect(s.getByText('0.52')).toBeInTheDocument()
    expect(s.getByText('-1.21')).toBeInTheDocument()
    expect(s.getByText('0.33')).toBeInTheDocument()
  })

  it('step 6 starts with nothing solved', () => {
    renderLesson()
    expect(within(step(6)).getByText('0 of 3 solved')).toBeInTheDocument()
    expect(readout(6)).toHaveTextContent('B − A = (2, 1). A + m = (1, 1).')
  })
})
