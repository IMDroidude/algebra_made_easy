/**
 * Exactly what Python prints for a few kinds of number, so the NumPy outputs
 * in this lesson match a real run character for character. (The shared
 * `numpyPrint` covers arrays; these cover single numbers.)
 */
import { fmt } from '../../lib/format'

/**
 * Python's f"{x:.{digits}f}". Differs from JavaScript's toFixed in two places:
 * an exact tie rounds to even (f"{0.0625:.3f}" is "0.062"), and negative zero
 * keeps its sign ("-0.000"). NaN prints as "nan".
 */
export function pyFixed(x: number, digits: number): string {
  if (Number.isNaN(x)) return 'nan'
  const negative = x < 0 || Object.is(x, -0)
  const abs = Math.abs(x)
  let text = abs.toFixed(digits)
  // toFixed(100) is the exact decimal value of the double. Up to 100 digits
  // has been allowed since ES2018; the lint rule still assumes the old limit of 20.
  // oxlint-disable-next-line number-arg-out-of-range
  const exact = abs.toFixed(100)
  const point = exact.indexOf('.')
  const next = exact.slice(point + 1 + digits)
  if (/^50*$/.test(next)) {
    // An exact tie: toFixed rounded up; Python rounds to the even neighbour.
    const down = exact.slice(0, point + 1 + digits).replace(/\.$/, '')
    const lastDigit = Number(down[down.length - 1])
    if (lastDigit % 2 === 0) text = down
  }
  return negative ? `-${text}` : text
}

/** Python's print() of a float (or np.float64): "5.0", "4.25", "-0.0", "nan". */
export function pyFloat(x: number): string {
  if (Number.isNaN(x)) return 'nan'
  if (Object.is(x, -0)) return '-0.0'
  // Python and JavaScript both print the shortest round-tripping digits; they
  // differ only for whole numbers ("5.0" vs "5") in the range this app uses.
  return Number.isInteger(x) ? `${x}.0` : String(x)
}

/**
 * One entry of NumPy's matrix-vector product `docs @ q` for 2D rows. Integer
 * arrays have no negative zero. For float arrays NumPy adds the first product
 * to the second, so when both are −0 (say (−1, 0) · (0, −1)) the entry is −0
 * and prints as "-0.000". Our `dot` starts its sum from +0, hence this copy.
 * The code shows a −0 entry as "0", which Python reads as +0, so entries are
 * turned into +0 first (x + 0 does that).
 */
export function numpyRowDot(d: readonly number[], q: readonly number[], integer: boolean): number {
  const sum = (d[0] + 0) * (q[0] + 0) + (d[1] + 0) * (q[1] + 0)
  return integer ? sum + 0 : sum
}

/** How print() shows the result of `a @ b`: an int for int arrays, a float otherwise. */
export function pyScalar(x: number, integer: boolean): string {
  return integer ? fmt(x, 0) : pyFloat(x)
}
