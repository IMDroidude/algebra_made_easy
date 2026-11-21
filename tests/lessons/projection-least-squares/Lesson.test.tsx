import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/projection-least-squares/Lesson'

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!

beforeAll(() => {
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

describe('Projection and least squares lesson', () => {
  it('renders the six steps', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projection and least squares')
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
  })

  it('step 1 states the best line and its error', () => {
    renderLesson()
    expect(within(step(1)).getByText(/y = 0.62x \+ 0.08\. Residuals/)).toBeInTheDocument()
  })

  it('step 2 compares your line with the best', async () => {
    renderLesson()
    const s = within(step(2))
    expect(s.getByText(/sum of squared residuals 17.75/)).toBeInTheDocument()
    expect(s.getByText(/Yours is 11 times as large/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/Show the best line/))
    expect(s.getByText(/: y = 0.62x \+ 0.08,/)).toBeInTheDocument()
  })

  it('step 3: the outlier flattens the line, revealed after locking in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByText(/Lock in a prediction/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/stays on y = 0.5x/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Least squares is not a vote/)).toBeInTheDocument()
    expect(s.getByText(/Best line now: y = −1\./)).toBeInTheDocument()
  })

  it('step 4 shows the normal equations output and the projection picture', async () => {
    renderLesson()
    const s = within(step(4))
    expect(s.getByLabelText('Output').textContent).toContain('[0.619  0.0833]')
    expect(s.getByText(/residuals add up to 0, and x · residuals = 0/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/projection picture/))
    expect(s.getByText(/so w = 2\. Residual r = \(-1, 2\), and r · x = 0/)).toBeInTheDocument()
  })

  it('step 5 predicts for the new input', () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByText(/predicts/)).toHaveTextContent('ŷ = 1.85')
    expect(s.getByLabelText('Output')).toHaveTextContent('1.85')
  })

  it('step 6 starts with nothing solved', () => {
    renderLesson()
    expect(within(step(6)).getByText('0 of 4 solved')).toBeInTheDocument()
  })
})
