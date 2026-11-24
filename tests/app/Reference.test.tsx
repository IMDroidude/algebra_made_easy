import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Reference } from '../../src/app/Reference'
import { MEANING_TYPES, PROPERTY_TYPES } from '../../src/data/vectorTypes'

function renderReference() {
  render(
    <MemoryRouter>
      <Reference />
    </MemoryRouter>,
  )
}

const section = () => document.querySelector('section[aria-labelledby="vector-types"]') as HTMLElement
const panel = (name: string) => document.getElementById(`${name}-panel`) as HTMLElement

describe('Reference page: types of vector', () => {
  it('sits between the objects section and the operations section', () => {
    renderReference()
    const ids = screen.getAllByRole('heading', { level: 2 }).map((h) => h.id)
    expect(ids).toEqual(['objects', 'vector-types', 'operations'])
    expect(screen.getByRole('heading', { level: 2, name: 'Types of vector' })).toBeInTheDocument()
  })

  it('shows the pipeline from object to model', () => {
    renderReference()
    expect(screen.getByTestId('vector-pipeline')).toHaveTextContent(
      'real-world object→numbers→vector→model',
    )
  })

  it('has a button for every type in both groups, with the first of each chosen', () => {
    renderReference()
    const s = within(section())
    for (const t of [...MEANING_TYPES, ...PROPERTY_TYPES]) {
      expect(s.getByRole('button', { name: t.name })).toBeInTheDocument()
    }
    expect(s.getAllByRole('button', { pressed: true }).map((b) => b.textContent)).toEqual([
      '▸Feature vector',
      '▸Column / row vector',
    ])
    expect(panel('vector-meaning')).toHaveTextContent('[34, 120, 6, 1]')
  })

  it('choosing a type shows its object, numbers, vector and use', async () => {
    const user = userEvent.setup()
    renderReference()
    const s = within(section())
    await user.click(s.getByRole('button', { name: 'Probability vector' }))
    expect(s.getByRole('button', { name: 'Probability vector' })).toHaveAttribute('aria-pressed', 'true')
    expect(s.getByRole('button', { name: 'Feature vector' })).toHaveAttribute('aria-pressed', 'false')
    const p = panel('vector-meaning')
    expect(within(p).getByRole('heading', { name: 'Probability vector' })).toBeInTheDocument()
    for (const label of ['Each number is', 'Object', 'Numbers', 'Vector', 'Used for']) {
      expect(within(p).getByText(label)).toBeInTheDocument()
    }
    expect(p).toHaveTextContent('[0.665, 0.245, 0.09]')
    expect(p).toHaveTextContent('The output of a classifier or a language model.')
    // The other group keeps its own choice.
    expect(panel('vector-property')).toHaveTextContent('Column / row vector')
  })

  it('works by keyboard', async () => {
    const user = userEvent.setup()
    renderReference()
    const unit = within(section()).getByRole('button', { name: 'Unit vector' })
    unit.focus()
    await user.keyboard('{Enter}')
    expect(unit).toHaveAttribute('aria-pressed', 'true')
    expect(panel('vector-property')).toHaveTextContent(
      '[3, 4] has length 5, so [0.6, 0.8] is its unit vector.',
    )
  })

  it('also lists every type in a table', () => {
    renderReference()
    const tables = section().querySelectorAll('table')
    expect(tables).toHaveLength(2)
    expect(tables[0].querySelectorAll('tbody tr')).toHaveLength(MEANING_TYPES.length)
    expect(tables[1].querySelectorAll('tbody tr')).toHaveLength(PROPERTY_TYPES.length)
    expect(tables[0].closest('.overflow-x-auto')).not.toBeNull()
    expect(tables[1].closest('.overflow-x-auto')).not.toBeNull()
  })
})
