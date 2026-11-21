import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/real-world-positions/Lesson'

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!
const readout = (n: number) => step(n).querySelector('[aria-live]')!.textContent

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

describe('real-world positions lesson', () => {
  it('renders six steps and the recap', () => {
    renderLesson()
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Can you explain…?' })).toBeTruthy()
    expect(readout(1)).toContain('(5, 3)')
  })

  it('changing origin, unit and direction changes the numbers, not the lamp', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.click(s.getByRole('button', { name: 'door' }))
    expect(readout(2)).toContain('lamp is at (5, 0.5)')
    await userEvent.click(s.getByRole('button', { name: /floor tiles/ }))
    expect(readout(2)).toContain('(10, 1)')
    await userEvent.click(s.getByRole('button', { name: /y down the map/ }))
    expect(readout(2)).toContain('(10, -1)')
    await userEvent.click(s.getByRole('button', { name: 'Reset' }))
    expect(readout(2)).toContain('(5, 3)')
  })

  it('explains the misconception that moving the origin moves the object', async () => {
    renderLesson()
    const s = within(step(3))
    await userEvent.click(s.getByLabelText(/The lamp moves 2.5 m down/))
    await userEvent.click(s.getByRole('button', { name: 'Lock in my prediction' }))
    expect(s.getByText(/the lamp has not moved at all/)).toBeTruthy()
    await userEvent.click(s.getByRole('button', { name: 'Try again' }))
    await userEvent.click(s.getByLabelText(/address becomes \(5, 0.5\)/))
    await userEvent.click(s.getByRole('button', { name: 'Lock in my prediction' }))
    expect(s.getByText('✓ Correct.')).toBeTruthy()
  })

  it('binds equation, readout and NumPy to the chosen origin', async () => {
    renderLesson()
    const s = within(step(4))
    expect(s.getByLabelText('Output').textContent).toBe('[[ 5.   0.5]\n [ 7.  -1.5]\n [ 2.  -1.5]]')
    await userEvent.click(s.getByRole('button', { name: 'window' }))
    expect(readout(4)).toContain('lamp (1, -2)')
    expect(s.getByLabelText('Output').textContent).toBe('[[ 1 -2]\n [ 3 -4]\n [-2 -4]]')
  })

  it('switches between real-world examples', async () => {
    renderLesson()
    const s = within(step(5))
    expect(readout(5)).toContain('(7, 1)')
    await userEvent.click(s.getByRole('button', { name: 'Cinema seat' }))
    await userEvent.click(s.getByRole('button', { name: 'Row E, seat 2' }))
    expect(readout(5)).toContain('(2, 5)')
    await userEvent.click(s.getByRole('button', { name: 'Game world & GPS' }))
    expect(s.getAllByText(/angles/).length).toBeGreaterThan(0)
    await userEvent.click(s.getByRole('button', { name: 'Fruit as data' }))
    expect(readout(5)).toContain('apple')
  })

  it('ticks the drone challenge from the sliders', () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 3 solved')).toBeTruthy()
    const set = (name: string, v: number) => {
      const el = s.getByRole('slider', { name }) as HTMLInputElement
      // fireEvent-free: React listens to input events on range inputs.
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
      setter.call(el, String(v))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set('x', 10)
    set('y', 10)
    set('z', 2)
    expect(s.getByText('1 of 3 solved')).toBeTruthy()
  })

  it('reveals recap answers and links to each lesson', async () => {
    renderLesson()
    const recap = within(screen.getByRole('heading', { name: 'Can you explain…?' }).closest('section')!)
    const buttons = recap.getAllByRole('button', { name: 'Show answer' })
    expect(buttons).toHaveLength(7)
    const answer = recap.getByText(/A point is a place; a vector is a movement/).parentElement!
    expect(answer.hidden).toBe(true)
    await userEvent.click(buttons[5])
    expect(answer.hidden).toBe(false)
    expect(buttons[5].getAttribute('aria-expanded')).toBe('true')
    expect(recap.getByText('1 of 7 answers revealed')).toBeTruthy()
    const hrefs = recap.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/lessons/points-and-vectors')
    expect(hrefs).toContain('/lessons/dimensions-and-origin')
    expect(hrefs).toHaveLength(7)
  })
})
