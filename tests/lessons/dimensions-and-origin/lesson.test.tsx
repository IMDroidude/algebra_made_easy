import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/dimensions-and-origin/Lesson'

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!
const readout = (n: number) => step(n).querySelector('[aria-live]')!.textContent

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // Reduced motion: reveals jump straight to the end.
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

describe('Dimensions and the origin lesson', () => {
  it('renders the header and all six steps, and hands over to 1.2', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dimensions and the origin')
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /1\.2: The coordinate plane/ })).toBeInTheDocument()
  })

  it('step 1 steps from one to three numbers', async () => {
    renderLesson()
    const s = within(step(1))
    expect(readout(1)).toMatch(/One number, so one dimension/)
    await userEvent.click(s.getByRole('button', { name: '2D · floor' }))
    expect(readout(1)).toMatch(/\(3, 2\).*Two numbers/)
    await userEvent.click(s.getByRole('button', { name: '3D · room' }))
    expect(readout(1)).toMatch(/\(3, 2, 1\).*Three numbers/)
    expect(s.getByRole('img', { name: /drone in a room/ })).toBeInTheDocument()
  })

  it('step 2 describes the bead, and offers the origin toggle', () => {
    renderLesson()
    expect(readout(2)).toBe('The bead’s number is 3: it is 3 steps right of the origin.')
    expect(within(step(2)).getByRole('checkbox', { name: /move the origin/ })).not.toBeChecked()
  })

  it('the prediction explains the "origin drags the bead" misconception', async () => {
    renderLesson()
    const s = within(step(3))
    await userEvent.click(s.getByRole('radio', { name: /slides 4 steps right/ }))
    await userEvent.click(s.getByRole('button', { name: 'Lock in my prediction' }))
    expect(s.getByRole('status')).toHaveTextContent(/changes the numbers, never the place/)
    await userEvent.click(s.getByRole('button', { name: 'Try again' }))
    await userEvent.click(s.getByRole('radio', { name: /now reads −1/ }))
    await userEvent.click(s.getByRole('button', { name: 'Lock in my prediction' }))
    expect(s.getByRole('status')).toHaveTextContent(/Correct/)
    expect(s.getByRole('status')).toHaveTextContent(/not smaller or less real/)
    expect(readout(3)).toBe(
      'The origin is now 4 steps to the right. The bead has not moved, and its number is −1: 1 step left of the origin.',
    )
  })

  it('step 4 shows the rule and NumPy for the same state', () => {
    renderLesson()
    expect(readout(4)).toMatch(/In numbers: 3 = 3 − 0\./)
    const out = within(step(4)).getByLabelText('Output')
    expect(out.textContent).toBe('[3]\n(1,)')
  })

  it('step 5 shows the house with more features, and says when it cannot be drawn', async () => {
    renderLesson()
    const s = within(step(5))
    expect(readout(5)).toMatch(/\(120, 3, 15\) in 3-dimensional house space/)
    await userEvent.click(s.getByRole('button', { name: '5' }))
    expect(readout(5)).toMatch(/\(120, 3, 15, 8, 40\) in 5-dimensional.*We cannot draw it/)
    expect(s.getByLabelText('Output').textContent).toBe('[120   3  15   8  40]\n(5,)\n5')
    await userEvent.click(s.getByRole('button', { name: '1' }))
    expect(s.getByLabelText('Output').textContent).toBe('[120]\n(1,)\n1')
  })

  it('practice: typing the number of dimensions ticks that challenge', () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 3 solved')).toBeInTheDocument()
    fireEvent.change(s.getByLabelText('Dimensions of one weather reading'), { target: { value: '3' } })
    expect(s.getByText('0 of 3 solved')).toBeInTheDocument()
    fireEvent.change(s.getByLabelText('Dimensions of one weather reading'), { target: { value: '4' } })
    expect(s.getByText('1 of 3 solved')).toBeInTheDocument()
    expect(s.getByText(/Count the dimensions/).textContent).toMatch(/\(solved\)/)
  })
})
