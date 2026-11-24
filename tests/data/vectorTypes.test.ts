import { describe, expect, it } from 'vitest'
import {
  DERIVED,
  MEANING_TYPES,
  PROPERTY_TYPES,
  bracket,
  countWords,
  softmax,
  tfIdf,
} from '../../src/data/vectorTypes'

const close = (actual: number[], expected: number[], digits = 3) => {
  expect(actual).toHaveLength(expected.length)
  actual.forEach((x, i) => expect(x).toBeCloseTo(expected[i], digits))
}
const meaning = (id: string) => MEANING_TYPES.find((t) => t.id === id)!
const property = (id: string) => PROPERTY_TYPES.find((t) => t.id === id)!

describe('vector types: derived numbers', () => {
  it('softmax of [2, 1, 0] is 0.665, 0.245, 0.090 and adds to 1', () => {
    close(DERIVED.probabilities, [0.665, 0.245, 0.09])
    expect(DERIVED.probabilities.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    close(softmax([0, 0]), [0.5, 0.5])
  })

  it('TF-IDF: 2 × ln(3/1) = 2.197 and 2 × ln(3/3) = 0', () => {
    expect(DERIVED.tfIdfRare).toBeCloseTo(2.197, 3)
    expect(DERIVED.tfIdfCommon).toBeCloseTo(0, 10)
    expect(tfIdf(2, 1, 3)).toBeCloseTo(2 * Math.log(3), 10)
  })

  it('pixels [0, 255, 128, 64] / 255 are 0, 1, 0.502, 0.251', () => {
    close(DERIVED.pixelsScaled, [0, 1, 0.502, 0.251])
  })

  it('weights [0.2, 15, −3] · house [1500, 3, 12] = 309', () => {
    expect(DERIVED.housePrice).toBeCloseTo(309, 8)
  })

  it('gradient step [0.5, −1] − 0.1 × [0.2, −0.4] = [0.48, −0.96]', () => {
    close(DERIVED.newWeights, [0.48, -0.96], 10)
  })

  it('[3, 4] has length 5 and unit vector [0.6, 0.8]', () => {
    expect(DERIVED.length34).toBeCloseTo(5, 10)
    close(DERIVED.unit34, [0.6, 0.8], 10)
  })

  it('the robot moves 0.4 m north in one second and nothing else changes', () => {
    const { robotNow, robotNext } = DERIVED
    close([robotNow.x, robotNow.y, robotNow.headingDeg, robotNow.speed], [2.0, 3.5, 90, 0.4], 10)
    close([robotNext.x, robotNext.y, robotNext.headingDeg, robotNext.speed], [2.0, 3.9, 90, 0.4], 10)
  })

  it('displacement [5, 7] − [2, 3] = [3, 4]', () => {
    close(DERIVED.displacement, [3, 4], 10)
  })

  it('counts the words of “the cat sat on the mat”', () => {
    expect(DERIVED.wordCounts).toEqual([2, 1, 1, 1, 1, 0])
    expect(countWords(['a', 'b'], 'B b c')).toEqual([0, 2])
  })

  it('both orthogonal pairs have dot product 0', () => {
    DERIVED.orthogonalDots.forEach((d) => expect(d).toBeCloseTo(0, 10))
  })
})

describe('vector types: text shown on the page', () => {
  it('has all 14 meaning types and all 8 property types, with unique ids', () => {
    expect(MEANING_TYPES).toHaveLength(14)
    expect(PROPERTY_TYPES).toHaveLength(8)
    const ids = [...MEANING_TYPES, ...PROPERTY_TYPES].map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every field of every type is filled in', () => {
    for (const t of MEANING_TYPES) {
      for (const text of [t.name, t.each, t.object, t.numbers, t.vector, t.usedFor]) {
        expect(text.trim().length).toBeGreaterThan(0)
      }
    }
    for (const t of PROPERTY_TYPES) {
      for (const text of [t.name, t.meaning, t.example, t.why]) {
        expect(text.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('writes vectors in square brackets with a real minus sign', () => {
    expect(bracket([0.48, -0.96])).toBe('[0.48, −0.96]')
    expect(bracket([1 / 3], 3)).toBe('[0.333]')
  })

  it('formats the derived numbers the way the source doc states them', () => {
    expect(meaning('count').vector).toBe('[2, 1, 1, 1, 1, 0]')
    expect(meaning('tf-idf').numbers).toContain('2 × ln(3/1) = 2.197')
    expect(meaning('tf-idf').numbers).toContain('2 × ln(3/3) = 0.')
    expect(meaning('pixel').vector).toBe('[0, 1, 0.502, 0.251]')
    expect(meaning('probability').vector).toBe('[0.665, 0.245, 0.09]')
    expect(meaning('state').vector).toBe('[2, 3.5, 90°, 0.4]')
    expect(meaning('state').note).toContain('[2, 3.9, 90°, 0.4]')
    expect(meaning('weight').vector).toBe('[0.2, 15, −3]')
    expect(meaning('weight').note).toContain('0.2×1500 + 15×3 − 3×12 = 309 ($k)')
    expect(meaning('gradient').note).toContain('= [0.48, −0.96]')
    expect(property('unit').example).toBe('[3, 4] has length 5, so [0.6, 0.8] is its unit vector.')
    expect(property('orthogonal').example).toContain('[3, 1] and [−1, 3]: dot product 0.')
    expect(property('position-displacement').example).toContain('[5, 7] − [2, 3] = [3, 4]')
  })
})
