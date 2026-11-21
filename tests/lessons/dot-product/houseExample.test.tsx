import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HOUSES } from '../../../src/data/houses'
import { HouseExample } from '../../../src/lessons/dot-product/HouseExample'
import { HOUSE_OUTPUT, PREDICTIONS, RESIDUALS, predict } from '../../../src/lessons/dot-product/houseMath'

describe('running example: a price model is a dot product', () => {
  it('predicts each price as w · x + 60', () => {
    expect(predict(HOUSES[1])).toBeCloseTo(375, 9)
    expect(PREDICTIONS.map((p) => Math.round(p * 1e6) / 1e6)).toEqual([262, 375, 243, 448, 332, 411, 564, 200])
    expect(RESIDUALS.map((r) => Math.round(r * 1e6) / 1e6)).toEqual([3, -5, 5, -8, 3, 7, -4, 5])
  })

  it('prints exactly what NumPy 2.4 prints', () => {
    expect(HOUSE_OUTPUT).toBe('[262. 375. 243. 448. 332. 411. 564. 200.]\n[ 3. -5.  5. -8.  3.  7. -4.  5.]')
  })

  it('shows the prediction table and the worked example for house B', () => {
    render(
      <MemoryRouter>
        <HouseExample />
      </MemoryRouter>,
    )
    const box = screen.getByRole('region', { name: 'A price model is a dot product' })
    expect(box).toHaveTextContent('Its real price is $370k, so the model is off by $5k')
    expect(box).toHaveTextContent('None of the errors is bigger than $8k')
    const rows = within(box).getAllByRole('row')
    expect(rows[2]).toHaveTextContent('B Corner house150035370375-5')
    expect(rows[8]).toHaveTextContent('H Country cottage1000215205200+5')
    expect(within(box).getByLabelText('Output')).toHaveTextContent('[262. 375. 243. 448. 332. 411. 564. 200.]')
  })
})
