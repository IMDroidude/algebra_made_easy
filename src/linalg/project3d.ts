import { inverse2 } from './matrix'
import { approxEqual, isZero } from './tolerance'
import type { Mat2, Vec2 } from './types'

/**
 * 3D helpers for drawing a cube on a flat screen (lesson 1.3).
 *
 * World axes: x to the right, y up, z toward the viewer when the view is
 * "front" (the same x and y as the 2D plane, with z added). This is a
 * right-handed system.
 *
 * A view is two angles in degrees: `yaw` turns the scene about the vertical
 * y-axis, `pitch` then tilts it about the screen's horizontal axis. The
 * picture is an orthographic projection: after turning, the camera simply
 * drops the depth coordinate.
 */
export type Vec3 = [x: number, y: number, z: number]
export type View = { yaw: number; pitch: number }

/** The three walls of the room-corner: each is the plane where one coordinate is 0. */
export type Wall = 'xy' | 'yz' | 'xz'

export const PITCH_LIMIT = 90

/** Looking at the corner from above and in front: all three axes visible. */
export const CORNER_VIEW: View = { yaw: -35, pitch: 22 }
/** Looking straight at the back wall (xy): x right, y up, z points at you. */
export const FRONT_VIEW: View = { yaw: 0, pitch: 0 }
/** Looking straight at the side wall (yz) from the +x side: z left, y up. */
export const SIDE_VIEW: View = { yaw: -90, pitch: 0 }
/** Looking straight down at the floor (xz) from above: x right, z down the screen. */
export const TOP_VIEW: View = { yaw: 0, pitch: 90 }

const rad = (deg: number) => (deg * Math.PI) / 180

/** Rotation about the y-axis; positive angles carry +x toward −z. */
export function rotateY([x, y, z]: Vec3, degrees: number): Vec3 {
  const c = Math.cos(rad(degrees))
  const s = Math.sin(rad(degrees))
  return [x * c + z * s, y, -x * s + z * c]
}

/** Rotation about the x-axis; positive angles carry +y toward +z. */
export function rotateX([x, y, z]: Vec3, degrees: number): Vec3 {
  const c = Math.cos(rad(degrees))
  const s = Math.sin(rad(degrees))
  return [x, y * c - z * s, y * s + z * c]
}

/** World point → camera coordinates: x right, y up, z toward the viewer. */
export function toCamera(p: Vec3, view: View): Vec3 {
  return rotateX(rotateY(p, view.yaw), view.pitch)
}

/** Where a 3D point appears on the flat picture (y up, same units as the world). */
export function project(p: Vec3, view: View): Vec2 {
  const [x, y] = toCamera(p, view)
  return [x, y]
}

/** How close a point is to the viewer; larger is nearer. Used to draw far things first. */
export function depth(p: Vec3, view: View): number {
  return toCamera(p, view)[2]
}

/** The point's shadow on a wall: the same point with one coordinate set to 0. */
export function shadow([x, y, z]: Vec3, wall: Wall): Vec3 {
  if (wall === 'xy') return [x, y, 0]
  if (wall === 'yz') return [0, y, z]
  return [x, 0, z]
}

/** An angle in degrees wrapped into (−180, 180]. */
export function wrapDegrees(deg: number): number {
  const w = ((((deg + 180) % 360) + 360) % 360) - 180
  return w === -180 ? 180 : w + 0
}

export function clampPitch(deg: number): number {
  return Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, deg))
}

/** Turn the view: yaw wraps around, pitch stops at straight up or straight down. */
export function rotateView(view: View, dYaw: number, dPitch: number): View {
  return { yaw: wrapDegrees(view.yaw + dYaw), pitch: clampPitch(view.pitch + dPitch) }
}

/** Blend two views for animation, turning the short way round. */
export function lerpView(a: View, b: View, t: number): View {
  const dYaw = wrapDegrees(b.yaw - a.yaw)
  return {
    yaw: wrapDegrees(a.yaw + dYaw * t),
    pitch: a.pitch + (b.pitch - a.pitch) * t,
  }
}

export function sameView(a: View, b: View): boolean {
  return approxEqual(wrapDegrees(a.yaw - b.yaw), 0) && approxEqual(a.pitch, b.pitch)
}

/**
 * The 2×2 matrix taking a step (dx, dz) along the floor to the step it makes
 * on the picture. Its columns are where the x and z axes appear on screen.
 */
export function floorToScreen(view: View): Mat2 {
  const [ax, ay] = project([1, 0, 0], view)
  const [bx, by] = project([0, 0, 1], view)
  return [
    [ax, bx],
    [ay, by],
  ]
}

/**
 * Inverts `floorToScreen`: which step (dx, dz) along the floor produces this
 * step on the picture? Returns null when the floor is seen nearly edge-on
 * (its on-screen area factor below `minArea`), where a small mouse movement
 * would mean a huge jump in depth.
 */
export function screenToFloor(view: View, screenStep: Vec2, minArea = 0.2): Vec2 | null {
  const m = floorToScreen(view)
  const area = Math.abs(m[0][0] * m[1][1] - m[0][1] * m[1][0])
  if (area < minArea) return null
  const inv = inverse2(m)
  if (!inv) return null
  const [sx, sy] = screenStep
  return [inv[0][0] * sx + inv[0][1] * sy, inv[1][0] * sx + inv[1][1] * sy]
}

/** True when two points land on the same spot of the picture (within tolerance). */
export function overlapOnScreen(a: Vec3, b: Vec3, view: View): boolean {
  const [ax, ay] = project(a, view)
  const [bx, by] = project(b, view)
  return isZero(ax - bx) && isZero(ay - by)
}

/** A flat plane: every point p with normal · p = d. It is infinite and splits space into two sides. */
export type Plane3 = { normal: Vec3; d: number }

export function dot3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/** Which side of the plane a point is on: 1 (the side the normal points to), −1, or 0 (on the plane). */
export function planeSide(p: Vec3, plane: Plane3): -1 | 0 | 1 {
  const s = dot3(plane.normal, p) - plane.d
  return isZero(s) ? 0 : s > 0 ? 1 : -1
}

/**
 * The part of the plane inside the cube [lo, hi]³, as a polygon with its
 * corners in order around the edge. Empty when the plane misses the cube.
 */
export function slicePlane(plane: Plane3, lo: number, hi: number): Vec3[] {
  const corners: Vec3[] = []
  for (const x of [lo, hi]) for (const y of [lo, hi]) for (const z of [lo, hi]) corners.push([x, y, z])
  const f = (p: Vec3) => dot3(plane.normal, p) - plane.d
  const hits: Vec3[] = []
  const add = (q: Vec3) => {
    if (!hits.some((h) => isZero(h[0] - q[0]) && isZero(h[1] - q[1]) && isZero(h[2] - q[2]))) hits.push(q)
  }
  corners.forEach((a, i) =>
    corners.slice(i + 1).forEach((b) => {
      if (a.filter((v, k) => v !== b[k]).length !== 1) return
      const fa = f(a)
      const fb = f(b)
      if (isZero(fa)) add(a)
      if (isZero(fb)) add(b)
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
        const t = fa / (fa - fb)
        add([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t])
      }
    }),
  )
  if (hits.length < 3) return []
  // Sort the corners by angle about their centre, measured in the plane.
  const c: Vec3 = [0, 1, 2].map((k) => hits.reduce((s, h) => s + h[k], 0) / hits.length) as Vec3
  const n = plane.normal
  const helper: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const u = cross3(n, helper)
  const w = cross3(n, u)
  const angle = (h: Vec3) => {
    const r: Vec3 = [h[0] - c[0], h[1] - c[1], h[2] - c[2]]
    return Math.atan2(dot3(r, w), dot3(r, u))
  }
  return hits.sort((a, b) => angle(a) - angle(b))
}

export function cross3(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

/** The world direction that points straight out of the screen, at the viewer. */
export function towardViewer(view: View): Vec3 {
  return rotateY(rotateX([0, 0, 1], -view.pitch), -view.yaw)
}

/**
 * True when the point is between the plane and the viewer, so it should be
 * drawn on top of the plane. A plane seen exactly edge-on hides nothing.
 */
export function nearerThanPlane(p: Vec3, plane: Plane3, view: View): boolean {
  const v = towardViewer(view)
  const nv = dot3(plane.normal, v)
  if (isZero(nv)) return true
  // Walking from p toward the viewer reaches the plane after t = (d − n·p) / (n·v).
  const t = (plane.d - dot3(plane.normal, p)) / nv
  return t < 0 || isZero(t)
}
