import { describe, expect, it } from 'vitest'
import { fmt, fmtDet } from '../../../src/lib/format'
import { IDENTITY2, apply2, approxEqualVec, det2, inverse2 } from '../../../src/linalg'
import type { Mat2 } from '../../../src/linalg'
import { lowRankParams, nullSpace2, rank2, solve2 } from '../../../src/linalg/systems'
import { CHECKS } from '../../../src/lessons/inverse-rank-null-space/challenges'
import {
  PREDICT_A,
  PREDICT_POINTS,
  SEE_A,
  SQUEEZE_DETS,
  SYSTEM_A,
  SYSTEM_B,
  SYSTEM_PRESETS,
  squeezeMatrix,
} from '../../../src/lessons/inverse-rank-null-space/data'
import { fmtFixed, linearEqText, texMat2 } from '../../../src/lessons/inverse-rank-null-space/text'

describe('step 1', () => {
  it('A = [[2, 1], [1, 1]] has inverse [[1, -1], [-1, 2]]', () => {
    expect(inverse2(SEE_A)).toEqual([[1, -1], [-1, 2]])
  })
})

describe('step 2: the squeeze', () => {
  it('each stop has the determinant it claims', () => {
    for (const d of SQUEEZE_DETS) expect(det2(squeezeMatrix(d))).toBeCloseTo(d, 12)
  })
  it('the inverse grows like 1/det', () => {
    expect(approxEqualVec(inverse2(squeezeMatrix(2))!.flat(), [0.5, -0.5, 0, 1])).toBe(true)
    const inv = inverse2(squeezeMatrix(0.001))!
    expect(inv.flat().map((x) => fmt(x))).toEqual(['0.5', '-1000', '0', '2000'])
  })
  it('0.0000001 is shown as ≈ 0 and treated as singular, 0 as exactly 0', () => {
    const tiny = squeezeMatrix(0.0000001)
    expect(fmtDet(det2(tiny))).toBe('≈ 0')
    expect(inverse2(tiny)).toBeNull()
    expect(rank2(tiny)).toBe(1)
    expect(fmtFixed(tiny[1][1])).toBe('0.00000005')
    expect(fmtFixed(det2(tiny))).toBe('0.0000001')
    expect(texMat2(tiny, 8)).toContain('0.00000005')
    expect(fmtDet(det2(squeezeMatrix(0)))).toBe('0')
    expect(inverse2(squeezeMatrix(0.001))).not.toBeNull()
  })
})

describe('step 3: three points, one output', () => {
  it('p1, p2, p3 all land on (2, 1)', () => {
    for (const p of PREDICT_POINTS) expect(apply2(PREDICT_A, p)).toEqual([2, 1])
  })
  it('the gap (−2, 1) between them is the null space', () => {
    expect(apply2(PREDICT_A, [-2, 1])).toEqual([0, 0])
    expect(nullSpace2(PREDICT_A)).toEqual({ dim: 1, direction: [-2, 1] })
    expect(inverse2(PREDICT_A)).toBeNull()
  })
})

describe('step 4: systems', () => {
  it('the starting system is x + y = 3, x − y = 1 with solution (2, 1)', () => {
    expect(linearEqText(SYSTEM_A[0], SYSTEM_B[0])).toBe('x + y = 3')
    expect(linearEqText(SYSTEM_A[1], SYSTEM_B[1])).toBe('x − y = 1')
    expect(solve2(SYSTEM_A, SYSTEM_B)).toEqual({ kind: 'unique', x: [2, 1] })
    expect(det2(SYSTEM_A)).toBe(-2)
  })
  it('the presets show the three cases', () => {
    expect(SYSTEM_PRESETS.map((p) => solve2(p.A, p.b).kind)).toEqual(['unique', 'none', 'line'])
  })
  it('writes equations like a person', () => {
    expect(linearEqText([0, 0], 3)).toBe('0 = 3')
    expect(linearEqText([-2, 0.5], -1)).toBe('−2x + 0.5y = −1')
    expect(linearEqText([0, -1], 0)).toBe('−y = 0')
  })
})

describe('step 5: low rank', () => {
  it('4096 × 4096 vs rank 8: 65,536 is 0.39% of 16,777,216', () => {
    const { full, factored } = lowRankParams(4096, 8)
    expect(fmt((100 * factored) / full)).toBe('0.39')
  })
})

describe('step 6: challenge checks', () => {
  const solvedBy = (m: Mat2) => Object.keys(CHECKS).filter((id) => CHECKS[id](m))
  it('the identity solves nothing', () => {
    expect(solvedBy(IDENTITY2)).toEqual([])
  })
  it('each has a solution', () => {
    expect(solvedBy([[1, -1], [1, -1]])).toContain('diagonal')
    expect(solvedBy([[0, 1], [1, 0]])).toContain('selfUndo')
    expect(solvedBy([[-1, 0], [0, -1]])).toContain('selfUndo')
    expect(solvedBy([[0, 0], [1, 2]])).toContain('yAxis')
    expect(solvedBy([[1, 2], [0, 1]])).toContain('undoneBy')
  })
  it('near misses do not count', () => {
    expect(solvedBy([[0, 0], [0, 0]])).toEqual([])
    expect(solvedBy([[1, 0], [1, 0]])).toEqual([])
    expect(approxEqualVec(inverse2([[1, 2], [0, 1]])!.flat(), [1, -2, 0, 1])).toBe(true)
  })
})
