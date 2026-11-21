import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { numpyPrint } from '../../../src/lib/format'
import { CORNER_VIEW, shadow } from '../../../src/linalg/project3d'
import { Cube3D } from '../../../src/lessons/3d-space/Cube3D'
import { Lesson } from '../../../src/lessons/3d-space/Lesson'
import { MemoryRouter } from 'react-router-dom'
import { FRUIT, fruitCode } from '../../../src/lessons/3d-space/fruit'
import { PRACTICE_CHECKS, PRACTICE_START } from '../../../src/lessons/3d-space/practice'
import { describeView } from '../../../src/lessons/3d-space/cube'

const step = (n: number) => document.querySelector<HTMLElement>(`section[aria-labelledby="step-${n}"]`)!

describe('Cube3D', () => {
  it('shows the point and its coordinates as text', () => {
    render(<Cube3D label="test cube" view={CORNER_VIEW} point={[2, 3, 1]} />)
    expect(screen.getByText('P (2, 3, 1)')).toBeInTheDocument()
  })

  it('turns with the arrow keys when it has a view handler', () => {
    const views: unknown[] = []
    render(<Cube3D label="test cube" view={CORNER_VIEW} onViewChange={(v) => views.push(v)} />)
    const svg = screen.getByRole('group', { name: /test cube/ })
    fireEvent.keyDown(svg, { key: 'ArrowRight' })
    fireEvent.keyDown(svg, { key: 'ArrowDown' })
    expect(views).toEqual([
      { yaw: CORNER_VIEW.yaw + 10, pitch: CORNER_VIEW.pitch },
      { yaw: CORNER_VIEW.yaw, pitch: CORNER_VIEW.pitch + 10 },
    ])
  })

  it('is not focusable when it cannot turn', () => {
    render(<Cube3D label="fixed cube" view={CORNER_VIEW} />)
    expect(screen.getByRole('group', { name: 'fixed cube' })).not.toHaveAttribute('tabindex')
  })
})

describe('describeView', () => {
  it('names the preset views and gives angles otherwise', () => {
    expect(describeView({ yaw: 0, pitch: 0 })).toMatch(/^Front view/)
    expect(describeView({ yaw: -90, pitch: 0 })).toMatch(/^Side view/)
    expect(describeView({ yaw: 0, pitch: 90 })).toMatch(/^Top view/)
    expect(describeView({ yaw: 20, pitch: -10 })).toBe('Turned 20°, tilted -10°.')
  })
})

describe('3D space lesson', () => {
  it('sliders move the point, and the shadows follow', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(2))
    fireEvent.change(s.getByLabelText(/^z coordinate/), { target: { value: '4.5' } })
    expect(s.getByText(/on the floor \(2, 0, 4\.5\), on the back wall \(2, 3, 0\), on the side wall \(0, 3, 4\.5\)/)).toBeInTheDocument()
    // The same point appears in the Understand step, with its NumPy output.
    const u = within(step(4))
    expect(u.getByLabelText('Output').textContent).toBe('[2.  0.  4.5]')
  })

  it('step 2 shows how to reach P, live, and the presets move it', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(2))
    const panel = () => s.getByTestId('walk-panel').textContent
    expect(panel()).toContain('How to reach (2, 3, 1) from the corner')
    expect(panel()).toContain('Move 2 right along the width (x).Move 3 up (y).Move 1 forward, toward you (z).')
    fireEvent.change(s.getByLabelText(/^y coordinate/), { target: { value: '0' } })
    expect(panel()).toContain('Stay put along y: the height is 0.')
    await userEvent.click(s.getByRole('button', { name: 'Origin (0, 0, 0)' }))
    expect(panel()).toContain('Stay put along x: the width is 0.Stay put along y: the height is 0.Stay put along z: the depth is 0.')
    expect(panel()).toContain('This is the origin')
    expect(s.getByRole('button', { name: 'Origin (0, 0, 0)' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(s.getByRole('button', { name: 'Equal coordinates (3, 3, 3)' }))
    expect(panel()).toContain('Move 3 right along the width (x).Move 3 up (y).Move 3 forward, toward you (z).')
    expect(panel()).toContain('All three numbers are 3')
    await userEvent.click(s.getByRole('button', { name: 'Top (xz)' }))
    await userEvent.click(s.getByRole('button', { name: 'Reset' }))
    expect(panel()).toContain('How to reach (2, 3, 1)')
    expect(s.getByText(/Corner view: all three axes visible/)).toBeInTheDocument()
  })

  it('sliders carry physical names', () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(2))
    expect(s.getByLabelText('x coordinate (width, left / right)')).toBeInTheDocument()
    expect(s.getByLabelText('y coordinate (height, down / up)')).toBeInTheDocument()
    expect(s.getByLabelText('z coordinate (depth, back / front)')).toBeInTheDocument()
    expect(s.getByText('left / right')).toBeInTheDocument()
  })

  it('the walk is drawn as three labelled legs, and zero legs are left out', () => {
    render(<Cube3D label="walk cube" view={{ yaw: -35, pitch: 22 }} point={[2, 3, 1]} walk shadows={false} />)
    expect(screen.getByText('1. 2 right')).toBeInTheDocument()
    expect(screen.getByText('2. 3 up')).toBeInTheDocument()
    expect(screen.getByText('3. 1 forward')).toBeInTheDocument()
  })

  it('a zero leg has no line and no label', () => {
    const { container } = render(
      <Cube3D label="walk cube" view={{ yaw: -35, pitch: 22 }} point={[3, 0, 2]} walk shadows={false} />,
    )
    expect(container.querySelectorAll('[data-walk] line')).toHaveLength(2)
    expect(container.querySelector('[data-leg="y"]')).toBeNull()
    expect(screen.getByText('1. 3 right')).toBeInTheDocument()
  })

  it('axis labels name the directions', () => {
    const { container } = render(<Cube3D label="names" view={{ yaw: -35, pitch: 22 }} />)
    const text = (a: string) => container.querySelector(`[data-axis-label="${a}"]`)?.textContent
    expect([text('x'), text('y'), text('z')]).toEqual(['xwidth', 'yheight', 'zdepth'])
  })

  it('step 1 builds up from one number to three', () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(1))
    expect(s.getByText('x = 2')).toBeInTheDocument()
    expect(s.getByText('(2, 3)')).toBeInTheDocument()
    expect(s.getByRole('img', { name: 'A room corner with a point at (2, 3, 1)' })).toBeInTheDocument()
    expect(s.getByText(/2 to the right \(width, x\), 3 up \(height, y\), 1 toward you \(depth, z\)/)).toBeInTheDocument()
  })

  it('step 4 readout walks x, then y, then z', () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    expect(within(step(4)).getByText(/Walk: 1\. Move 2 right along the width \(x\)\. 2\. Move 3 up \(y\)\. 3\. Move 1 forward, toward you \(z\)\. You arrive at/)).toBeInTheDocument()
  })

  it('view buttons change the view and say so', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(2))
    await userEvent.click(s.getByRole('button', { name: 'Top (xz)' }))
    expect(s.getByText(/Top view: looking straight down/)).toBeInTheDocument()
    await userEvent.click(s.getByRole('button', { name: 'Turn left' }))
    expect(s.getByText(/Turned -15°, tilted 90°/)).toBeInTheDocument()
  })

  it('NumPy shadow output matches the chosen wall', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const u = within(step(4))
    expect(u.getByLabelText('Output').textContent).toBe(numpyPrint(shadow([2, 3, 1], 'xz'), true))
    expect(u.getByLabelText('Output').textContent).toBe('[2 0 1]')
    await userEvent.click(u.getByRole('button', { name: 'side wall (yz)' }))
    expect(u.getByLabelText('Output').textContent).toBe('[0 3 1]')
    expect(u.getByText(/side = p \* np.array\(\[0, 1, 1\]\)/)).toBeInTheDocument()
  })

  it('prediction explains a wrong answer before revealing', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(3))
    expect(s.getByText(/Lock in a prediction/)).toBeInTheDocument()
    await userEvent.click(s.getByLabelText(/x = 3, y = 4/))
    await userEvent.click(s.getByRole('button', { name: /lock in/i }))
    expect(s.getByText(/mixes up which number goes missing/)).toBeInTheDocument()
  })

  it('apply step prints the shape and the selected row as NumPy does', async () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const a = within(step(5))
    expect(a.getByLabelText('Output').textContent).toBe('(8, 3)\n[2. 4. 1.]')
    await userEvent.click(a.getByRole('button', { name: /L3 lemon/ }))
    expect(a.getByLabelText('Output').textContent).toBe('(8, 3)\n[1.5 4.  4.5]')
    expect(a.getByText(/row 5 of the table, at \(1.5, 4, 4.5\)/)).toBeInTheDocument()
  })

  it('practice ticks a challenge from live state', () => {
    render(<MemoryRouter><Lesson /></MemoryRouter>)
    const s = within(step(6))
    expect(s.getByText('0 of 3 solved')).toBeInTheDocument()
    fireEvent.change(s.getByLabelText(/^x coordinate/), { target: { value: '4' } })
    fireEvent.change(s.getByLabelText(/^y coordinate/), { target: { value: '0' } })
    fireEvent.change(s.getByLabelText(/^z coordinate/), { target: { value: '0' } })
    expect(s.getByText('1 of 3 solved')).toBeInTheDocument()
    expect(s.getByText(/it is its own shadow/)).toBeInTheDocument()
  })
})

describe('fruit data', () => {
  it('apples and lemons are mixed in weight and roundness but split by sourness', () => {
    const apples = FRUIT.filter((f) => f.kind === 'apple')
    const lemons = FRUIT.filter((f) => f.kind === 'lemon')
    expect(Math.max(...apples.map((f) => f.at[2]))).toBeLessThan(Math.min(...lemons.map((f) => f.at[2])))
    // In the front view (x, y) the ranges overlap on both axes.
    for (const k of [0, 1]) {
      const a = apples.map((f) => f.at[k])
      const l = lemons.map((f) => f.at[k])
      expect(Math.max(...a)).toBeGreaterThan(Math.min(...l))
      expect(Math.max(...l)).toBeGreaterThan(Math.min(...a))
    }
  })

  it('NumPy code lists every row in order', () => {
    const code = fruitCode(3)
    expect(code).toContain('X = np.array([[2, 4, 1],')
    expect(code).toContain('[4, 4, 4]])')
    expect(code).toContain('print(X[3])')
  })
})

describe('practice checks', () => {
  it('start unsolved and accept the intended answers only', () => {
    for (const check of Object.values(PRACTICE_CHECKS)) expect(check(PRACTICE_START)).toBe(false)
    expect(PRACTICE_CHECKS.goto([1, 4, 2])).toBe(true)
    expect(PRACTICE_CHECKS.goto([2, 4, 1])).toBe(false)
    expect(PRACTICE_CHECKS.detective([4, 2.5, 1])).toBe(true)
    expect(PRACTICE_CHECKS.detective([4, 0, 1])).toBe(false)
    expect(PRACTICE_CHECKS.edge([2, 0, 0])).toBe(true)
    expect(PRACTICE_CHECKS.edge([1.5, 0, 0])).toBe(false)
    expect(PRACTICE_CHECKS.edge([3, 0, 0.5])).toBe(false)
  })
})
