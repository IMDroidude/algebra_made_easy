import { describe, expect, it } from 'vitest'
import { asTyped2, isInteger, numpyPrint } from '../../../src/lib/format'
import {
  DEFAULT_PARAMS,
  FAMILIES,
  MIRRORS,
  describe as describeMatrix,
  familyMatrix,
  matrixTex,
  rotationMatrix,
  scalingMatrix,
  shearMatrix,
  squareImage,
  squareSnippet,
} from '../../../src/lessons/matrices-as-transformations/galleryMath'
import { P_LIMIT, understandExtentFor } from '../../../src/lessons/matrices-as-transformations/pointMap'
import { takeaways } from '../../../src/lessons/matrices-as-transformations/takeaways'
import { IDENTITY2, apply2, approxEqual, det2 } from '../../../src/linalg'
import { GALLERY_MATRICES, POINTS, step4Code } from './cases'
import fixtures from './numpy-fixtures.json'

describe('gallery matrices', () => {
  it('rotation: exact quarter turns, cos/sin elsewhere, determinant 1', () => {
    expect(rotationMatrix(90)).toEqual([[0, -1], [1, 0]])
    expect(rotationMatrix(180)).toEqual([[-1, 0], [0, -1]])
    expect(rotationMatrix(-90)).toEqual([[0, 1], [-1, 0]])
    const r = rotationMatrix(30)
    expect(r[0][0]).toBeCloseTo(Math.sqrt(3) / 2, 12)
    expect(r[1][0]).toBeCloseTo(0.5, 12)
    expect(r[0][1]).toBeCloseTo(-0.5, 12)
    for (let t = -180; t <= 180; t += 15) expect(approxEqual(det2(rotationMatrix(t)), 1)).toBe(true)
  })

  it('scaling, shear and the four mirrors', () => {
    expect(scalingMatrix(2, 0.5)).toEqual([[2, 0], [0, 0.5]])
    expect(det2(scalingMatrix(2, 0.5))).toBe(1)
    expect(shearMatrix(1.5)).toEqual([[1, 1.5], [0, 1]])
    expect(det2(shearMatrix(1.5))).toBe(1)
    for (const m of MIRRORS) expect(det2(m.matrix)).toBe(-1)
    // each mirror leaves points on its own line where they are
    for (const m of MIRRORS) expect(apply2(m.matrix, m.line[1])).toEqual(m.line[1])
    expect(familyMatrix('reflection', DEFAULT_PARAMS)).toEqual([[1, 0], [0, -1]])
    expect(FAMILIES.map((f) => f.id)).toEqual(['rotation', 'scaling', 'reflection', 'shear'])
  })

  it('maps the unit square and describes it in words', () => {
    expect(squareImage(shearMatrix(1))).toEqual([[0, 0], [1, 0], [2, 1], [1, 1]])
    expect(describeMatrix(shearMatrix(1))).toBe(
      'î → (1, 0), ĵ → (1, 1). Area × 1 (determinant 1).',
    )
    expect(describeMatrix(rotationMatrix(30))).toBe(
      'î → (0.87, 0.5), ĵ → (-0.5, 0.87). Area × 1 (determinant 1).',
    )
    expect(describeMatrix(MIRRORS[0].matrix)).toBe(
      'î → (1, 0), ĵ → (0, -1). Area × 1, flipped over (determinant -1).',
    )
    expect(describeMatrix(scalingMatrix(2, 0.5))).toBe(
      'î → (2, 0), ĵ → (0, 0.5). Area × 1 (determinant 1).',
    )
    expect(describeMatrix([[1, 2], [0.5, 1]])).toBe(
      'î → (1, 0.5), ĵ → (2, 1). The square is squashed flat (determinant 0).',
    )
    expect(matrixTex(rotationMatrix(30))).toBe(
      String.raw`\begin{bmatrix} 0.87 & -0.5 \\ 0.5 & 0.87 \end{bmatrix}`,
    )
  })
})

describe('NumPy output matches real NumPy 2.4', () => {
  const codes = [
    ...GALLERY_MATRICES.map((m) => squareSnippet(m)),
    ...GALLERY_MATRICES.flatMap((m) =>
      POINTS.map((v) => ({
        code: step4Code(m, v),
        // exactly what Lesson.tsx step 4 prints
        output: numpyPrint(apply2(asTyped2(m), v), isInteger(...m.flat(), ...v)),
      })),
    ),
  ]

  it('covers every case', () => expect(fixtures.cases).toHaveLength(codes.length))

  it.each(codes.map((c, k) => [k, c] as const))('case %i', (k, c) => {
    expect(c.code).toBe(fixtures.cases[k].code)
    expect(c.output).toBe(fixtures.cases[k].numpy)
  })
})

describe('step 4 point map', () => {
  it('keeps the plane size fixed while P moves inside the drag box', () => {
    expect(understandExtentFor(IDENTITY2, [2, 1])).toBe(5)
    const m = shearMatrix(1)
    const e = understandExtentFor(m, [0, 0])
    for (let x = -P_LIMIT; x <= P_LIMIT; x += 0.5)
      for (let y = -P_LIMIT; y <= P_LIMIT; y += 0.5) {
        expect(understandExtentFor(m, [x, y])).toBe(e)
        const [px, py] = apply2(m, [x, y])
        expect(Math.max(Math.abs(px), Math.abs(py))).toBeLessThan(e)
      }
    expect(understandExtentFor(IDENTITY2, [5, 0])).toBe(6)
    expect(understandExtentFor([[10, 0], [0, 10]], [1, 1])).toBe(14)
  })
})

it('has 3 to 5 short takeaways', () => {
  expect(takeaways.length).toBeGreaterThanOrEqual(3)
  expect(takeaways.length).toBeLessThanOrEqual(5)
  for (const t of takeaways) expect(t.length).toBeLessThan(160)
})
