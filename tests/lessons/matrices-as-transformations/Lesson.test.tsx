import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/matrices-as-transformations/Lesson'

// Mafs measures its container; jsdom has no ResizeObserver, so give it a silent one.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const section = (id: string) =>
  document.querySelector(`section[aria-labelledby="${id}"]`) as HTMLElement
const card = (name: string) =>
  within(section('gallery')).getByRole('article', { name }) as HTMLElement

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

describe('matrices as transformations', () => {
  it('keeps six steps and puts the gallery between Understand and Apply', () => {
    renderLesson()
    for (const n of [1, 2, 3, 4, 5, 6]) expect(section(`step-${n}`)).not.toBeNull()
    const gallery = section('gallery')
    expect(section('step-4').compareDocumentPosition(gallery)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(gallery.compareDocumentPosition(section('step-5'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(within(gallery).getAllByRole('article')).toHaveLength(4)
  })

  it('each card starts with its default matrix and a live readout', () => {
    renderLesson()
    expect(within(card('Rotation')).getByText(/î → \(0.87, 0.5\)/)).toBeInTheDocument()
    expect(within(card('Scaling')).getByText(/î → \(2, 0\), ĵ → \(0, 0.5\)/)).toBeInTheDocument()
    expect(within(card('Reflection')).getByText(/flipped over \(determinant -1\)/)).toBeInTheDocument()
    expect(within(card('Shear')).getByText(/ĵ → \(1, 1\)/)).toBeInTheDocument()
  })

  it('controls update their card', async () => {
    renderLesson()
    fireEvent.change(within(card('Shear')).getByLabelText('k'), { target: { value: '-1.5' } })
    expect(within(card('Shear')).getByText(/ĵ → \(-1.5, 1\)/)).toBeInTheDocument()
    fireEvent.change(within(card('Rotation')).getByLabelText('θ (degrees)'), {
      target: { value: '90' },
    })
    expect(within(card('Rotation')).getByText(/î → \(0, 1\), ĵ → \(-1, 0\)/)).toBeInTheDocument()
    await userEvent.click(within(card('Reflection')).getByLabelText('line y = x'))
    expect(within(card('Reflection')).getByText(/î → \(0, 1\), ĵ → \(1, 0\)/)).toBeInTheDocument()
  })

  it('NumPy for the last changed card', async () => {
    renderLesson()
    const g = within(section('gallery'))
    fireEvent.change(within(card('Shear')).getByLabelText('k'), { target: { value: '0.5' } })
    await userEvent.click(g.getByLabelText(/Show the NumPy.*\(shear\)/))
    expect(g.getByLabelText('Output').textContent).toBe('[[0.  1.  1.5 0.5]\n [0.  0.  1.  1. ]]')
  })

  it('"Try it" loads the matrix into step 2, and step 4 follows', async () => {
    renderLesson()
    await userEvent.click(screen.getByRole('button', { name: 'Try rotation in step 2' }))
    const s2 = within(section('step-2'))
    expect(s2.getByLabelText('A row 1, column 1')).toHaveValue(0.866)
    expect(s2.getByLabelText('A row 1, column 2')).toHaveValue(-0.5)
    // v = (2, 1): A v with the 3-decimal literals NumPy receives
    expect(within(section('step-4')).getByLabelText('Output').textContent).toBe('[1.232 1.866]')
    expect(within(section('step-4')).getByText(/P = \(2, 1\) is sent to P′ = \(1.23, 1.87\)/)).toBeInTheDocument()
  })
})
