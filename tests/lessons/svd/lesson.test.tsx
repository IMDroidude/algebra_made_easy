import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { CHECKS } from '../../../src/lessons/svd/challenges'
import { describeStage, stepSentences } from '../../../src/lessons/svd/describe'
import { Lesson } from '../../../src/lessons/svd/Lesson'
import { svd2 } from '../../../src/linalg/svd'
import type { Mat2 } from '../../../src/linalg'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // jsdom has no canvas; the picture is decoration plus a text alternative.
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext']
})

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

const TITLES = ['', 'Every matrix turns', 'Play a matrix', 'Before you look', 'The three matrices', 'Compress an image', 'Shape the ellipse']
const step = (n: number) => screen.getByRole('region', { name: new RegExp(`^${TITLES[n]}`) })

describe('svd lesson', () => {
  it('renders all six steps', () => {
    renderLesson()
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
  })

  it('step 1: [[2,1],[0,1]] has singular values 2.29 and 0.87', () => {
    renderLesson()
    expect(within(step(1)).getByText(/Here σ₁ = 2\.29 and σ₂ = 0\.87/)).toBeInTheDocument()
  })

  it('step 2 lists the three steps with their angles and stretches', () => {
    renderLesson()
    const s = step(2)
    expect(within(s).getByText(/turns by 31\.7° clockwise/)).toBeInTheDocument()
    expect(within(s).getByText(/x by σ₁ = 2\.29, y by σ₂ = 0\.87/)).toBeInTheDocument()
    expect(within(s).getByText(/U turns by 13\.3° counter-clockwise/)).toBeInTheDocument()
  })

  it('the progress slider moves through the steps', () => {
    renderLesson()
    const s = step(2)
    fireEvent.change(within(s).getByRole('slider'), { target: { value: '2' } })
    expect(within(s).getByText(/After step 2 \(Σ\)/)).toBeInTheDocument()
  })

  it('a reflection puts the flip in U', async () => {
    renderLesson()
    const s = step(2)
    const cell = within(s).getByLabelText('A row 2, column 2')
    await userEvent.clear(cell)
    await userEvent.type(cell, '-1')
    expect(within(s).getByText(/U flips the y-axis over/)).toBeInTheDocument()
  })

  it('step 4 output matches the matrix and |det| = σ₁σ₂', () => {
    renderLesson()
    const s = step(4)
    expect(within(s).getByLabelText('Output')).toHaveTextContent('[2.29 0.87] True')
    expect(within(s).getByText(/σ₁ × σ₂ = 2 = \|det A\| = 2/)).toBeInTheDocument()
    expect(within(s).getByText(/maps between spaces of different sizes/)).toBeInTheDocument()
  })

  it('step 5: the k slider changes storage and the NumPy output', () => {
    renderLesson()
    const s = step(5)
    expect(within(s).getByText(/260 numbers instead of 1024 \(25% of the original\)/)).toBeInTheDocument()
    fireEvent.change(within(s).getByRole('slider'), { target: { value: '16' } })
    expect(within(s).getByText(/No saving any more/)).toBeInTheDocument()
    fireEvent.change(within(s).getByRole('slider'), { target: { value: '15' } })
    expect(within(s).getByText(/rank 15, so k = 15 rebuilds it exactly/)).toBeInTheDocument()
    expect(within(s).getByLabelText('Output')).toHaveTextContent('error: 0.0%')
  })
})

describe('stage descriptions', () => {
  const s = svd2([[2, 1], [0, 1]])
  it('describe each whole step', () => {
    expect(describeStage(s, 0)).toMatch(/^Start/)
    expect(describeStage(s, 1)).toMatch(/v₁ now lies along the x-axis/)
    expect(describeStage(s, 3)).toMatch(/σ₁u₁ = \(2\.23, 0\.53\)/)
  })
  it('say when a step does nothing', () => {
    expect(stepSentences(svd2([[2, 0], [0, 1]]))[0]).toMatch(/does not turn at all/)
  })
})

describe('practice checks', () => {
  const ok = (id: string, m: Mat2) => expect(CHECKS[id](m)).toBe(true)
  const no = (id: string, m: Mat2) => expect(CHECKS[id](m)).toBe(false)

  it('circle of radius 2, not 2I', () => {
    ok('bigCircle', [[0, -2], [2, 0]])
    ok('bigCircle', [[-2, 0], [0, 2]])
    no('bigCircle', [[2, 0], [0, 2]])
  })
  it('semi-axes 3 and 1 along the diagonal', () => {
    ok('diagonal', [[2, 1], [1, 2]])
    ok('diagonal', [[1, 2], [2, 1]])
    no('diagonal', [[3, 0], [0, 1]])
  })
  it('a segment of length 4', () => {
    ok('segment', [[2, 0], [0, 0]])
    ok('segment', [[1, 1], [1, 1]])
    no('segment', [[4, 0], [0, 0]])
  })
  it('stretches 2 and 1, mirrored', () => {
    ok('mirrored', [[0, 2], [1, 0]])
    no('mirrored', [[2, 0], [0, 1]])
  })
})
