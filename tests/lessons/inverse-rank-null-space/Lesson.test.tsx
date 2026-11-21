import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/inverse-rank-null-space/Lesson'

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver. Reduced motion makes tweens jump to the end.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} })) as never
})

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

describe('Inverse, rank, null space lesson', () => {
  it('renders the six steps', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Inverse, rank, null space')
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
  })

  it('step 1 plays there and back', async () => {
    renderLesson()
    const s = within(step(1))
    await userEvent.click(s.getByRole('button', { name: /Play/ }))
    expect(s.getByText(/Back exactly where it started/)).toBeInTheDocument()
  })

  it('step 2: squeezing to 0.0000001 is shown as ≈ 0 and disables the undo', () => {
    renderLesson()
    const s = within(step(2))
    expect(s.getByRole('button', { name: /Undo with/ })).toBeEnabled()
    fireEvent.change(s.getByRole('slider'), { target: { value: '6' } })
    expect(s.getByRole('slider')).toHaveAttribute('aria-valuetext', 'determinant ≈ 0')
    expect(s.getByText(/treated as singular\. The exact value is 0\.0000001,/)).toBeInTheDocument()
    expect(s.getByRole('button', { name: /Undo with/ })).toBeDisabled()
  })

  it('step 2: the undo returns the F to its outline', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.click(s.getByRole('button', { name: /Undo with/ }))
    expect(s.getByText(/Undone/)).toBeInTheDocument()
    expect(s.getByRole('button', { name: /Apply A again/ })).toBeInTheDocument()
  })

  it('step 3: prediction is revealed only after locking in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByText(/Lock in a prediction to apply A/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/crushed to the origin/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Not quite/)).toBeInTheDocument()
    expect(s.getByText(/p1 is at \(2, 1\), p2 at \(2, 1\), p3 at \(2, 1\)/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    await userEvent.click(s.getByLabelText(/same point/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Correct/)).toBeInTheDocument()
  })

  it('step 4: the presets show one, none and infinitely many solutions', async () => {
    renderLesson()
    const s = within(step(4))
    expect(s.getByText(/cross once, at x = 2, y = 1/)).toBeInTheDocument()
    expect(s.getByLabelText('Output')).toHaveTextContent(/^2\s*\[2\. 1\.\]$/)
    await userEvent.click(s.getByRole('button', { name: 'Parallel' }))
    expect(s.getByText(/parallel and never meet/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: 'Same line' }))
    expect(s.getByText(/infinitely many/, { selector: 'span' })).toBeInTheDocument()
    expect(s.getByText(/Null space \(dashed grey\)/)).toBeInTheDocument()
  })

  it('step 5: choosing d and r updates the count', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByText('65,536')).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: '768' }))
    await userEvent.click(s.getByRole('button', { name: '1' }))
    expect(s.getByText('1,536')).toBeInTheDocument()
    expect(s.getByLabelText('Output')).toHaveTextContent('589824')
  })

  it('step 6: challenges tick from the typed matrix', async () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 4 solved')).toBeInTheDocument()
    const cell = (r: number, c: number) => s.getByLabelText(`A row ${r}, column ${c}`)
    await userEvent.clear(cell(1, 1))
    await userEvent.type(cell(1, 1), '-1')
    expect(s.getByText('1 of 4 solved')).toBeInTheDocument()
    expect(s.getByText(/Mirrors \(and the half turn/)).toBeInTheDocument()
  })
})
