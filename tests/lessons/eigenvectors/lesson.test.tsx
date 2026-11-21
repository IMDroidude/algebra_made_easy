import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { CHECKS } from '../../../src/lessons/eigenvectors/challenges'
import { Lesson } from '../../../src/lessons/eigenvectors/Lesson'
import type { Mat2 } from '../../../src/linalg'

beforeAll(() => {
  // Mafs measures its container; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const renderLesson = () =>
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )

const step = (n: number) => screen.getByRole('region', { name: new RegExp(`^${['', 'Two vectors', 'Sweep a vector', 'Before you sweep', 'Where eigenvalues', 'PCA', 'Build matrices'][n]}`) })

describe('eigenvectors lesson', () => {
  it('renders all six steps', () => {
    renderLesson()
    for (let n = 1; n <= 6; n++) expect(step(n)).toBeInTheDocument()
  })

  it('step 1 shows the ordinary vector knocked off its line and the eigenvector kept', () => {
    renderLesson()
    const s = step(1)
    expect(within(s).getByText(/knocked 27° off the grey line/)).toBeInTheDocument()
    expect(within(s).getByText(/\(2\.12, 2\.12\) = 3 × u/)).toBeInTheDocument()
  })

  it('step 2 jumps to an eigenvector and names its eigenvalue', async () => {
    renderLesson()
    const s = step(2)
    expect(within(s).getByText(/Not an eigenvector/)).toBeInTheDocument()
    await userEvent.click(within(s).getByRole('button', { name: 'Jump to next eigenvector' }))
    expect(within(s).getByText(/v is an eigenvector, eigenvalue 3/)).toBeInTheDocument()
  })

  it('a negative eigenvalue is described as a flip', async () => {
    renderLesson()
    const s = step(2)
    await userEvent.click(within(s).getByRole('button', { name: 'Stretch and flip' }))
    await userEvent.click(within(s).getByRole('button', { name: 'Jump to next eigenvector' }))
    await userEvent.click(within(s).getByRole('button', { name: 'Jump to next eigenvector' }))
    expect(within(s).getByText(/eigenvalue -1: flipped/)).toBeInTheDocument()
  })

  it('a rotation is reported plainly as having no real eigenvectors, without NaN', async () => {
    renderLesson()
    const u = step(4)
    await userEvent.click(within(u).getByRole('button', { name: 'Rotation' }))
    expect(within(u).getByText(/no real eigenvalue and no real eigenvector/)).toBeInTheDocument()
    expect(within(u).getByLabelText('Output')).toHaveTextContent('[0.+1.j 0.-1.j]')
    expect(document.body.textContent).not.toMatch(/NaN/)
    // Step 2 shares the matrix and has nothing to jump to.
    expect(within(step(2)).getByRole('button', { name: 'Jump to next eigenvector' })).toBeDisabled()
  })

  it('the shear has one repeated eigenvalue and one line', async () => {
    renderLesson()
    const u = step(4)
    await userEvent.click(within(u).getByRole('button', { name: 'Shear' }))
    expect(within(u).getByText(/only one line of eigenvectors exists/)).toBeInTheDocument()
    expect(within(u).getByLabelText('Output')).toHaveTextContent('[1. 1.]')
  })

  it('step 4 output follows the matrix', () => {
    renderLesson()
    expect(within(step(4)).getByLabelText('Output')).toHaveTextContent('[3. 1.]')
  })

  it('PCA states that eigenvectors belong to a matrix', () => {
    renderLesson()
    expect(within(step(5)).getByText(/eigenvectors belong to a matrix/)).toBeInTheDocument()
  })
})

describe('practice checks', () => {
  const ok = (id: string, m: Mat2) => expect(CHECKS[id](m)).toBe(true)
  const no = (id: string, m: Mat2) => expect(CHECKS[id](m)).toBe(false)

  it('eigenvalues 2 and −1', () => {
    ok('twoAndMinusOne', [[2, 0], [0, -1]])
    ok('twoAndMinusOne', [[0, 1], [2, 1]]) // trace 1, det −2
    no('twoAndMinusOne', [[2, 0], [0, 1]])
  })

  it('every direction flipped and halved', () => {
    ok('everyFlipped', [[-0.5, 0], [0, -0.5]])
    no('everyFlipped', [[-0.5, 1], [0, -0.5]])
  })

  it('complex eigenvalues that also change area', () => {
    ok('turnAndScale', [[1, -2], [1, 1]])
    no('turnAndScale', [[0, -1], [1, 0]])
    no('turnAndScale', [[2, 0], [0, 3]])
  })

  it('(1, 2) as an eigenvector with eigenvalue 2', () => {
    ok('oneTwo', [[0, 1], [0, 2]])
    no('oneTwo', [[2, 0], [0, 2]])
    no('oneTwo', [[1, 0], [0, 1]])
  })
})
