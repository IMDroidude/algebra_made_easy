import { describe, expect, it } from 'vitest'
import { houseImage, IMAGE_CODE } from '../../../src/lessons/svd/image'
import { imageCode, imageOutput, svd2Code, svd2Output } from '../../../src/lessons/svd/snippets'
import { frobenius, lowRank, svd } from '../../../src/linalg/svd'
import type { Mat2 } from '../../../src/linalg'
import fixture from './numpy-fixture.json'

/**
 * numpy-fixture.json holds what real NumPy 2 printed for this lesson's code:
 * the 2×2 snippet over a few thousand matrices, and the image snippet for
 * every k from 1 to 32 (built from IMAGE_CODE itself).
 */
type Row = [number, number, number, number, string]
const toMat = (r: readonly (number | string)[]): Mat2 => [
  [r[0] as number, r[1] as number],
  [r[2] as number, r[3] as number],
]

describe('2×2 SVD snippet matches real NumPy', () => {
  const rows = fixture.two as Row[]
  it(`agrees on all ${rows.length} matrices`, () => {
    const wrong = rows.filter((r) => svd2Output(toMat(r)) !== r[4])
    expect(wrong.slice(0, 5).map((r) => [r, svd2Output(toMat(r))])).toEqual([])
  })

  it('shows the matrix as typed', () => {
    expect(svd2Code([[1, 1], [0, 1]])).toContain('A = np.array([[1, 1],')
  })
})

describe('image compression snippet matches real NumPy', () => {
  const img = houseImage()
  const d = svd(img)
  const norm = frobenius(img)

  it('the picture is the same, pixel for pixel', () => {
    expect(img).toEqual(fixture.img)
  })

  it('singular values agree with LAPACK', () => {
    d.s.forEach((x, k) => expect(x).toBeCloseTo(fixture.s[k], 9))
  })

  it('every k from 1 to 32 prints the same lines', () => {
    for (let k = 1; k <= 32; k++) {
      const approx = lowRank(d, k)
      const err = frobenius(img.map((row, i) => row.map((x, j) => x - approx[i][j]))) / norm
      expect(imageOutput(k, d.s, err)).toBe(fixture.image[k - 1])
    }
  })

  it('the code builds the image with the shown lines', () => {
    expect(imageCode(5)).toContain(IMAGE_CODE)
    expect(imageCode(5)).toContain('k = 5')
  })
})
