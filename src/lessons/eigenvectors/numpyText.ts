/**
 * Reproduces what NumPy 2 prints for the small arrays in these lessons, so
 * the outputs under the code snippets are what real NumPy shows. Checked
 * against real NumPy output in tests/lessons/eigenvectors and tests/lessons/svd.
 *
 * Covers 1-D float and complex arrays short enough not to wrap, with the
 * default print options (precision 8, no suppression).
 */

/** NumPy's rint: round half to even. */
function rint(y: number): number {
  const r = Math.round(y)
  // Math.round sends .5 up; NumPy sends it to the even neighbour.
  return Math.abs(y - Math.trunc(y)) === 0.5 && r % 2 !== 0 ? r - 1 : r
}

/** np.round(x, decimals): multiply, round half to even, divide, exactly as NumPy does. */
export function npRound(x: number, decimals: number): number {
  const f = 10 ** decimals
  return rint(x * f) / f
}

type Parts = { int: string; frac: string; exp?: string }

/** Shortest digits that read back as x (NumPy's "unique" mode), split at the point. */
function positional(x: number, plus: boolean): Parts {
  const neg = x < 0 || Object.is(x, -0)
  let body = Math.abs(x).toString()
  if (body.includes('e') || (body.split('.')[1] ?? '').length > 8) {
    body = Math.abs(x).toFixed(8).replace(/0+$/, '')
  }
  const [int, frac = ''] = body.split('.')
  return { int: (neg ? '-' : plus ? '+' : '') + int, frac }
}

function scientific(x: number, plus: boolean): Parts {
  const neg = x < 0 || Object.is(x, -0)
  const [mant, exp] = Math.abs(x).toExponential().split('e')
  const [int, frac = ''] = mant.split('.')
  const e = Number(exp)
  const expText = `${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(2, '0')}`
  return { int: (neg ? '-' : plus ? '+' : '') + int, frac, exp: expText }
}

/** Formats every value of one float array the way NumPy's FloatingFormat does. */
function floatFormatter(values: number[], plus = false): string[] {
  const nonZero = values.map(Math.abs).filter((v) => v !== 0)
  const max = nonZero.length ? Math.max(...nonZero) : 0
  const min = nonZero.length ? Math.min(...nonZero) : 0
  const exp = nonZero.length > 0 && (max >= 1e8 || min < 1e-4 || max / min > 1e3)
  if (exp) {
    const parts = values.map((v) => scientific(v, plus))
    const precision = Math.max(...parts.map((p) => p.frac.length))
    const padLeft = Math.max(...parts.map((p) => p.int.length))
    const expSize = Math.max(...parts.map((p) => p.exp!.length)) - 1
    return parts.map(
      (p) =>
        `${p.int.padStart(padLeft)}.${p.frac.padEnd(precision, '0')}e${p.exp![0]}${p.exp!.slice(1).padStart(expSize, '0')}`,
    )
  }
  const parts = values.map((v) => positional(v, plus))
  const padLeft = Math.max(...parts.map((p) => p.int.length))
  const padRight = Math.max(...parts.map((p) => p.frac.length))
  return parts.map((p) => `${p.int.padStart(padLeft)}.${p.frac.padEnd(padRight)}`)
}

/** print() of a 1-D float64 array. */
export function npFloatArray(values: number[]): string {
  return `[${floatFormatter(values).join(' ')}]`
}

/** print() of a 2-D float64 array. */
export function npFloatMatrix(rows: number[][]): string {
  const cells = floatFormatter(rows.flat())
  const width = rows[0].length
  const lines = rows.map((_, r) => `[${cells.slice(r * width, (r + 1) * width).join(' ')}]`)
  return `[${lines.join('\n ')}]`
}

/** print() of a 1-D complex128 array, given real and imaginary parts. */
export function npComplexArray(re: number[], im: number[]): string {
  const r = floatFormatter(re)
  const i = floatFormatter(im, true).map((s) => {
    const end = s.trimEnd().length
    return `${s.slice(0, end)}j${s.slice(end)}`
  })
  return `[${r.map((x, k) => x + i[k]).join(' ')}]`
}

/** print() of a NumPy float64 scalar (Python's repr of a float). */
export function npScalar(x: number): string {
  if (Number.isInteger(x) && Math.abs(x) < 1e16) return `${Object.is(x, -0) ? '-' : ''}${x}.0`
  return String(x)
}
