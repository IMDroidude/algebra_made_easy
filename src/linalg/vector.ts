import type { Vec } from './types'

function assertSameLength(a: Vec, b: Vec): void {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }
}

export function add<T extends Vec>(a: T, b: T): T {
  assertSameLength(a, b)
  return a.map((x, i) => x + b[i]) as T
}

export function sub<T extends Vec>(a: T, b: T): T {
  assertSameLength(a, b)
  return a.map((x, i) => x - b[i]) as T
}

export function scale<T extends Vec>(v: T, k: number): T {
  return v.map((x) => x * k) as T
}

export function dot(a: Vec, b: Vec): number {
  assertSameLength(a, b)
  return a.reduce((sum, x, i) => sum + x * b[i], 0)
}

export function norm(v: Vec): number {
  return Math.sqrt(dot(v, v))
}

/** Angle of a 2D vector, measured counter-clockwise from the positive x-axis, in degrees. */
export function angleDeg(v: Vec): number {
  return (Math.atan2(v[1], v[0]) * 180) / Math.PI
}
