import { describe, expect, it } from 'vitest'
import {
  AXIS_INFO,
  EQUAL,
  ORIGIN,
  START,
  legLabel,
  pointNote,
  walkLegs,
  walkStep,
  walkSteps,
} from '../../../src/lessons/3d-space/walk'

describe('physical names', () => {
  it('match the convention: x width, y height (up), z depth (toward you)', () => {
    expect(AXIS_INFO.x).toMatchObject({ name: 'width', ends: 'left / right', plus: 'right', minus: 'left' })
    expect(AXIS_INFO.y).toMatchObject({ name: 'height', ends: 'down / up', plus: 'up', minus: 'down' })
    expect(AXIS_INFO.z).toMatchObject({ name: 'depth', ends: 'back / front', plus: 'forward', minus: 'back' })
  })
})

describe('how to reach a point', () => {
  it('positive numbers: right, up, forward', () => {
    expect(walkSteps([4, 2, 4])).toEqual([
      'Move 4 right along the width (x).',
      'Move 2 up (y).',
      'Move 4 forward, toward you (z).',
    ])
  })

  it('negative numbers: left, down, back, using the distance without its sign', () => {
    expect(walkSteps([-1.5, -2, -0.5])).toEqual([
      'Move 1.5 left along the width (x).',
      'Move 2 down (y).',
      'Move 0.5 back, away from you (z).',
    ])
  })

  it('zeros: stay put (also for -0 and tiny rounding errors)', () => {
    expect(walkStep('x', 0)).toBe('Stay put along x: the width is 0.')
    expect(walkStep('y', -0)).toBe('Stay put along y: the height is 0.')
    expect(walkStep('z', 1e-12)).toBe('Stay put along z: the depth is 0.')
    expect(walkSteps([0, 3, 0])).toEqual([
      'Stay put along x: the width is 0.',
      'Move 3 up (y).',
      'Stay put along z: the depth is 0.',
    ])
  })

  it('the starting point of step 2', () => {
    expect(walkSteps(START)).toEqual([
      'Move 2 right along the width (x).',
      'Move 3 up (y).',
      'Move 1 forward, toward you (z).',
    ])
  })
})

describe('the walk drawn in the room', () => {
  it('three legs in the order x, y, z, ending at the point', () => {
    const legs = walkLegs([2, 3, 1])
    expect(legs.map((l) => l.axis)).toEqual(['x', 'y', 'z'])
    expect(legs[0].from).toEqual([0, 0, 0])
    expect(legs[0].to).toEqual(legs[1].from)
    expect(legs[1].to).toEqual(legs[2].from)
    expect(legs[2].to).toEqual([2, 3, 1])
    expect(legs.map((l) => l.label)).toEqual(['2 right', '3 up', '1 forward'])
  })

  it('labels handle negatives and zeros', () => {
    expect(legLabel('x', -2)).toBe('2 left')
    expect(legLabel('y', -0.5)).toBe('0.5 down')
    expect(legLabel('z', -3)).toBe('3 back')
    expect(legLabel('z', 0)).toBe('z: stay put')
  })
})

describe('presets', () => {
  it('put the point at the origin, at equal coordinates, or back at the start', () => {
    expect(ORIGIN).toEqual([0, 0, 0])
    expect(EQUAL).toEqual([3, 3, 3])
    expect(START).toEqual([2, 3, 1])
  })

  it('explain the origin and equal coordinates, and nothing else', () => {
    expect(pointNote(ORIGIN)).toMatch(/^This is the origin/)
    expect(pointNote(EQUAL)).toMatch(/^All three numbers are 3: .*diagonal/)
    expect(pointNote([1.5, 1.5, 1.5])).toMatch(/^All three numbers are 1.5/)
    expect(pointNote(START)).toBeNull()
    expect(pointNote([3, 3, 0])).toBeNull()
  })
})
