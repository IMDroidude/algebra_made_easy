import { describe, expect, it } from 'vitest'
import type { Vec2 } from '../../../src/linalg'
import {
  A3,
  B3,
  CAFE,
  DEPOT,
  FLAG,
  HOME,
  MANIP_V,
  MOVE_M,
  PRACTICE_A,
  PRACTICE_B,
  ROBOT_MOVES,
  SEE_WALK,
  SEE_WALK_FROM,
  SHOP,
  START_A,
  START_B,
  TRIP_GOAL,
  UPDATE,
  V3,
  WEIGHTS,
  clampStart,
  directions,
  howFar,
  isWholeLength,
  labelSide,
  moveBy,
  route,
  solvedChallenges,
  understandCode,
  understandOutput,
  updatedWeights,
  vectorFrom,
} from '../../../src/lessons/points-and-vectors/model'
import { takeaways } from '../../../src/lessons/points-and-vectors/takeaways'
import fixtures from './numpy-fixtures.json'

describe('step 1 and 2 numbers', () => {
  it('the café and the walk use the same numbers', () => {
    expect(CAFE).toEqual([3, 2])
    expect(SEE_WALK).toEqual([3, 2])
    expect(directions(SEE_WALK)).toBe('3 east, 2 north')
    expect(moveBy(SEE_WALK_FROM, SEE_WALK)).toEqual([-1, -1])
    expect(MANIP_V).toEqual([3, 2])
  })

  it('directions read like a map', () => {
    expect(directions([-2, 3])).toBe('2 west, 3 north')
    expect(directions([4, -1])).toBe('4 east, 1 south')
    expect(directions([0, -2.5])).toBe('2.5 south')
    expect(directions([3, 0])).toBe('3 east')
    expect(directions([0, 0])).toBe('stay where you are')
  })
})

describe('step 3: home and shop', () => {
  it('A + B is (4, 4), halfway is (2, 2), and the trip is B − A = (−2, 2)', () => {
    expect(moveBy(HOME, SHOP)).toEqual([4, 4])
    expect(moveBy(HOME, vectorFrom(HOME, SHOP).map((x) => x / 2) as Vec2)).toEqual([2, 2])
    expect(vectorFrom(HOME, SHOP)).toEqual([-2, 2])
    expect(directions(vectorFrom(HOME, SHOP))).toBe('2 west, 2 north')
  })
})

describe('step 4: B − A, A + v, length, 3D', () => {
  it('the starting example is the 3-4-5 triangle', () => {
    const v = vectorFrom(START_A, START_B)
    expect(v).toEqual([3, 4])
    expect(moveBy(START_A, v)).toEqual(START_B)
    expect(howFar(v)).toBe(5)
    expect(isWholeLength(v)).toBe(true)
    expect(isWholeLength([1, 1])).toBe(false)
  })

  it('the 3D example', () => {
    expect(A3).toEqual([1, 2, 0])
    expect(B3).toEqual([4, 6, 2])
    expect(V3).toEqual([3, 4, 2])
  })

  it('never produces −0', () => {
    expect(Object.is(vectorFrom([0.5, 0], [0.5, 0])[0], -0)).toBe(false)
    expect(Object.is(moveBy([-0, 0], [0, 0])[0], -0)).toBe(false)
  })

  it('writes the NumPy code for the current A and B', () => {
    const code = understandCode(START_A, START_B)
    expect(code).toContain('A = np.array([-2, -1])')
    expect(code).toContain('B = np.array([1, 3])')
    expect(code).toContain('v = B - A')
  })

  it('prints exactly what NumPy 2.4 prints (304 cases checked against real NumPy)', () => {
    expect(understandOutput(START_A, START_B)).toBe('[3 4]\n[1 3]\n5.0')
    for (const c of fixtures) {
      expect(understandOutput(c.a as Vec2, c.b as Vec2), JSON.stringify(c)).toBe(c.out)
    }
  })
})

describe('step 5: the robot and the model update', () => {
  it('follows the three moves from the depot', () => {
    expect(route(DEPOT, ROBOT_MOVES)).toEqual([
      [-4, -4],
      [-1, -3],
      [0, 0],
      [-2, 2],
    ])
    expect(ROBOT_MOVES.map(directions)).toEqual(['3 east, 1 north', '1 east, 3 north', '2 west, 2 north'])
  })

  it('weights + update = new weights', () => {
    expect(WEIGHTS).toEqual([0.5, -1.2, 0.3])
    expect(UPDATE).toEqual([0.02, -0.01, 0.03])
    const after = updatedWeights()
    expect(after[0]).toBeCloseTo(0.52, 10)
    expect(after[1]).toBeCloseTo(-1.21, 10)
    expect(after[2]).toBeCloseTo(0.33, 10)
  })
})

describe('step 6: challenges', () => {
  it('none is solved at the start', () => {
    expect(solvedChallenges({ a: PRACTICE_A, b: PRACTICE_B })).toEqual([])
  })

  it('each one ticks from the right state', () => {
    expect(solvedChallenges({ a: [1, -1], b: [-1, 2] })).toEqual(['trip'])
    expect(vectorFrom([1, -1], [-1, 2])).toEqual(TRIP_GOAL)
    expect(solvedChallenges({ a: [-3, -1], b: [4, 4] })).toEqual(['flag'])
    expect(moveBy([-3, -1], MOVE_M)).toEqual(FLAG)
    expect(solvedChallenges({ a: [2, 2], b: [2, 2] })).toEqual(['zero'])
    expect(solvedChallenges({ a: [-3, -1], b: [-5, 2] })).toEqual(['trip', 'flag'])
  })

  it('uses examples not shown earlier in the lesson', () => {
    const shown = [SEE_WALK, vectorFrom(HOME, SHOP), vectorFrom(START_A, START_B), ...ROBOT_MOVES]
    for (const goal of [TRIP_GOAL, MOVE_M]) {
      expect(shown.some((s) => s[0] === goal[0] && s[1] === goal[1])).toBe(false)
    }
  })
})

describe('helpers', () => {
  const bounds = { x: [-5.3, 5.3] as [number, number], y: [-5.3, 5.3] as [number, number] }

  it('clampStart keeps the arrow tip on the plane', () => {
    expect(clampStart([4.2, 4.9], [[3, 2]], bounds)).toEqual([2, 3])
    expect(clampStart([-5, -5], [[3, 2]], bounds)).toEqual([-5, -5])
    expect(clampStart([-5, 0], [[-3, 0]], bounds)).toEqual([-2, 0])
    expect(clampStart([1.24, 0.26], [], null)).toEqual([1, 0.5])
  })

  it('labelSide puts labels above the arrow', () => {
    expect(labelSide([3, 4])).toBe('nw')
    expect(labelSide([3, 0])).toBe('n')
    expect(labelSide([-3, 0])).toBe('n')
    expect(labelSide([0, 4])).toBe('w')
    expect(labelSide([4, -4])).toBe('ne')
  })

  it('takeaways: 3 to 5 short sentences', () => {
    expect(takeaways.length).toBeGreaterThanOrEqual(3)
    expect(takeaways.length).toBeLessThanOrEqual(5)
    for (const t of takeaways) expect(t.length).toBeLessThan(160)
  })
})
