import { describe, expect, it } from 'vitest'
import { approxEqualVec, norm } from '../../src/linalg'
import {
  CORNER_VIEW,
  FRONT_VIEW,
  SIDE_VIEW,
  TOP_VIEW,
  clampPitch,
  cross3,
  dot3,
  depth,
  floorToScreen,
  lerpView,
  nearerThanPlane,
  overlapOnScreen,
  planeSide,
  project,
  rotateView,
  rotateX,
  rotateY,
  sameView,
  screenToFloor,
  shadow,
  slicePlane,
  toCamera,
  towardViewer,
  wrapDegrees,
} from '../../src/linalg/project3d'
import type { Vec3 } from '../../src/linalg/project3d'

const P: Vec3 = [3, 2, 4]

describe('rotations', () => {
  it('turn about the y-axis: +x toward −z, y untouched', () => {
    expect(approxEqualVec(rotateY([1, 0, 0], 90), [0, 0, -1])).toBe(true)
    expect(approxEqualVec(rotateY([0, 0, 1], 90), [1, 0, 0])).toBe(true)
    expect(approxEqualVec(rotateY([0, 5, 0], 37), [0, 5, 0])).toBe(true)
  })

  it('tilt about the x-axis: +y toward +z, x untouched', () => {
    expect(approxEqualVec(rotateX([0, 1, 0], 90), [0, 0, 1])).toBe(true)
    expect(approxEqualVec(rotateX([0, 0, 1], 90), [0, -1, 0])).toBe(true)
    expect(approxEqualVec(rotateX([2, 0, 0], 50), [2, 0, 0])).toBe(true)
  })

  it('never change a length', () => {
    for (const view of [CORNER_VIEW, SIDE_VIEW, { yaw: 123, pitch: -47 }]) {
      expect(norm(toCamera(P, view))).toBeCloseTo(norm(P), 10)
    }
  })
})

describe('named views drop exactly one coordinate', () => {
  it('front view shows (x, y); z points at the viewer', () => {
    expect(approxEqualVec(project(P, FRONT_VIEW), [3, 2])).toBe(true)
    expect(depth(P, FRONT_VIEW)).toBeCloseTo(4)
  })

  it('side view shows y, with z running to the left; x points at the viewer', () => {
    expect(approxEqualVec(project(P, SIDE_VIEW), [-4, 2])).toBe(true)
    expect(depth(P, SIDE_VIEW)).toBeCloseTo(3)
  })

  it('top view shows x, with z running down the screen; y points at the viewer', () => {
    expect(approxEqualVec(project(P, TOP_VIEW), [3, -4])).toBe(true)
    expect(depth(P, TOP_VIEW)).toBeCloseTo(2)
  })

  it('the corner view shows all three axes as distinct directions, z toward the viewer', () => {
    const [x, y, z] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((a) => project(a as Vec3, CORNER_VIEW))
    expect(x[0]).toBeGreaterThan(0.5) // x runs to the right
    expect(y[1]).toBeGreaterThan(0.8) // y runs up
    expect(z[0]).toBeLessThan(0) // z runs left…
    expect(z[1]).toBeLessThan(0) // …and down
    expect(depth([0, 0, 1], CORNER_VIEW)).toBeGreaterThan(0)
  })
})

describe('shadows (lesson 1.3, steps 2–4 and 6)', () => {
  it('set one coordinate to 0', () => {
    expect(shadow(P, 'xy')).toEqual([3, 2, 0])
    expect(shadow(P, 'yz')).toEqual([0, 2, 4])
    expect(shadow(P, 'xz')).toEqual([3, 0, 4])
  })

  it('equal the point times the 0/1 mask used in the NumPy snippet', () => {
    const masks = { xy: [1, 1, 0], yz: [0, 1, 1], xz: [1, 0, 1] } as const
    const p: Vec3 = [2.5, 3, 1]
    for (const w of ['xy', 'yz', 'xz'] as const) {
      expect(shadow(p, w)).toEqual(p.map((v, k) => v * masks[w][k]))
    }
  })

  it('the prediction: in the front view Q sits on its back-wall shadow and nowhere else', () => {
    expect(overlapOnScreen(P, shadow(P, 'xy'), FRONT_VIEW)).toBe(true)
    expect(overlapOnScreen(P, shadow(P, 'xz'), FRONT_VIEW)).toBe(false)
    expect(overlapOnScreen(P, shadow(P, 'xy'), CORNER_VIEW)).toBe(false)
    expect(overlapOnScreen(P, shadow(P, 'yz'), SIDE_VIEW)).toBe(true)
    expect(overlapOnScreen(P, shadow(P, 'xz'), TOP_VIEW)).toBe(true)
  })

  it('two different shadows give back all three coordinates (practice: shadow detective)', () => {
    const floor = shadow([4, 2.5, 1], 'xz')
    const back = shadow([4, 2.5, 1], 'xy')
    expect(floor).toEqual([4, 0, 1])
    expect(back).toEqual([4, 2.5, 0])
    expect([floor[0], back[1], floor[2]]).toEqual([4, 2.5, 1])
  })
})

describe('turning the view', () => {
  it('wraps yaw into (−180, 180] and never returns −0', () => {
    expect(wrapDegrees(190)).toBe(-170)
    expect(wrapDegrees(-190)).toBe(170)
    expect(wrapDegrees(180)).toBe(180)
    expect(wrapDegrees(-180)).toBe(180)
    expect(Object.is(wrapDegrees(-360), 0)).toBe(true)
  })

  it('stops pitch at straight up and straight down', () => {
    expect(clampPitch(120)).toBe(90)
    expect(clampPitch(-95)).toBe(-90)
    expect(rotateView({ yaw: 170, pitch: 80 }, 20, 30)).toEqual({ yaw: -170, pitch: 90 })
  })

  it('animates the short way round', () => {
    const a = { yaw: 170, pitch: 0 }
    const b = { yaw: -170, pitch: 20 }
    expect(lerpView(a, b, 0.5)).toEqual({ yaw: 180, pitch: 10 })
    expect(sameView(lerpView(CORNER_VIEW, FRONT_VIEW, 1), FRONT_VIEW)).toBe(true)
    expect(sameView(lerpView(CORNER_VIEW, FRONT_VIEW, 0), CORNER_VIEW)).toBe(true)
  })

  it('treats 180° and −180° yaw as the same view', () => {
    expect(sameView({ yaw: 180, pitch: 5 }, { yaw: -180, pitch: 5 })).toBe(true)
    expect(sameView(FRONT_VIEW, SIDE_VIEW)).toBe(false)
  })
})

describe('dragging along the floor', () => {
  it('floorToScreen columns are where the x and z axes appear', () => {
    const m = floorToScreen(TOP_VIEW)
    expect(approxEqualVec(m.flat(), [1, 0, 0, -1])).toBe(true)
  })

  it('screenToFloor undoes floorToScreen', () => {
    const step: [number, number] = [1.5, -0.5]
    const m = floorToScreen(CORNER_VIEW)
    const screen: [number, number] = [
      m[0][0] * step[0] + m[0][1] * step[1],
      m[1][0] * step[0] + m[1][1] * step[1],
    ]
    const back = screenToFloor(CORNER_VIEW, screen)
    expect(back).not.toBeNull()
    expect(approxEqualVec(back!, step)).toBe(true)
  })

  it('refuses when the floor is seen edge-on', () => {
    expect(screenToFloor(FRONT_VIEW, [1, 1])).toBeNull()
    expect(screenToFloor({ yaw: -35, pitch: 5 }, [1, 1])).toBeNull()
  })
})

describe('planes (lesson 1.3, "A plane inside the room")', () => {
  const floor = { normal: [0, 1, 0] as Vec3, d: 0 }
  const ramp = { normal: [0, 1, -1] as Vec3, d: 0 }

  it('planeSide tells the two sides apart, and 0 means on the plane', () => {
    expect(planeSide([2, 3, 1], floor)).toBe(1)
    expect(planeSide([2, -1.5, 1], floor)).toBe(-1)
    expect(planeSide([2, 0, 1], floor)).toBe(0)
    expect(planeSide([1, 4, 1.5], ramp)).toBe(1)
    expect(planeSide([1, 2, 2], ramp)).toBe(0)
  })

  it('slicePlane gives the floor square, in order round the edge', () => {
    const sq = slicePlane(floor, 0, 5)
    expect(sq).toHaveLength(4)
    for (const c of sq) expect(c[1]).toBe(0)
    // Neighbours share an edge: they differ in exactly one coordinate.
    sq.forEach((c, k) => {
      const n = sq[(k + 1) % 4]
      expect(c.filter((v, i) => v !== n[i])).toHaveLength(1)
    })
  })

  it('slicePlane: the ramp y = z is a rectangle, a corner-cutting sheet a hexagon, a far plane nothing', () => {
    const r = slicePlane(ramp, 0, 5)
    expect(r).toHaveLength(4)
    for (const c of r) expect(c[1]).toBeCloseTo(c[2])
    const hex = slicePlane({ normal: [1, 1, 1], d: 7.5 }, 0, 5)
    expect(hex).toHaveLength(6)
    for (const c of hex) expect(c[0] + c[1] + c[2]).toBeCloseTo(7.5)
    expect(slicePlane({ normal: [1, 1, 1], d: 20 }, 0, 5)).toEqual([])
  })

  it('towardViewer points out of the screen', () => {
    expect(approxEqualVec(towardViewer(FRONT_VIEW), [0, 0, 1])).toBe(true)
    expect(approxEqualVec(towardViewer(TOP_VIEW), [0, 1, 0])).toBe(true)
    expect(approxEqualVec(toCamera(towardViewer(CORNER_VIEW), CORNER_VIEW), [0, 0, 1])).toBe(true)
  })

  it('nearerThanPlane: from above, points over the floor are in front of it', () => {
    expect(nearerThanPlane([2, 3, 1], floor, CORNER_VIEW)).toBe(true)
    expect(nearerThanPlane([2, -1.5, 1], floor, CORNER_VIEW)).toBe(false)
    // Seen exactly edge-on, the plane hides nothing.
    expect(nearerThanPlane([2, -1.5, 1], floor, FRONT_VIEW)).toBe(true)
  })

  it('cross3 and dot3', () => {
    expect(cross3([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1])
    expect(dot3([1, 2, 3], [4, 5, 6])).toBe(32)
  })
})
