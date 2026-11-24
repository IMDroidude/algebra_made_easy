import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import { SimilarityStep } from '../../../src/lessons/dot-product/SimilarityStep'
import {
  ANIMAL_CHECKS,
  START,
  activeVectors,
  animalSnippet,
  clampFeature,
  grade,
  hasZeroVector,
} from '../../../src/lessons/dot-product/animals'
import fixtures from './animals-fixtures.json'

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

describe('animal data', () => {
  it('uses two features until wheels is switched on', () => {
    expect(activeVectors(START, false)).toEqual([[4, 1], [4, 4], [0, 3]])
    expect(activeVectors(START, true)).toEqual(START)
  })

  it('spots a vector with every active feature at 0', () => {
    expect(hasZeroVector(START, false)).toBe(false)
    // A car that is only wheels is fine with three features, but all zeros with two.
    const onlyWheels = [[4, 1, 0], [4, 4, 0], [0, 0, 4]]
    expect(hasZeroVector(onlyWheels, true)).toBe(false)
    expect(hasZeroVector(onlyWheels, false)).toBe(true)
  })

  it('keeps features whole and between 0 and 5, never −0', () => {
    expect(clampFeature(2.6)).toBe(3)
    expect(clampFeature(7)).toBe(5)
    expect(Object.is(clampFeature(-0.2), 0)).toBe(true)
  })

  it('words the cosine in grades', () => {
    expect(grade(1)).toBe('almost the same direction')
    expect(grade(0.857)).toBe('very similar')
    expect(grade(0.707)).toBe('somewhat similar')
    expect(grade(0.424)).toBe('only a little alike')
    expect(grade(0.146)).toBe('almost nothing in common')
    expect(grade(0)).toBe('nothing in common')
  })

  it('checks the two goals', () => {
    expect(ANIMAL_CHECKS.impostor(START, false)).toBe(false)
    expect(ANIMAL_CHECKS.nothing(START, false)).toBe(false)
    // A small furry "car" is closer to the cat than the tiger is.
    expect(ANIMAL_CHECKS.impostor([[4, 1, 0], [4, 4, 0], [4, 1, 0]], false)).toBe(true)
    // A cat that is only furry and a car that is only big share nothing.
    expect(ANIMAL_CHECKS.nothing([[4, 0, 0], [4, 4, 0], [0, 3, 4]], false)).toBe(true)
  })
})

describe('animal snippet matches real NumPy', () => {
  it('starting values with two features', () => {
    const s = animalSnippet(START, false)
    expect(s.code).toContain('# rows: cat, tiger, car   columns: furry, big')
    expect(s.code).toContain('X = np.array([[4, 1],\n              [4, 4],\n              [0, 3]])')
    expect(s.output).toBe(
      '[[17 20  3]\n [20 32 12]\n [ 3 12  9]]\n[[1.    0.857 0.243]\n [0.857 1.    0.707]\n [0.243 0.707 1.   ]]',
    )
  })

  it.each(fixtures.animals)('X = $X', ({ X, numpy }) => {
    const wheels = X[0].length === 3
    const features = X.map((r) => (wheels ? r : [...r, 0]))
    expect(animalSnippet(features, wheels).output).toBe(numpy)
  })
})

describe('step 5: cat, tiger and car', () => {
  const readout = () => document.querySelector('[aria-live]')!.textContent
  const output = () => screen.getByLabelText('Output').textContent

  it('starts on cat and tiger with the calculation, table and code agreeing', () => {
    render(<SimilarityStep />)
    expect(readout()).toContain('cat = (4, 1) and 🐯 tiger = (4, 4): dot product 20, cosine similarity 0.857, very similar')
    expect(readout()).toContain('biggest share of the dot product comes from furry (16 of 20)')
    expect(readout()).toContain('closest is cat and tiger (0.857) and the least alike is cat and car (0.243)')
    expect(screen.getByText(/cosine = 20 ÷ \(4\.123 × 5\.657\) =/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cat and tiger: cosine 0.857' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'tiger and car: cosine 0.707' })).toHaveAttribute('aria-pressed', 'false')
    expect(output()).toContain('[0.857 1.    0.707]')
  })

  it('choosing a cell changes the pair being explained', async () => {
    render(<SimilarityStep />)
    await userEvent.click(screen.getByRole('button', { name: 'tiger and car: cosine 0.707' }))
    expect(readout()).toContain('tiger = (4, 4) and 🚗 car = (0, 3): dot product 12, cosine similarity 0.707, somewhat similar')
    expect(readout()).toContain('comes from big (12 of 12)')
  })

  it('adding wheels pulls the tiger and the car apart', async () => {
    render(<SimilarityStep />)
    await userEvent.click(screen.getByLabelText('Add a third feature: wheels'))
    expect(screen.getByRole('button', { name: 'tiger and car: cosine 0.424' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cat and car: cosine 0.146' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cat and tiger: cosine 0.857' })).toBeInTheDocument()
    expect(screen.getByLabelText('car wheels')).toHaveValue('4')
    expect(output()).toBe(
      '[[17 20  3]\n [20 32 12]\n [ 3 12 25]]\n[[1.    0.857 0.146]\n [0.857 1.    0.424]\n [0.146 0.424 1.   ]]',
    )
  })

  it('a slider changes every view, and ticks a goal when it is met', () => {
    render(<SimilarityStep />)
    expect(screen.getByText('0 of 2 solved')).toBeInTheDocument()
    // Cat (4, 0) and car (0, 3) share no feature.
    fireEvent.change(screen.getByLabelText('cat big'), { target: { value: '0' } })
    expect(screen.getByRole('button', { name: 'cat and car: cosine 0.000' })).toBeInTheDocument()
    expect(readout()).toContain('cat = (4, 0)')
    expect(output()).toContain('[[16 16  0]')
    expect(screen.getByText('1 of 2 solved')).toBeInTheDocument()
  })

  it('refuses a change that would leave a vector of all zeros', () => {
    render(<SimilarityStep />)
    fireEvent.change(screen.getByLabelText('car big'), { target: { value: '0' } })
    expect(readout()).toContain('That change was refused')
    expect(screen.getByLabelText('car big')).toHaveValue('3')
  })

  it('the raw dot products stay hidden until the prediction is locked in', async () => {
    render(<SimilarityStep />)
    expect(screen.queryByLabelText('Show raw dot products')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText(/The cat itself/))
    await userEvent.click(screen.getByRole('button', { name: /lock in/i }))
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
    expect(screen.getByText(/cat · cat = 4×4 \+ 1×1\s+= 17, but cat · tiger =\s+4×4 \+ 1×4 = 20/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.queryByLabelText('Show raw dot products')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('The tiger'))
    await userEvent.click(screen.getByRole('button', { name: /lock in/i }))
    expect(screen.getByText(/Correct/)).toBeInTheDocument()
    expect(screen.getByLabelText('Show raw dot products')).toBeChecked()
    expect(screen.getByRole('button', { name: 'cat and tiger: dot product 20' })).toBeInTheDocument()
    const table = within(screen.getByRole('table'))
    // The diagonal: cat · cat = 17 is smaller than cat · tiger = 20.
    expect(table.getByText('17')).toBeInTheDocument()
  })
})
