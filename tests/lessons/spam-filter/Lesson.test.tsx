import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { Lesson } from '../../../src/lessons/spam-filter/Lesson'
import { takeaways } from '../../../src/lessons/spam-filter/takeaways'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
})

const step = (n: number) => document.querySelector(`section[aria-labelledby="step-${n}"]`) as HTMLElement
const readout = (el: HTMLElement) => el.querySelector('[aria-live]')!.textContent
const output = (el: HTMLElement) => within(el).getAllByLabelText('Output')[0].textContent

function renderLesson() {
  render(
    <MemoryRouter>
      <Lesson />
    </MemoryRouter>,
  )
}

async function predict(el: HTMLElement, answer: RegExp) {
  await userEvent.click(within(el).getByLabelText(answer))
  const buttons = within(el).getAllByRole('button', { name: 'Lock in my prediction' })
  await userEvent.click(buttons[buttons.length - 1])
}

describe('Spam filter lesson', () => {
  it('has the header, the hero and six steps in order', () => {
    renderLesson()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Build a spam filter')
    const hero = document.querySelector('section[aria-labelledby="whole-story"]') as HTMLElement
    expect(readout(hero)).toContain('Normal centre (1, 1), spam centre (4, 4). The learned line is x + y = 5')
    expect(readout(hero)).toContain('8 of 8 land on the correct side')
    const kinds = [1, 2, 3, 4, 5, 6].map((n) => step(n).querySelector('p')!.textContent)
    expect(kinds).toEqual([
      'Step 1 · See',
      'Step 2 · Manipulate',
      'Step 3 · Predict',
      'Step 4 · Understand',
      'Step 5 · Apply',
      'Step 6 · Practice',
    ])
    expect(screen.getByRole('region', { name: 'The same recipe sorts the houses' })).toBeInTheDocument()
  })

  it('step 1: choosing an email updates the walk and the NumPy row', async () => {
    renderLesson()
    expect(readout(step(1))).toContain('N3 is row 3 of X: the vector (1, 2). From the origin, walk 1 step right')
    expect(output(step(1))).toBe('(8, 2)\n[1 2]')
    await userEvent.click(within(step(1)).getByRole('button', { name: 'S3' }))
    expect(readout(step(1))).toContain('S3 is row 7 of X: the vector (5, 4). From the origin, walk 5 steps right')
    expect(output(step(1))).toBe('(8, 2)\n[5 4]')
  })

  it('step 2: centres, d, equation and NumPy agree', () => {
    renderLesson()
    expect(readout(step(2))).toContain('Normal centre = ((1 + 0 + 1 + 2) / 4, (0 + 1 + 2 + 1) / 4) = (1, 1)')
    expect(readout(step(2))).toContain('Spam centre = ((4 + 3 + 5 + 4) / 4, (3 + 4 + 4 + 5) / 4) = (4, 4)')
    expect(readout(step(2))).toContain('d = spam centre − normal centre = (3, 3)')
    expect(output(step(2))).toBe('[1. 1.]\n[4. 4.]\n[3. 3.]')
  })

  it('step 3: the line, then the new email, are revealed only after predicting', async () => {
    renderLesson()
    expect(readout(step(3))).toContain('No line yet')
    await predict(step(3), /Along the arrow d/)
    expect(within(step(3)).getByText(/cutting each group in half/)).toBeInTheDocument()
    await userEvent.click(within(step(3)).getByRole('button', { name: 'Try again' }))
    await predict(step(3), /halfway between the centres/)
    expect(readout(step(3))).toContain('passes through the midpoint (2.5, 2.5) at right angles to d: it is x + y = 5')
    await predict(step(3), /The normal side/)
    expect(readout(step(3))).toContain('(3, 1) scores 3 + 1 = 4, below 5: it is on the normal side')
  })

  it('step 4: derivation numbers, NumPy, the doubled-w prediction and the scatter part', async () => {
    renderLesson()
    const s = step(4)
    expect(readout(s)).toContain('d = (3, 3), w = (1, 1); midpoint (2.5, 2.5); threshold b = 5. The boundary is x + y = 5.')
    expect(output(s)).toBe('[3. 3.] [1. 1.]\n[2.5 2.5] 5.0')
    await predict(s, /stays exactly where it is/)
    expect(readout(s)).toContain('With 2w = (2, 2) the threshold becomes 10: the line 2x + 2y = 10 is the same line.')
    await userEvent.click(within(s).getByLabelText(/Optional, advanced/))
    expect(s).toHaveTextContent('The normal deviations are (0, -1), (-1, 0), (0, 1), (1, 0)')
    expect(s.textContent).toContain('S_w = [[4, 0], [0, 4]]')
    expect(s.textContent).toContain('Plain line (dashed): x + y = 5, wrong on none')
    expect(within(s).getAllByLabelText('Output')[0].textContent).toBe('[[4. 0.]\n [0. 4.]]\n[0.75 0.75]')
    await userEvent.click(within(s).getByLabelText('A stretched inbox'))
    expect(s.textContent).toContain('S_w = [[36, 0], [0, 4]]. Plain line (dashed): x + y = 6, wrong on N2 and S1.')
    expect(s.textContent).toContain('Fisher line (solid): x + 9y = 22, wrong on none.')
    expect(within(s).getAllByLabelText('Output')[0].textContent).toBe('[[36.  0.]\n [ 0.  4.]]\n[0.05555556 0.5       ]')
  })

  it('step 5: scores, projection and NumPy follow the new email', async () => {
    renderLesson()
    const s = step(5)
    expect(s).toHaveTextContent('the four normal emails score 1, 1, 3, 3 and the four spam emails score 7, 7, 9, 9. All 8 are on the correct side.')
    expect(s).toHaveTextContent('S1 (4, 3) lands at (3.5, 3.5)')
    expect(readout(s)).toContain('(1, 3) scores w · x = 1 + 3 = 4, not above 5, so normal. Its shadow on the w direction lands at (2, 2)')
    expect(output(s)).toBe('[1 1 3 3 7 7 9 9]\n[False False False False  True  True  True  True]\n4 False')
    await userEvent.click(within(s).getByRole('button', { name: 'Put it where S1 is' }))
    expect(readout(s)).toContain('(4, 3) scores w · x = 4 + 3 = 7, above 5, so spam. Its shadow on the w direction lands at (3.5, 3.5)')
    expect(output(s)).toBe('[1 1 3 3 7 7 9 9]\n[False False False False  True  True  True  True]\n7 True')
  })

  it('step 6: starts unsolved with the learned line in the readout', () => {
    renderLesson()
    expect(within(step(6)).getByText('0 of 4 solved')).toBeInTheDocument()
    expect(readout(step(6))).toContain('Learned line: x + y = 5 (w = (1, 1), b = 5). All 8 training emails are on the correct side.')
    expect(readout(step(6))).toContain('New email (5, 1): score 6, spam.')
  })

  it('has five takeaways', () => {
    expect(takeaways).toHaveLength(5)
  })
})
