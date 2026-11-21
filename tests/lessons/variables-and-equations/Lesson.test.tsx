import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/variables-and-equations/Lesson'

/** The lesson header links to earlier lessons, so it needs a router. */
const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

const step = (n: number) => document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement

describe('Variables and equations lesson', () => {
  it('has the six steps', () => {
    renderLesson()
    for (const kind of ['See', 'Manipulate', 'Predict', 'Understand', 'Apply', 'Practice'])
      expect(screen.getByText(new RegExp(`· ${kind}$`))).toBeInTheDocument()
  })

  it('solves x + 5 = 12 by subtracting 5 from both sides', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.clear(s.getByLabelText('Step 2: amount'))
    await userEvent.type(s.getByLabelText('Step 2: amount'), '5')
    await userEvent.click(s.getByRole('button', { name: 'Subtract 5 from both sides' }))
    expect(s.getByText(/Solved: x = 7/)).toBeInTheDocument()
    expect(s.getByRole('img').getAttribute('data-tilt')).toBe('0')
    // the Understand step shows the same move and the matching code
    const u = within(step(4))
    expect(u.getByLabelText('Output')).toHaveTextContent('7.0 [7.]')
  })

  it('tips the scale when a move is applied to one side only, and undo levels it', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.clear(s.getByLabelText('Step 2: amount'))
    await userEvent.type(s.getByLabelText('Step 2: amount'), '5')
    await userEvent.click(s.getByRole('button', { name: 'Subtract 5 from the left side only' }))
    expect(s.getByText(/the right side is heavier/)).toBeInTheDocument()
    expect(Number(s.getByRole('img').getAttribute('data-tilt'))).toBeGreaterThan(0)
    await userEvent.click(s.getByRole('button', { name: 'Undo' }))
    expect(s.getByRole('img').getAttribute('data-tilt')).toBe('0')
  })

  it('solves 3x = 15 by dividing both sides by 3', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.click(s.getByRole('button', { name: '3x = 15' }))
    await userEvent.click(s.getByRole('button', { name: /Divide$/ }))
    await userEvent.clear(s.getByLabelText('Step 2: amount'))
    await userEvent.type(s.getByLabelText('Step 2: amount'), '3')
    await userEvent.click(s.getByRole('button', { name: 'Divide both sides by 3' }))
    expect(s.getByText(/Solved: x = 5/)).toBeInTheDocument()
  })

  it('reveals the prediction only after locking in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByRole('img', { name: /3x = 15$/ })).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/x = 12\. The 3 is gone/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Not quite/)).toBeInTheDocument()
    expect(s.getByRole('img', { name: /3x − 3 = 12$/ })).toBeInTheDocument()
  })

  it('trains w towards 2.5 in the Apply step', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByLabelText('Output')).toHaveTextContent('1.0')
    await userEvent.click(s.getByRole('button', { name: 'Take a training step' }))
    await userEvent.click(s.getByRole('button', { name: 'Take a training step' }))
    expect(s.getByLabelText('Output')).toHaveTextContent('2.44')
    expect(s.getByText(/range\(2\)/)).toBeInTheDocument()
  })

  it('ticks a practice challenge from the live equation', async () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 4 solved')).toBeInTheDocument()
    await userEvent.clear(s.getByLabelText('Practice: amount'))
    await userEvent.type(s.getByLabelText('Practice: amount'), '4')
    await userEvent.click(s.getByRole('button', { name: 'Subtract 4 from both sides' }))
    await userEvent.click(s.getByRole('button', { name: /Divide$/ }))
    await userEvent.clear(s.getByLabelText('Practice: amount'))
    await userEvent.type(s.getByLabelText('Practice: amount'), '5')
    await userEvent.click(s.getByRole('button', { name: 'Divide both sides by 5' }))
    expect(s.getByText('2 of 4 solved')).toBeInTheDocument()
  })
})
