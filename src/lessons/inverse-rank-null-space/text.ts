import { fmt } from '../../lib/format'
import type { Mat2, Vec2 } from '../../linalg'

/**
 * One equation a·x + b·y = c written the way a person would: "x − y = 1",
 * "2x + 0.5y = 3", "0 = 3". Uses a real minus sign.
 */
export function linearEqText([a, b]: Vec2, c: number): string {
  const term = (k: number, name: string) => (fmt(Math.abs(k)) === '1' ? name : `${fmt(Math.abs(k))}${name}`)
  const parts: string[] = []
  if (fmt(a) !== '0') parts.push(`${a < 0 ? '−' : ''}${term(a, 'x')}`)
  if (fmt(b) !== '0') {
    const t = term(b, 'y')
    parts.push(parts.length === 0 ? `${b < 0 ? '−' : ''}${t}` : `${b < 0 ? '−' : '+'} ${t}`)
  }
  const lhs = parts.length === 0 ? '0' : parts.join(' ')
  return `${lhs} = ${fmt(c).replace('-', '−')}`
}

/** What the output of a matrix of this rank looks like. */
export const RANK_SHAPE = {
  2: 'the whole plane',
  1: 'a single line',
  0: 'a single point, the origin',
} as const

/** A 2×2 matrix as KaTeX, entries rounded to `digits` places. */
export function texMat2(m: Mat2, digits = 2): string {
  const f = (x: number) => fmtFixed(x, digits)
  return String.raw`\begin{bmatrix} ${f(m[0][0])} & ${f(m[0][1])} \\ ${f(m[1][0])} & ${f(m[1][1])} \end{bmatrix}`
}

export function texVec2(v: Vec2, digits = 2): string {
  return String.raw`\begin{bmatrix} ${fmt(v[0], digits)} \\ ${fmt(v[1], digits)} \end{bmatrix}`
}

/** A number with thousands separators: 16,777,216. */
export const count = (n: number) => n.toLocaleString('en-US')

/** Like fmt, but never switches to exponent notation: 5e-8 is written 0.00000005. */
export function fmtFixed(x: number, digits = 8): string {
  const s = x.toFixed(digits).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
  return /^-0$/.test(s) ? '0' : s
}
