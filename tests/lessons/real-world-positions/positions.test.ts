import { describe, expect, it } from 'vitest'
import {
  CHAIR,
  CHAIR_TARGET,
  DRONE_START,
  DRONE_TARGET,
  LAMP,
  MYSTERY_START,
  ORIGINS,
  PLUM,
  PRACTICE_CHECKS,
  PRACTICE_ORIGIN,
  RECAP,
  chessSquare,
  nearestFruit,
  presetAt,
  roomSnap,
  seatPair,
  slide,
  snapFruit,
  snapToSquare,
  toLocal,
  understandCode,
  understandOutput,
  walkWords,
} from '../../../src/lessons/real-world-positions/positions'
import type { Unit } from '../../../src/lessons/real-world-positions/positions'
import { takeaways } from '../../../src/lessons/real-world-positions/takeaways'
import { CURRICULUM } from '../../../src/app/curriculum'

describe('toLocal: origin, directions, unit', () => {
  it('measures from the corner in metres', () => {
    expect(toLocal(LAMP.at, { origin: [0, 0], unit: 'm', yDir: 'up' })).toEqual([5, 3])
  })
  it('subtracts a new origin and the lamp does not move', () => {
    expect(toLocal(LAMP.at, { origin: [0, 2.5], unit: 'm', yDir: 'up' })).toEqual([5, 0.5])
    expect(toLocal(LAMP.at, { origin: [4, 5], unit: 'm', yDir: 'up' })).toEqual([1, -2])
    expect(toLocal(LAMP.at, { origin: LAMP.at, unit: 'm', yDir: 'up' })).toEqual([0, 0])
  })
  it('doubles the numbers in half-metre tiles', () => {
    expect(toLocal(LAMP.at, { origin: [0, 0], unit: 'tiles', yDir: 'up' })).toEqual([10, 6])
  })
  it('flips only the second number when y points down', () => {
    expect(toLocal(LAMP.at, { origin: [0, 0], unit: 'm', yDir: 'down' })).toEqual([5, -3])
  })
  it('never returns negative zero', () => {
    const [, b] = toLocal([1, 2], { origin: [0, 2], unit: 'm', yDir: 'down' })
    expect(Object.is(b, -0)).toBe(false)
  })
  it('describes the walk in words', () => {
    expect(walkWords([5, 3], { origin: [0, 0], unit: 'm', yDir: 'up' })).toBe('5 m right, 3 m up the map')
    expect(walkWords([-2, 0], { origin: [0, 0], unit: 'tiles', yDir: 'up' })).toBe(
      '2 tiles left, no steps up or down',
    )
    expect(walkWords([0, 3], { origin: [0, 0], unit: 'm', yDir: 'down' })).toBe('no steps across, 3 m down the map')
  })
  it('animates the origin in a straight line', () => {
    expect(slide([0, 0], [0, 2.5], 0.5)).toEqual([0, 1.25])
  })
  it('finds presets and snaps the origin to half metres inside the room', () => {
    expect(presetAt([0, 2.5])?.id).toBe('door')
    expect(presetAt([1, 1])).toBeUndefined()
    expect(roomSnap(8, 5)([3.3, 9])).toEqual([3.5, 5])
    expect(roomSnap(8, 5)([-1, 0.2])).toEqual([0, 0])
  })
})

// Printed by NumPy 2.4.6 for positions = [[5, 3], [7, 1], [2, 1]].
const NUMPY: Record<string, Record<Unit, string>> = {
  corner: {
    m: '[[5 3]\n [7 1]\n [2 1]]',
    tiles: '[[10.  6.]\n [14.  2.]\n [ 4.  2.]]',
  },
  door: {
    m: '[[ 5.   0.5]\n [ 7.  -1.5]\n [ 2.  -1.5]]',
    tiles: '[[10.  1.]\n [14. -3.]\n [ 4. -3.]]',
  },
  window: {
    m: '[[ 1 -2]\n [ 3 -4]\n [-2 -4]]',
    tiles: '[[ 2. -4.]\n [ 6. -8.]\n [-4. -8.]]',
  },
  centre: {
    m: '[[ 1.   0.5]\n [ 3.  -1.5]\n [-2.  -1.5]]',
    tiles: '[[ 2.  1.]\n [ 6. -3.]\n [-4. -3.]]',
  },
}

describe('NumPy snippet', () => {
  for (const o of ORIGINS)
    for (const unit of ['m', 'tiles'] as Unit[])
      it(`prints what NumPy prints: origin ${o.id}, ${unit}`, () => {
        expect(understandOutput(o.at, unit)).toBe(NUMPY[o.id][unit])
      })
  it('writes the subtraction in one line', () => {
    const door = ORIGINS[1]
    expect(understandCode(door, 'm')).toContain('new_origin = np.array([0, 2.5])   # the door')
    expect(understandCode(door, 'm')).toContain('print(positions - new_origin)')
    expect(understandCode(door, 'tiles')).toContain('print((positions - new_origin) / 0.5)')
    expect(understandCode(door, 'm')).toContain('positions = np.array([[5, 3],')
  })
})

describe('real-world examples', () => {
  it('turns chess squares into (column, row)', () => {
    expect(chessSquare([4.5, 3.5])).toEqual({ name: 'e4', col: 5, row: 4 })
    expect(chessSquare([6.5, 0.5]).name).toBe('g1')
    expect(snapToSquare([4.2, 9])).toEqual([4.5, 7.5])
    expect(snapToSquare([-1, 0.1])).toEqual([0.5, 0.5])
  })
  it('writes a cinema seat as (seat, row)', () => {
    expect(seatPair(3, 7)).toEqual([7, 3])
  })
  it('snaps fruit to 10 g and half points and finds the nearest fruit', () => {
    expect(snapFruit([153, 4.2])).toEqual([150, 4])
    expect(snapFruit([400, -1])).toEqual([300, 0])
    expect(nearestFruit([150, 4]).name).toBe('apple')
    expect(nearestFruit([100, 3]).name).toBe('lemon')
    expect(nearestFruit([120, 9]).name).toBe('banana')
  })
})

describe('practice checks', () => {
  const start = { origin: PRACTICE_ORIGIN, drone: DRONE_START, fruit: MYSTERY_START }
  it('start unsolved', () => {
    for (const check of Object.values(PRACTICE_CHECKS)) expect(check(start)).toBe(false)
  })
  it('chair at (2, 1) means origin at (4, 2.5)', () => {
    expect(toLocal(CHAIR, { origin: [4, 2.5], unit: 'm', yDir: 'up' })).toEqual(CHAIR_TARGET)
    expect(PRACTICE_CHECKS.chair({ ...start, origin: [4, 2.5] })).toBe(true)
  })
  it('drone hovers 2 m in front of window W', () => {
    expect(DRONE_TARGET).toEqual([10, 10, 2])
    expect(PRACTICE_CHECKS.drone({ ...start, drone: [10, 10, 2] })).toBe(true)
    expect(PRACTICE_CHECKS.drone({ ...start, drone: [10, 10, 0] })).toBe(false)
  })
  it('plum at (60, 5)', () => {
    expect(PRACTICE_CHECKS.plum({ ...start, fruit: [PLUM.grams, PLUM.sweet] })).toBe(true)
  })
})

describe('module recap and takeaways', () => {
  it('covers all seven Module 1 goals and links to real lessons', () => {
    const m1 = CURRICULUM[0]
    expect(RECAP.map((r) => r.q)).toHaveLength(m1.goals!.length)
    const slugs = m1.lessons.map((l) => l.slug)
    for (const r of RECAP) expect(slugs).toContain(r.slug)
  })
  it('has 3–5 takeaways', () => {
    expect(takeaways.length).toBeGreaterThanOrEqual(3)
    expect(takeaways.length).toBeLessThanOrEqual(5)
  })
})
