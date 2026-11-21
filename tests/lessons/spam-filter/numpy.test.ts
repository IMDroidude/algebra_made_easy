import { describe, expect, it } from 'vitest'
import { npBools } from '../../../src/lessons/spam-filter/snippets'
import { cases } from './cases'
import fixtures from './numpy-fixtures.json'

describe('every NumPy snippet prints what real NumPy prints', () => {
  const all = cases()
  it('has one fixture per case, for the same code', () => {
    expect(all.length).toBe(fixtures.cases.length)
    all.forEach((c, i) => expect(c.code).toBe(fixtures.cases[i].code))
  })
  it.each(fixtures.cases.map((f, i) => [i, f.numpy] as const))('case %i', (i, numpy) => {
    expect(all[i].output).toBe(numpy)
  })
  it('prints bool arrays 5 characters wide', () => {
    expect(npBools([true, true])).toBe('[ True  True]')
    expect(npBools([false, true])).toBe('[False  True]')
  })
})
