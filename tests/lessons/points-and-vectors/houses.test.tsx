import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HouseExample } from '../../../src/lessons/points-and-vectors/HouseExample'
import {
  DIFF_AB,
  HOUSE_CODE,
  HOUSE_OUTPUT,
  RENOVATED_A,
  RENOVATION,
  diffWords,
  signedPart,
  tripleText,
} from '../../../src/lessons/points-and-vectors/houses'

const section = () => document.querySelector<HTMLElement>('section[aria-labelledby="running-example"]')!

describe('running example: vectors between houses', () => {
  it('B − A and A + renovation', () => {
    expect(DIFF_AB).toEqual([400, 1, -3])
    expect(RENOVATION).toEqual([200, 1, 0])
    expect(RENOVATED_A).toEqual([1300, 3, 8])
    expect(tripleText(DIFF_AB)).toBe('(400, 1, −3)')
    expect(diffWords(DIFF_AB)).toBe('400 sqft bigger, 1 more bedroom, 3 km closer to the centre')
    expect(diffWords([-100, -2, 4])).toBe('100 sqft smaller, 2 fewer bedrooms, 4 km further from the centre')
    expect([400, -3, 0].map(signedPart)).toEqual(['+400', '−3', '0'])
  })

  it('prints exactly what NumPy prints (checked against NumPy 2)', () => {
    expect(HOUSE_CODE).toContain('a = np.array([1100, 2, 8])')
    expect(HOUSE_CODE).toContain('renovation = np.array([200, 1, 0])')
    expect(HOUSE_OUTPUT).toBe('[400   1  -3]\n[1300    3    8]')
  })

  it('renders both tables and the two readings of a vector', () => {
    render(<HouseExample />)
    const s = within(section())
    expect(s.getByRole('heading', { name: 'How two houses differ is a vector' })).toBeInTheDocument()
    const diff = s.getByRole('table', { name: 'House B minus house A, feature by feature' })
    expect(within(diff).getByText('+400')).toBeInTheDocument()
    expect(within(diff).getByText('−3')).toBeInTheDocument()
    const reno = s.getByRole('table', { name: 'House A plus a renovation' })
    expect(within(reno).getByText('1300')).toBeInTheDocument()
    expect(section().textContent).toContain('B − A = (400, 1, −3): B is 400 sqft bigger, 1 more bedroom, 3 km closer to the centre.')
    expect(s.getByText('movement')).toBeInTheDocument()
    expect(s.getByText('information')).toBeInTheDocument()
  })
})
