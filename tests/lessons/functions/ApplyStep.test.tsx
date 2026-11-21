import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ApplyStep } from '../../../src/lessons/functions/ApplyStep'

const step5 = () => within(document.querySelector('section[aria-labelledby="step-5"]') as HTMLElement)
const box = () => within(document.querySelector('section[aria-labelledby="running-example"]') as HTMLElement)

describe('Functions: Apply step and running example', () => {
  it('predicts the eight shared houses with price = 0.22 × sqft + 30', () => {
    render(<ApplyStep />)
    expect(step5().getByLabelText('Output')).toHaveTextContent('[272. 360. 228. 470. 316. 426. 558. 250.]')
    expect(step5().getByText(/A 272, B 360, C 228, D 470, E 316, F 426, G 558, H 250 \(\$k\)\. It is off by 45 at most\./)).toBeInTheDocument()
  })

  it('shows f(sqft) and the miss for every house in the running example', () => {
    render(<ApplyStep />)
    const s = box()
    expect(s.getByRole('heading', { name: 'The model as a table: f(sqft) for every house' })).toBeInTheDocument()
    const rows = s.getAllByRole('row').slice(1).map((r) => r.textContent)
    expect(rows).toHaveLength(8)
    expect(rows[0]).toBe('A Garden flat1100265272+7')
    expect(rows[7]).toBe('H Country cottage1000205250+45')
    expect(s.getByText(/\$45k too/)).toBeInTheDocument()
    expect(s.getByLabelText('Output')).toHaveTextContent('[ 7. -10. -20. 30. -19. 8. -2. 45.]')
  })

  it('table and code follow a new weight and bias', async () => {
    render(<ApplyStep />)
    fireEvent.change(screen.getByLabelText('weight w'), { target: { value: '0.25' } })
    fireEvent.change(screen.getByLabelText('bias b'), { target: { value: '0' } })
    expect(step5().getByLabelText('Output')).toHaveTextContent('[275. 375. 225. 500. 325. 450. 600. 250.]')
    expect(box().getByLabelText('Output')).toHaveTextContent('[ 10. 5. -23. 60. -10. 32. 40. 45.]')
    expect(box().getAllByRole('row')[4].textContent).toBe('D Family home2000440500+60')
    await userEvent.click(screen.getByRole('button', { name: 'Trained values' }))
    expect(step5().getByLabelText('Output')).toHaveTextContent('[272. 360. 228. 470. 316. 426. 558. 250.]')
  })
})
