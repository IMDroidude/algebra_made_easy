import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/distance-and-similarity/Lesson'

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const section = (id: string) => document.querySelector(`section[aria-labelledby="${id}"]`) as HTMLElement
const step = (n: number) => section(`step-${n}`)
const readout = (el: HTMLElement) => el.querySelector('[aria-live]')!.textContent

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

describe('Distance and similarity lesson', () => {
  it('has the six steps in order, with two continued sections and the houses', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Distance and similarity: choosing a measure')
    const kinds = [1, 2, 3, 4, 5, 6].map((n) => step(n).querySelector('p')!.textContent)
    expect(kinds).toEqual([
      'Step 1 · See',
      'Step 2 · Manipulate',
      'Step 3 · Predict',
      'Step 4 · Understand',
      'Step 5 · Apply',
      'Step 6 · Practice',
    ])
    expect(section('baskets-heading')).toBeInTheDocument()
    expect(section('ratings-heading')).toBeInTheDocument()
    expect(section('running-example')).toBeInTheDocument()
  })

  it('step 1 gives 5, 7 and 4 for the same two points', () => {
    renderLesson()
    expect(readout(step(1))).toContain('Euclidean distance 5 (the solid line), Manhattan distance 7')
    expect(readout(step(1))).toContain('Chebyshev distance 4')
  })

  it('step 2 readout, step 4 equations and step 4 NumPy output show the same numbers', () => {
    renderLesson()
    expect(readout(step(2))).toContain('A = (2, 2), B = (6, 4): 4 across and 2 up or down. Euclidean 4.47, Manhattan 6, Chebyshev 4.')
    expect(within(step(4)).getByLabelText('Output').textContent).toBe('6.0\n4.47213595499958\n4.0')
    expect(readout(step(4))).toContain('are 4.472 apart. This is Euclidean distance: the circle.')
  })

  it('step 2 can show the circle, diamond and square through B', async () => {
    renderLesson()
    await userEvent.click(within(step(2)).getByLabelText(/Show every point/))
    expect(readout(step(2))).toContain('a circle of radius 4.47, a diamond reaching 6 along each axis, and a square reaching 4')
  })

  it('step 3 hides the distances until the prediction is locked in', async () => {
    renderLesson()
    const s = within(step(3))
    expect(readout(step(3))).toContain('stay hidden')
    expect(s.queryByRole('columnheader', { name: 'Manhattan' })).not.toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/R: it matches P exactly/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Not quite/)).toBeInTheDocument()
    expect(s.getByText(/one difference of 3 costs 3² = 9/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: /try again/i }))
    expect(readout(step(3))).toContain('stay hidden')
    await userEvent.click(s.getByLabelText(/Q: small differences everywhere/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/Correct/)).toBeInTheDocument()
    expect(readout(step(3))).toContain('Q is 2 away by Euclidean, 4 by Manhattan and 1 by Chebyshev. R is 3, 3 and 3.')
    expect(s.getByRole('columnheader', { name: 'Manhattan' })).toBeInTheDocument()
  })

  it('step 4: the p dial runs from Manhattan to Chebyshev', async () => {
    renderLesson()
    const s = within(step(4))
    fireEvent.change(s.getByLabelText('p'), { target: { value: '1' } })
    expect(readout(step(4))).toContain('are 6 apart. This is Manhattan distance: the diamond.')
    fireEvent.change(s.getByLabelText('p'), { target: { value: '3' } })
    expect(readout(step(4))).toContain('are 4.16 apart. Between the circle and the square.')
    await userEvent.click(s.getByLabelText(/Let p grow without limit/))
    expect(readout(step(4))).toContain('p = ∞')
    expect(readout(step(4))).toContain('are 4 apart. This is Chebyshev distance: the square.')
  })

  it('step 5: a longer article fools distance but not cosine', () => {
    renderLesson()
    const s = within(step(5))
    expect(readout(step(5))).toContain('The two measures agree.')
    fireEvent.change(s.getByLabelText('length of B'), { target: { value: '2' } })
    expect(readout(step(5))).toContain('2.24 to B and 2.83 to C, so it calls B the nearest')
    fireEvent.change(s.getByLabelText('length of B'), { target: { value: '3' } })
    expect(readout(step(5))).toContain('4.47 to B and 2.83 to C, so it calls C the nearest')
    expect(readout(step(5))).toContain('1.000 for B and 0.200 for C, so it calls B the most alike')
    expect(readout(step(5))).toContain('The two measures disagree')
    expect(s.getByLabelText('Output').textContent).toBe(
      'A-B  distance 4.47  cosine 1.000\nA-C  distance 2.83  cosine 0.200',
    )
  })

  it('baskets: a bigger shop inflates matching but not Jaccard', async () => {
    renderLesson()
    const el = section('baskets-heading')
    const s = within(el)
    expect(readout(el)).toContain('Both bought: milk, bread. Only one bought: eggs, butter, jam. Hamming distance 3. Jaccard similarity 2 ÷ 5 = 0.400.')
    expect(readout(el)).toContain('In a shop of 6 products they match on 3, a share of 0.5000')
    await userEvent.click(s.getByRole('button', { name: '10,000' }))
    expect(readout(el)).toContain('they match on 9,997, a share of 0.9997')
    expect(readout(el)).toContain('Jaccard similarity 2 ÷ 5 = 0.400.')
    await userEvent.click(s.getByLabelText('Sara buys eggs'))
    expect(readout(el)).toContain('Hamming distance 2. Jaccard similarity 3 ÷ 5 = 0.600.')
  })

  it('baskets: two empty baskets have no Jaccard similarity', async () => {
    renderLesson()
    const el = section('baskets-heading')
    const s = within(el)
    for (const label of ['Ali buys milk', 'Ali buys bread', 'Ali buys eggs', 'Ali buys butter', 'Sara buys milk', 'Sara buys bread', 'Sara buys jam']) {
      await userEvent.click(s.getByLabelText(label))
    }
    expect(readout(el)).toContain('Hamming distance 0. Both baskets are empty')
  })

  it('ratings: Pearson sees through strictness and through all-positive numbers', () => {
    renderLesson()
    const rows = within(section('ratings-heading')).getAllByRole('row')
    expect(rows.at(-2)).toHaveTextContent('Ali and Sara20.9941.000')
    expect(rows.at(-1)).toHaveTextContent('Ali and Omar5.10.794-0.926')
  })

  it('houses: scaling changes which house is nearest', () => {
    renderLesson()
    const box = section('running-example')
    expect(box).toHaveTextContent('On the raw numbers the nearest is house E (Terrace), at 200')
    expect(box).toHaveTextContent('House B becomes (0.4, 0.667, 0.231)')
    expect(box).toHaveTextContent('the nearest house is F (Bungalow), at 0.367')
    expect(within(box).getByLabelText('Output').textContent).toBe(
      '[400.    0.  600.  500.  200.  300.  900.  500.1]\n[0.485 0.    0.811 0.716 0.391 0.367 0.691 0.902]',
    )
  })

  it('practice: starts unsolved, and the quiz explains right and wrong picks', async () => {
    renderLesson()
    const s = within(step(6))
    expect(s.getByText('0 of 3 solved')).toBeInTheDocument()
    expect(s.getByText('0 of 7 matched')).toBeInTheDocument()
    expect(readout(step(6))).toContain('Euclidean 3.61, Manhattan 5, Chebyshev 3, cosine similarity 0.997')
    const tags = s.getByRole('combobox', { name: /Two blog posts/ })
    await userEvent.selectOptions(tags, 'Hamming')
    expect(s.getByText(/Not this one/)).toBeInTheDocument()
    expect(s.getByText('0 of 7 matched')).toBeInTheDocument()
    await userEvent.selectOptions(tags, 'Jaccard')
    expect(s.getByText(/Shared tags out of all tags used/)).toBeInTheDocument()
    expect(s.getByText('1 of 7 matched')).toBeInTheDocument()
  })
})
