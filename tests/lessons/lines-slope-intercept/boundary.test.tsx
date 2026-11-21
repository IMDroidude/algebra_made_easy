import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  FRUIT,
  FRUIT_START,
  GROUPS,
  fruitCode,
  fruitOutput,
  groupsCode,
  groupsOutput,
} from '../../../src/lessons/lines-slope-intercept/boundaryData'
import { Lesson } from '../../../src/lessons/lines-slope-intercept/Lesson'
import {
  boundaryScore,
  halfPlaneInBox,
  isAbove,
  misclassified,
  neuronForm,
  npBoolArray,
} from '../../../src/lessons/lines-slope-intercept/lineMath'
import { BOUNDARY_SET, isSplit } from '../../../src/lessons/lines-slope-intercept/practiceData'
import { takeaways } from '../../../src/lessons/lines-slope-intercept/takeaways'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

/** All multiples of `step` from lo to hi: the values a slider can reach. */
const grid = (lo: number, hi: number, step: number) =>
  Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, k) => lo + k * step)

describe('boundary maths', () => {
  it('the score is the height above the line; on the line counts as below', () => {
    expect(boundaryScore(0.5, 1, [2, 4])).toBe(2)
    expect(boundaryScore(0.5, 1, [2, 0])).toBe(-2)
    expect(isAbove(0.5, 1, [2, 4])).toBe(true)
    expect(isAbove(0.5, 1, [2, 2])).toBe(false)
  })

  it('the neuron form flips the sign of m and b, and never shows -0', () => {
    expect(neuronForm(0.5, 2.5)).toEqual({ w: [-0.5, 1], bias: -2.5 })
    const z = neuronForm(0, 0)
    expect(Object.is(z.w[0], -0)).toBe(false)
    expect(Object.is(z.bias, -0)).toBe(false)
  })

  it('npBoolArray pads True to the width of False, like NumPy', () => {
    expect(npBoolArray([true, false, true])).toBe('[ True False  True]')
    expect(npBoolArray([true, true])).toBe('[ True  True]')
  })

  it('halfPlaneInBox cuts the box along the line', () => {
    // y = 4 halves the 0…8 square.
    expect(halfPlaneInBox(0, 4, [0, 8], [0, 8], true)).toEqual([
      [8, 4],
      [8, 8],
      [0, 8],
      [0, 4],
    ])
    expect(halfPlaneInBox(0, 4, [0, 8], [0, 8], false)).toEqual([
      [0, 0],
      [8, 0],
      [8, 4],
      [0, 4],
    ])
    // A line above the whole box leaves nothing above it.
    expect(halfPlaneInBox(0, 20, [0, 8], [0, 8], true)).toEqual([])
  })
})

describe('fruit data', () => {
  it('starts with two fruits on the wrong side, and no flat line separates them', () => {
    expect(misclassified(FRUIT_START.m, FRUIT_START.b, FRUIT).map((p) => p.name)).toEqual(['A1', 'L5'])
    for (const b of grid(-2, 8, 0.25)) expect(misclassified(0, b, FRUIT).length).toBeGreaterThan(0)
    expect(misclassified(0.5, 2.5, FRUIT)).toEqual([])
  })

  it('the practice groups need a downhill line, and one exists on the slider grid', () => {
    const solutions = grid(-4, 4, 0.25).flatMap((m) => grid(-5, 5, 0.25).filter((b) => isSplit(m, b)).map((b) => [m, b]))
    expect(solutions.length).toBeGreaterThan(0)
    expect(solutions.every(([m]) => m < 0)).toBe(true)
    expect(isSplit(1, 0)).toBe(false)
    expect(isSplit(-0.5, 0)).toBe(true)
    expect(GROUPS.length).toBe(10)
  })
})

describe('NumPy output matches real NumPy 2.4', () => {
  // Printed by NumPy 2.4.6 running the exact code the lesson shows.
  const fruitFixtures: [number, number, string][] = [
    [0, 4.5, "[-0.5  1.5  0.5  2.5  2.5 -3.5 -1.5 -2.5 -0.5  0.5]\n[False  True  True  True  True False False False False  True]\n2 on the wrong side"],
    [0.5, 2.5, "[ 1.   2.5  0.5  2.   1.5 -2.5 -1.  -2.5 -1.5 -1. ]\n[ True  True  True  True  True False False False False False]\n0 on the wrong side"],
    [0.75, 1.25, "[ 2.    3.25  0.75  2.    1.25 -1.75 -0.5  -2.25 -1.75 -1.5 ]\n[ True  True  True  True  True False False False False False]\n0 on the wrong side"],
    [-1.25, 7, "[-1.75  1.5   3.    6.25  7.5  -3.5  -0.25  0.    4.5   6.75]\n[False  True  True  True  True False False False  True  True]\n3 on the wrong side"],
    [2, -2, "[ 4.  4. -1. -1. -3. -1. -1. -4. -6. -7.]\n[ True  True False False False False False False False False]\n3 on the wrong side"],
    [0.5, 3, "[ 0.5  2.   0.   1.5  1.  -3.  -1.5 -3.  -2.  -1.5]\n[ True  True False  True  True False False False False False]\n1 on the wrong side"],
  ]
  const groupFixtures: [number, number, string][] = [
    [1, 0, "4"],
    [-0.5, 0, "0"],
    [0, 0.5, "2"],
    [-0.75, 0.25, "1"],
  ]
  it.each(fruitFixtures)('fruit with m = %s, b = %s', (m, b, out) => {
    expect(fruitOutput(m, b)).toBe(out)
  })
  it.each(groupFixtures)('groups with m = %s, b = %s', (m, b, out) => {
    expect(groupsOutput(m, b)).toBe(out)
  })

  it('the code shows the live m and b as Python floats', () => {
    expect(fruitCode(0, 4.5)).toContain('m, b = 0.0, 4.5')
    expect(fruitCode(0, 4.5)).toContain('X = np.array([[1, 4], [2, 6], [4, 5], [5, 7], [6, 7],')
    expect(fruitCode(0, 4.5)).toContain('is_apple = np.array([1, 1, 1, 1, 1, 0, 0, 0, 0, 0])')
    expect(groupsCode(-0.5, 0)).toContain('m, b = -0.5, 0.0')
    expect(groupsCode(-0.5, 0)).toContain('[-4, 3], [-2, 2], [0, 2], [2, 1], [4, 0],')
  })
})

function renderLesson() {
  return render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

const boundary = () => document.querySelector<HTMLElement>('section[aria-labelledby="boundary-heading"]')!
const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!

describe('the boundary section', () => {
  it('counts the fruits on the wrong side and updates as the line tilts', async () => {
    renderLesson()
    const s = within(boundary())
    expect(s.getByText('2 on the wrong side')).toBeInTheDocument()
    expect(s.getByLabelText('Output').textContent).toBe(fruitOutput(0, 4.5))
    for (const [label, value] of [
      ['boundary slope m', '0.5'],
      ['boundary intercept b', '2.5'],
    ]) {
      const box = s.getByLabelText(label)
      await userEvent.clear(box)
      await userEvent.type(box, value)
    }
    expect(s.getByText(/No fruit on the wrong side/)).toBeInTheDocument()
    expect(s.getByLabelText('Output').textContent).toContain('0 on the wrong side')
  })

  it('the neuron toggle shows the weights and the flipped bias', async () => {
    renderLesson()
    const s = within(boundary())
    expect(s.queryByTestId('neuron-form')).toBeNull()
    await userEvent.click(s.getByLabelText('Show the rule as a neuron'))
    expect(s.getByTestId('neuron-form')).toHaveTextContent(/bias is -4.5/)
  })

  it('practice: the "Two groups" challenge ticks at 0 mistakes', async () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 4 solved')).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: BOUNDARY_SET.name }))
    expect(s.getByText(/Mistakes = 4/)).toBeInTheDocument()
    expect(s.getByLabelText('Output').textContent).toBe('4')
    for (const [label, value] of [
      ['practice slope m', '-0.5'],
      ['practice intercept b', '0'],
    ]) {
      const box = s.getByLabelText(label)
      await userEvent.clear(box)
      await userEvent.type(box, value)
    }
    expect(s.getByText('1 of 4 solved')).toBeInTheDocument()
    expect(s.getByText(/Mistakes = 0/)).toBeInTheDocument()
    expect(s.getByLabelText('Output').textContent).toBe('0')
  })
})

describe('takeaways', () => {
  it('has 3 to 5 short sentences', () => {
    expect(takeaways.length).toBeGreaterThanOrEqual(3)
    expect(takeaways.length).toBeLessThanOrEqual(5)
    for (const t of takeaways) expect(t).toMatch(/\.$/)
  })
})

it('mentions no old lesson numbers', () => {
  renderLesson()
  expect(screen.getByRole('article').textContent).not.toMatch(/lesson (F\d|\d+(?![.\d]))/i)
})
