/**
 * Text for this lesson's NumPy snippets. Softmax produces long floats, so every
 * snippet calls np.set_printoptions(precision=2, suppress=True) and the output
 * shown here mimics exactly what NumPy prints with those options (checked
 * against real NumPy output in tests/lessons/attention).
 */
import { fmt } from '../../lib/format'
import type { Matrix, Vec } from '../../linalg'

export const PRINT_OPTIONS = 'np.set_printoptions(precision=2, suppress=True)'

/**
 * One float as NumPy shows it with precision=2: the exact binary value rounded
 * to 2 decimals (exact ties go to the even digit), trailing zeros dropped,
 * sign kept even when the result is zero ("-0.").
 */
function floatParts(x: number): { whole: string; frac: string } {
  // Exact ties at 2 decimals only happen for odd multiples of 1/8 (0.125, 0.375, …).
  const tie = Number.isInteger(x * 8) && !Number.isInteger(x * 4)
  let text: string
  if (tie) {
    const hundredths = Math.trunc(x * 100) // e.g. 12 for 0.125
    const even = hundredths % 2 === 0 ? hundredths : hundredths + Math.sign(x)
    text = (even / 100).toFixed(2)
  } else {
    text = x.toFixed(2)
  }
  const negative = x < 0 || Object.is(x, -0)
  let [whole, frac] = text.replace('-', '').split('.')
  frac = frac.replace(/0+$/, '')
  if (negative) whole = `-${whole}`
  return { whole, frac }
}

/** A 1D or 2D array printed the way NumPy prints it (float or integer dtype). */
export function npArray(values: Vec | Matrix, integer = false): string {
  const is2d = Array.isArray(values[0])
  const rows = (is2d ? values : [values]) as Matrix
  const parts = rows.map((row) =>
    row.map((x) => (integer ? { whole: String(x), frac: '' } : floatParts(x))),
  )
  const flat = parts.flat()
  const wholeWidth = Math.max(...flat.map((p) => p.whole.length))
  const fracWidth = Math.max(...flat.map((p) => p.frac.length))
  const cell = (p: { whole: string; frac: string }) =>
    integer
      ? p.whole.padStart(wholeWidth)
      : `${p.whole.padStart(wholeWidth)}.${p.frac.padEnd(fracWidth)}`
  const lines = parts.map((row) => `[${row.map(cell).join(' ')}]`)
  return is2d ? `[${lines.join('\n ')}]` : lines[0]
}

/** A NumPy literal for a list of row vectors, continuation rows aligned. */
export function npLiteral(name: string, rows: Vec[], comment?: string): string {
  const head = `${name} = np.array([`
  const pad = ' '.repeat(head.length)
  const body = rows.map((r) => `[${r.map((x) => fmt(x)).join(', ')}]`).join(`,\n${pad}`)
  return `${head}${body}])${comment ? `  # ${comment}` : ''}`
}

/** True when NumPy would build an integer array from these literals. */
export function allIntegers(...matrices: Vec[][]): boolean {
  return matrices.every((m) => m.every((row) => row.every((x) => Number.isInteger(x))))
}
