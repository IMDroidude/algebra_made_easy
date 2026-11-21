import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/attention/Lesson'
import { CHECKS, solvedBy } from '../../../src/lessons/attention/practice'
import { PRACTICE_K, PRACTICE_Q } from '../../../src/lessons/attention/data'
import { attentionScores, softmax } from '../../../src/linalg/attention'
import type { Vec2 } from '../../../src/linalg'

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  window.matchMedia ??= ((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

const step = (n: number) =>
  document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

describe('attention lesson', () => {
  it('renders all six steps', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Capstone: attention')
    for (const kind of ['See', 'Manipulate', 'Predict', 'Understand', 'Apply', 'Practice']) {
      expect(screen.getByText(new RegExp(`· ${kind}$`))).toBeInTheDocument()
    }
  })

  it('step 2: the heat map holds Q Kᵀ and a cell selects that query/key pair', async () => {
    renderLesson()
    const s = within(step(2))
    expect(s.getByRole('button', { name: 'q1 blip · k2 zorp = 3' })).toHaveAttribute('aria-pressed', 'true')
    expect(s.getByRole('button', { name: 'q2 zorp · k2 zorp = -1' })).toBeInTheDocument()
    expect(s.getByRole('button', { name: 'q3 fen · k3 fen = 1.25' })).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: 'q2 zorp · k3 fen = -2.75' }))
    expect(s.getByText(/Selected cell: q2 · k3 = -2.75/)).toBeInTheDocument()
    expect(s.getByText(/Highest:/)).toHaveTextContent('Highest: k1 (blip)')
  })

  it('step 3: weights move only after the prediction is locked in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(s.getByText(/Weights: 0.92, 0.03, 0.05. Lock in/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/keep the weights they had/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Not quite/)).toBeInTheDocument()
    expect(s.getByText(/k1 drops from 0.92 to 0.26/)).toBeInTheDocument()
    // Reduced motion in this test: the tween jumps straight to the end.
    expect(s.getByText(/Weights: 0.26, 0.01, 0.74\./)).toBeInTheDocument()
  })

  it('step 4: table and NumPy output for query 1 at T = √2', () => {
    renderLesson()
    const s = within(step(4))
    expect(s.getByLabelText('Output')).toHaveTextContent('[ 1.41 2.12 -1.59] [0.32 0.66 0.02]')
    expect(s.getByText(/become 1.41, 2.12, -1.59, and softmax turns them into weights 0.32, 0.66, 0.02/)).toBeInTheDocument()
    expect(within(s.getByRole('table', { name: /softmax/ })).getByText('12.66')).toBeInTheDocument()
  })

  it('step 4: a smaller T sharpens the weights and the code switches to T', async () => {
    renderLesson()
    const s = within(step(4))
    fireEvent.change(s.getByRole('slider'), { target: { value: '0' } })
    expect(s.getByText(/T = 0.25/, { selector: 'strong' })).toBeInTheDocument()
    expect(step(4).querySelector('pre code')?.textContent).toContain('T = 0.25  # instead of √d_k')
    // scores (2, 3, -2.25) / 0.25 = (8, 12, -9); weights ≈ (0.02, 0.98, 0)
    expect(s.getByLabelText('Output')).toHaveTextContent('[ 8. 12. -9.] [0.02 0.98 0. ]')
  })

  it('step 5: the output and the zero-query prediction', async () => {
    renderLesson()
    const s = within(step(5))
    expect(s.getByLabelText('Output')).toHaveTextContent('[[-0.33 1.61] [ 1.89 1. ] [-0.29 -0.12]]')
    expect(step(5).querySelector('[aria-live]')).toHaveTextContent(/= \(-0.33, 1.61\)\./)
    await userEvent.click(s.getByLabelText(/plain average of the three values\./))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Correct/)).toBeInTheDocument()
    // V = (2, 1), (-1.5, 2), (0.5, -2): average (0.33, 0.33)
    const readout = step(5).querySelector('[aria-live]')
    expect(readout).toHaveTextContent(/blip 0.33, zorp 0.33, fen 0.33\. Output out1 = .* = \(0.33, 0.33\)\./)
  })

  it('step 6: starts unsolved', () => {
    renderLesson()
    expect(within(step(6)).getByText('0 of 3 solved')).toBeInTheDocument()
  })
})

describe('practice checks', () => {
  const w = (q: Vec2, K: Vec2[]) => softmax(attentionScores([q], K)[0], Math.SQRT2)

  it('the starting vectors solve nothing', () => {
    expect(solvedBy(w(PRACTICE_Q, PRACTICE_K))).toEqual([])
  })

  it('each goal can be reached on the half-step grid inside ±3', () => {
    expect(CHECKS.focus(w([3, 0], [[0, 3], [0, -3], [3, 0]]))).toBe(true)
    expect(CHECKS.uniform(w([0, 0], PRACTICE_K))).toBe(true)
    expect(CHECKS.uniform(w([1, 0], [[1, 3], [1, -2], [1, 0]]))).toBe(true)
    expect(CHECKS.split(w([0, 3], [[1, 2], [-1, 2], [0, -2]]))).toBe(true)
  })

  it('near misses are not accepted', () => {
    expect(CHECKS.focus([0.05, 0.06, 0.89])).toBe(false)
    expect(CHECKS.uniform([0.3, 0.35, 0.35])).toBe(false)
    expect(CHECKS.split([0.5, 0.44, 0.06])).toBe(false)
  })
})
