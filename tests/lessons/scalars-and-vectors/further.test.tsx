import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/scalars-and-vectors/Lesson'

// Mafs measures its container; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const section = (id: string) =>
  within(document.querySelector(`section[aria-labelledby="${id}"]`) as HTMLElement)

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

describe('Going further sections of the vector lesson', () => {
  it('come after the six steps, in order', () => {
    renderLesson()
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    const at = (t: string) => titles.indexOf(t)
    expect(at('Kinds of vector')).toBeGreaterThan(at('Try it yourself') === -1 ? 5 : at('Try it yourself'))
    expect(at('Transformations and projections')).toBe(at('Kinds of vector') + 1)
    expect(at('Dot and cross products')).toBe(at('Kinds of vector') + 2)
  })

  it('kinds: shows the unit vector of (3, 4) and the wind example', () => {
    renderLesson()
    const s = section('kinds-of-vector')
    expect(s.getByText(/has length 5\. Divide each/)).toHaveTextContent(
      'v = (3, 4) has length 5. Divide each entry by 5: the unit vector û = (0.6, 0.8)',
    )
    expect(s.getByText(/Think of wind/)).toHaveTextContent('5 × (0.6, 0.8) = (3, 4)')
    expect(s.getByLabelText('Output')).toHaveTextContent('5.0 [0.6 0.8] (2,) (1, 2) (2, 1) [0. 0.]')
  })

  it('kinds: the basket starts sparse, turns into the zero vector when emptied, and dense when filled', async () => {
    renderLesson()
    const s = section('kinds-of-vector')
    expect(s.getByText(/^basket = /)).toHaveTextContent(
      'basket = [0, 2, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0]. 3 of 12 entries are non-zero, so 75% are zeros: a sparse vector. Sparse storage keeps only bread: 2, milk: 1, eggs: 6.',
    )
    await userEvent.click(s.getByRole('button', { name: 'Empty the basket' }))
    expect(s.getByText(/^basket = /)).toHaveTextContent('an empty basket is the zero vector of this shop')
    await userEvent.click(s.getByRole('button', { name: /^apples: 0 in the basket/ }))
    expect(s.getByText(/^basket = /)).toHaveTextContent('1 of 12 entries is non-zero, so 92% are zeros: a sparse vector')
    for (const name of ['bread', 'milk', 'eggs', 'rice', 'tea']) {
      await userEvent.click(s.getByRole('button', { name: new RegExp(`^${name}: 0 in the basket`) }))
    }
    expect(s.getByText(/^basket = /)).toHaveTextContent('6 of 12 entries are non-zero, so 50% are zeros: a dense vector')
  })

  it('transformations: each mode shows its result for the nose (3, 1)', async () => {
    renderLesson()
    const s = section('transformations-and-projections')
    expect(s.getByText(/Turning by 90°/)).toHaveTextContent('p = (3, 1) to p′ = (-1, 3). Both are 3.16 from the origin')
    expect(s.getByLabelText('Output')).toHaveTextContent('[-1. 3.]')

    await userEvent.click(s.getByRole('button', { name: 'Scale' }))
    expect(s.getByText(/x is multiplied by 1.5 and y by 0.5/)).toHaveTextContent('p′ = (4.5, 0.5). Unequal factors stretch')
    expect(s.getByLabelText('Output')).toHaveTextContent('[4.5 0.5]')
    fireEvent.change(s.getByRole('slider', { name: 'sx' }), { target: { value: '-1' } })
    expect(s.getByText(/x is multiplied by -1/)).toHaveTextContent('A negative factor mirrors the ship.')

    await userEvent.click(s.getByRole('button', { name: 'Translate' }))
    expect(s.getByText(/Every corner moves by/)).toHaveTextContent('t = (2, -1): the nose p = (3, 1) goes to p′ = (5, 0)')
    expect(s.getByLabelText('Output')).toHaveTextContent('[5 0]')
  })

  it('projection: the spread kept changes with the line, and PCA’s line can be shown', async () => {
    renderLesson()
    const s = section('transformations-and-projections')
    await userEvent.click(s.getByRole('button', { name: 'Project' }))
    expect(s.getByText(/^Line at 0°/)).toHaveTextContent(
      'The six shadows sit at -3, -2, -1, 1, 2, 3 along it: one number per person instead of two. Their spread is 4.67 out of 7.25, so this line keeps 64% of the spread.',
    )
    fireEvent.change(s.getByRole('slider', { name: 'line angle' }), { target: { value: '35' } })
    expect(s.getByText(/^Line at 35°/)).toHaveTextContent('Their spread is 7.19 out of 7.25, so this line keeps 99% of the spread.')
    expect(s.getByLabelText('Output')).toHaveTextContent('[-3.6 -2.5 -1.39 1.11 2.79 3.6 ] 7.19')
    await userEvent.click(s.getByLabelText('Show the line PCA would pick'))
    expect(s.getByText(/^Line at 35°/)).toHaveTextContent('The dashed line, at 36.5°, is the one PCA picks: it keeps 99.3%')
  })

  it('products: shows the bill, the worked cross product, and both products of a and b', () => {
    renderLesson()
    const s = section('dot-and-cross')
    expect(s.getByText(/A shopping bill is a dot product/)).toHaveTextContent('2 apples, 1 bread, 3 milk at prices of 0.5, 2, 1.5 each')
    expect(s.getByText(/Check the right angles/)).toHaveTextContent('(-3, 6, -3) · (1, 2, 3) = 0 and (-3, 6, -3) · (4, 5, 6) = 0')
    expect(s.getByText(/Dot product:/).closest('div')).toHaveTextContent(
      'a = (3, 0, 0), b = (1, 2, 0). Dot product: a · b = 3 · 1 + 0 · 2 + 0 · 0 = 3, a number. Cross product: a × b = (0, 0, 6), a vector pointing straight up out of the floor because b is counter-clockwise from a. Its length, 6, is the area of the shaded parallelogram.',
    )
    expect(s.getByLabelText('Output')).toHaveTextContent('3 [0 0 6] [ 0 0 -6]')
    expect(s.getByRole('img', { name: /cross product points straight up, length 6/ })).toBeInTheDocument()
  })
})
