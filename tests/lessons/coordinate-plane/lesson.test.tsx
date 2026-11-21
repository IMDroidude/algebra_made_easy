import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/coordinate-plane/Lesson'
import { EMAILS, NEW_EMAIL_START, emailCode } from '../../../src/lessons/coordinate-plane/emails'
import {
  PREDICT_FROM,
  PREDICT_TO,
  LIMIT,
  describeRegion,
  moveText,
  noNegZero,
  pointTag,
  snapWhole,
  walkSentence,
  numpyScalar,
  regionOf,
  walkText,
} from '../../../src/lessons/coordinate-plane/plane'
import { PRACTICE_CHECKS, PRACTICE_START } from '../../../src/lessons/coordinate-plane/practice'
import { MAX_PINS, addPin, pinName } from '../../../src/lessons/coordinate-plane/pins'
import { QUIZ, answerOf, choicesFor, diagnose, promptOf } from '../../../src/lessons/coordinate-plane/quiz'
import { numpyPrint } from '../../../src/lib/format'

/** The lesson header links to earlier lessons, so it needs a router. */
const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!
/** The first live readout of a step, as one string. */
const readout = (n: number) => step(n).querySelector('[aria-live]')!.textContent

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

describe('regions', () => {
  it('numbers the quadrants counter-clockwise from the top right', () => {
    expect(regionOf([3, 2])).toBe('I')
    expect(regionOf([-3, 2])).toBe('II')
    expect(regionOf([-1, -0.5])).toBe('III')
    expect(regionOf([2, -4])).toBe('IV')
  })

  it('puts points on an axis in no quadrant', () => {
    expect(regionOf([0, 0])).toBe('origin')
    expect(regionOf([2, 0])).toBe('x-axis')
    expect(regionOf([0, -3])).toBe('y-axis')
    expect(regionOf([1e-9, 4])).toBe('y-axis')
    expect(describeRegion([0, -3])).toMatch(/on the y-axis \(x is 0\)/)
    expect(describeRegion([-3, 2])).toBe('It is in quadrant II: x negative, y positive.')
  })
})

describe('live point label (Desmos style, but never silent on an axis)', () => {
  it('names the quadrant, or the axis, or the origin', () => {
    expect(pointTag([3, 2])).toBe('Quadrant I')
    expect(pointTag([-3, 2])).toBe('Quadrant II')
    expect(pointTag([-3, -2])).toBe('Quadrant III')
    expect(pointTag([3, -2])).toBe('Quadrant IV')
    expect(pointTag([4, 0])).toBe('on the x-axis')
    expect(pointTag([0, -7])).toBe('on the y-axis')
    expect(pointTag([0, 0])).toBe('origin')
  })
})

describe('walk text and snapping', () => {
  it('walkSentence names each leg with its axis, x first', () => {
    expect(walkSentence([3, 2])).toBe('Move 3 right (x), then 2 up (y)')
    expect(walkSentence([-10, -1])).toBe('Move 10 left (x), then 1 down (y)')
    expect(walkSentence([0, 5])).toBe('Move 0 right or left (x), then 5 up (y)')
    expect(moveText(0, 'up', 'down', 'y')).toBe('0 up or down (y)')
  })

  it('snaps to whole numbers within ±10', () => {
    expect(LIMIT).toBe(10)
    expect(snapWhole([2.4, -0.6])).toEqual([2, -1])
    expect(snapWhole([13, -12.2])).toEqual([10, -10])
  })
})

describe('text helpers', () => {
  it('walkText gives direction from the sign and distance from the size', () => {
    expect(walkText(3, 'right', 'left')).toBe('3 steps right')
    expect(walkText(-2.5, 'up', 'down')).toBe('2.5 steps down')
    expect(walkText(-1, 'right', 'left')).toBe('1 step left')
    expect(walkText(0, 'up', 'down')).toBe('0 steps up')
  })

  it('noNegZero removes −0', () => {
    const [x, y] = noNegZero([-0, 2])
    expect(Object.is(x, 0)).toBe(true)
    expect(y).toBe(2)
  })

  it('numpyScalar matches how NumPy prints one element', () => {
    // np.array([3, 2])[0] -> 3 ; np.array([3, 2.5])[0] -> 3.0
    expect(numpyScalar(3, true)).toBe('3')
    expect(numpyScalar(-4, true)).toBe('-4')
    expect(numpyScalar(3, false)).toBe('3.0')
    expect(numpyScalar(2.5, false)).toBe('2.5')
    expect(numpyScalar(-0.5, false)).toBe('-0.5')
    expect(numpyScalar(0, false)).toBe('0.0')
  })
})

describe('prediction', () => {
  it('flipping the sign of x keeps y and the distance from the y-axis', () => {
    expect(PREDICT_TO[0]).toBe(-PREDICT_FROM[0])
    expect(PREDICT_TO[1]).toBe(PREDICT_FROM[1])
    expect(regionOf(PREDICT_FROM)).toBe('I')
    expect(regionOf(PREDICT_TO)).toBe('II')
  })
})

describe('apply: emails', () => {
  it('normal emails sit near the origin, spam up and to the right', () => {
    const normal = EMAILS.filter((e) => e.kind === 'normal')
    const spam = EMAILS.filter((e) => e.kind === 'spam')
    expect(Math.max(...normal.map((e) => e.at[0] + e.at[1]))).toBeLessThan(
      Math.min(...spam.map((e) => e.at[0] + e.at[1])),
    )
    expect(EMAILS.every((e) => regionOf(e.at) === 'I' || regionOf(e.at) === 'x-axis' || regionOf(e.at) === 'y-axis')).toBe(true)
  })

  it('NumPy code and output match the dataset and the new email', () => {
    const code = emailCode(NEW_EMAIL_START)
    expect(code).toContain('X = np.array([[1, 0],')
    expect(code).toContain('[4, 5]])')
    expect(code).toContain('new = np.array([2, 3])')
    expect(numpyPrint(NEW_EMAIL_START, true)).toBe('[2 3]')
  })
})

describe('practice checks', () => {
  it('start unsolved and accept the intended answers only', () => {
    for (const check of Object.values(PRACTICE_CHECKS)) expect(check(PRACTICE_START)).toBe(false)
    expect(PRACTICE_CHECKS.target([-3, 2])).toBe(true)
    expect(PRACTICE_CHECKS.target([2, -3])).toBe(false)
    expect(PRACTICE_CHECKS.yaxis([0, -2.5])).toBe(true)
    expect(PRACTICE_CHECKS.yaxis([0, 0])).toBe(false)
    expect(PRACTICE_CHECKS.yaxis([0, 3])).toBe(false)
    expect(PRACTICE_CHECKS.four([3.5, -4])).toBe(true)
    expect(PRACTICE_CHECKS.four([0, -4])).toBe(false)
    expect(PRACTICE_CHECKS.four([3, 4])).toBe(false)
    expect(PRACTICE_CHECKS.swap([-2, -2])).toBe(true)
    expect(PRACTICE_CHECKS.swap([2, 2])).toBe(false)
    expect(PRACTICE_CHECKS.swap([0, 0])).toBe(false)
  })
})

describe('read-and-plot quiz', () => {
  it('uses points not shown elsewhere and has the right answers', () => {
    expect(QUIZ.map(answerOf)).toEqual([[-4, 3], [2, -5], [0, -6], [-7, -2], [-7, 3], [5, -8]])
    expect(promptOf(QUIZ[4])).toBe('You are at (-3, -1). Move 4 left (x) and 4 up (y). Where do you land?')
  })

  it('offers four distinct choices including the answer and the classic slips', () => {
    for (const q of QUIZ.filter((q) => q.kind !== 'plot')) {
      const c = choicesFor(q)
      expect(c).toHaveLength(4)
      expect(new Set(c.map(String)).size).toBe(4)
      expect(c.some((p) => String(p) === String(answerOf(q)))).toBe(true)
    }
    expect(choicesFor(QUIZ[0])).toEqual([[-4, -3], [-4, 3], [3, -4], [4, 3]])
    // On an axis: no "-0", and the swapped point (on the x-axis) is offered.
    expect(choicesFor(QUIZ[2])).toEqual([[-6, 0], [0, -6], [0, 6], [6, 0]])
    // Move: counting from the origin is one of the traps.
    expect(choicesFor(QUIZ[4]).map(String)).toContain('-4,4')
  })

  it('names the slip behind a wrong answer', () => {
    expect(diagnose(QUIZ[0], [-4, 3])).toMatchObject({ correct: true, title: 'Correct: (-4, 3).' })
    expect(diagnose(QUIZ[0], [-4, 3]).detail).toBe('Move 4 left (x), then 3 up (y): that is (-4, 3).')
    expect(diagnose(QUIZ[0], [3, -4]).title).toMatch(/You swapped x and y/)
    expect(diagnose(QUIZ[0], [4, 3]).title).toMatch(/sign of x is flipped/)
    expect(diagnose(QUIZ[0], [-4, -3]).title).toMatch(/sign of y is flipped/)
    expect(diagnose(QUIZ[1], [-2, 5]).title).toMatch(/Both signs/)
    expect(diagnose(QUIZ[2], [-6, 0]).title).toMatch(/You swapped x and y/)
    expect(diagnose(QUIZ[2], [6, 0]).title).toMatch(/on the y-axis, not the x-axis/)
    expect(diagnose(QUIZ[4], [-4, 4]).title).toMatch(/counted the move from the origin/)
    expect(diagnose(QUIZ[4], [1, 3]).title).toMatch(/wrong way along x/)
    expect(diagnose(QUIZ[4], [-7, -5]).title).toMatch(/wrong way along y/)
    expect(diagnose(QUIZ[4], [-7, 3]).detail).toBe(
      'Start at (-3, -1): 4 left (x) gives x = -7, then 4 up (y) gives y = 3. You land on (-7, 3).',
    )
  })
})

describe('pinned points', () => {
  it('letters pins A, B, C… and ignores duplicates and overflow', () => {
    expect(pinName(0)).toBe('A')
    expect(pinName(3)).toBe('D')
    let pins = addPin([], [1, 2])
    pins = addPin(pins, [1, 2])
    expect(pins).toEqual([[1, 2]])
    for (let i = 0; i < 20; i++) pins = addPin(pins, [i, -i])
    expect(pins).toHaveLength(MAX_PINS)
  })
})

describe('coordinate plane lesson', () => {
  it('renders all six steps', () => {
    renderLesson()
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
    expect(readout(1)).toBe('P = (3, 2): Move 3 right (x), then 2 up (y).')
  })

  it('manipulate step has linked x and y sliders from -10 to 10', () => {
    renderLesson()
    const s = within(step(2))
    const x = s.getByRole('slider', { name: 'x' })
    expect(x).toHaveAttribute('min', '-10')
    expect(x).toHaveAttribute('max', '10')
    // jsdom does not move range inputs with the keyboard; set the value directly.
    fireEvent.change(x, { target: { value: '-1' } })
    expect(readout(2)).toBe('P = (-1, 2): Move 1 left (x), then 2 up (y). It is in quadrant II: x negative, y positive.')
    // The point is shared with step 4, whose NumPy output follows.
    expect(within(step(4)).getByLabelText('Output').textContent).toBe('-1\n2')
  })

  it('practice quiz: a wrong pick is diagnosed, then the next question comes', async () => {
    renderLesson()
    const s = within(step(6))
    await userEvent.click(s.getByRole('button', { name: 'Quick quiz' }))
    expect(s.getByText('Question 1 of 6 · 0 correct so far')).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: '(3, -4)' }))
    expect(s.getByText(/You swapped x and y/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: 'Next question' }))
    expect(s.getByText('Put the point A at (2, -5), then check.')).toBeInTheDocument()
  })

  it('step 2 pins points into a table', async () => {
    renderLesson()
    const s = within(step(2))
    await userEvent.click(s.getByLabelText(/Pin several points/))
    await userEvent.click(s.getByRole('button', { name: 'Pin A at (3, 2)' }))
    const row = s.getAllByRole('row')[1]
    expect(row.textContent).toBe('A32Quadrant I')
    expect(s.getByRole('button', { name: 'Pin B at (3, 2)' })).toBeDisabled()
  })

  it('ends by pointing to lesson 1.3 for a third axis', () => {
    renderLesson()
    expect(screen.getByRole('link', { name: /1\.3: 3D space: the room/ })).toHaveAttribute('href', '#/lessons/3d-space')
  })

  it('understand step shows x and y in NumPy order', () => {
    renderLesson()
    const u = within(step(4))
    expect(u.getByLabelText('Output').textContent).toBe('3\n2')
    expect(u.getByText(/Swapping the numbers gives \(2, 3\), a different point/)).toBeInTheDocument()
  })

  it('prediction explains the "negative means smaller" misconception', async () => {
    renderLesson()
    const s = within(step(3))
    await userEvent.click(s.getByLabelText(/Closer to the origin/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/the minus sign means/)).toBeInTheDocument()
  })
})
