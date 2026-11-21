import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CORNER_VIEW, planeSide } from '../../../src/linalg/project3d'
import { Cube3D } from '../../../src/lessons/3d-space/Cube3D'
import { Lesson } from '../../../src/lessons/3d-space/Lesson'
import { GROUPS, PLANES, PLANE_ORDER, SPLIT_LABEL_AT, SPLIT_PLANE } from '../../../src/lessons/3d-space/planes'
import { takeaways } from '../../../src/lessons/3d-space/takeaways'

const section = () => document.querySelector<HTMLElement>('section[aria-labelledby="planes-heading"]')!

describe('plane data', () => {
  it('each example point is on the side its words say', () => {
    for (const id of PLANE_ORDER) {
      const p = PLANES[id]
      expect(planeSide(p.examples[0], p.plane)).toBe(1)
      expect(planeSide(p.examples[1], p.plane)).toBe(-1)
    }
  })

  it('the tilted sheet keeps group A on one side and group B on the other', () => {
    for (const g of GROUPS) expect(planeSide(g.at, SPLIT_PLANE)).toBe(g.name.startsWith('A') ? 1 : -1)
    expect(planeSide(SPLIT_LABEL_AT, SPLIT_PLANE)).toBe(0)
  })
})

describe('Cube3D planes', () => {
  it('draws a named plane, and draws points behind it before it', () => {
    const { container } = render(
      <Cube3D
        label="plane cube"
        view={CORNER_VIEW}
        planes={[{ plane: PLANES.floor.plane, color: '#00f', label: 'Floor: y = 0' }]}
        points={[
          { at: [2, 3, 1], label: 'A', color: '#f00' },
          { at: [2, -1.5, 1], label: 'B', color: '#0f0' },
        ]}
      />,
    )
    expect(screen.getByText('Floor: y = 0')).toBeInTheDocument()
    const order = [...container.querySelectorAll('[data-plane], text')]
      .map((el) => (el.hasAttribute('data-plane') ? 'plane' : el.textContent))
      .filter((t) => t === 'A' || t === 'B' || t === 'plane')
    expect(order).toEqual(['B', 'plane', 'A'])
  })
})

describe('the planes section of the lesson', () => {
  it('starts on the floor, and the buttons switch plane', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(section())
    expect(section().textContent).toMatch(/A \(3, 2\.5, 2\) is above the floor \(y > 0\); B \(2, -1\.5, 3\) is below the floor \(y < 0\)/)
    await userEvent.click(s.getByRole('button', { name: 'Tilted sheet (y = z)' }))
    expect(s.getByRole('button', { name: 'Tilted sheet (y = z)' })).toHaveAttribute('aria-pressed', 'true')
    expect(section().textContent).toMatch(/is above the sheet \(y > z\)/)
    expect(s.getByText('Tilted sheet: y = z')).toBeInTheDocument()
  })

  it('the toggle shows two groups split by a tilted sheet, and turns the view', () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(section())
    fireEvent.click(s.getByLabelText('Show two groups split by a tilted sheet'))
    expect(s.getByText(/No point is on the wrong side/)).toBeInTheDocument()
    expect(s.getByText('A1')).toBeInTheDocument()
    expect(s.getByText('B5')).toBeInTheDocument()
    expect(s.getByText(/Turned -60°, tilted 22°/)).toBeInTheDocument()
    expect(s.getByText(/lesson 2\.3/)).toBeInTheDocument()
  })

  it('the lesson title is the new one and no old lesson numbers remain', () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('3D space: the room')
    expect(screen.getByRole('article').textContent).not.toMatch(/lesson (F\d|\d+(?![.\d]))/i)
  })
})

describe('takeaways', () => {
  it('has 3 to 5 sentences', () => {
    expect(takeaways.length).toBeGreaterThanOrEqual(3)
    expect(takeaways.length).toBeLessThanOrEqual(5)
    expect(takeaways.some((t) => /plane/.test(t))).toBe(true)
  })
})
