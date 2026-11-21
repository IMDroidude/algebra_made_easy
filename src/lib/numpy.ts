/**
 * Exact replicas of what NumPy 2 prints with its default print options:
 * 8-digit precision, round-half-to-even, scientific notation, negative zero,
 * line wrapping, Python float scalars and `np.round`.
 *
 * Verified against real NumPy 2.4 by tests/lib/numpy.test.ts (fixtures printed by NumPy).
 */

const PRECISION = 8
const LINE_WIDTH = 75

const isNegative = (x: number) => x < 0 || Object.is(x, -0)

/** C's rint: round half to even, keeping the sign of zero. */
function rint(y: number): number {
  const f = Math.floor(y)
  const diff = y - f
  let r: number
  if (diff < 0.5) r = f
  else if (diff > 0.5) r = f + 1
  else r = f % 2 === 0 ? f : f + 1
  return r === 0 && isNegative(y) ? -0 : r
}

/** `np.round(x, decimals)` for decimals ≥ 0: scale, round half to even, unscale. */
export function npRound(x: number, decimals: number): number {
  const f = 10 ** decimals
  return rint(x * f) / f
}

/**
 * Digits of |x| after rounding to at most `digits` places, shortest form that
 * still identifies the number (Dragon4 in "unique" mode with a cut-off).
 */
function positionalParts(a: number, digits: number): [string, string] {
  const shortest = String(a)
  const [whole, frac = ''] = shortest.split('.')
  if (frac.length <= digits && !shortest.includes('e')) return [whole, frac]
  const exact = a.toFixed(Math.min(100, digits + 30))
  const [w, f] = exact.split('.')
  const kept = f.slice(0, digits)
  const rest = f.slice(digits)
  // Exact half: round to even like Dragon4; otherwise toFixed already rounds correctly.
  if (/^50*$/.test(rest)) {
    const up = Number(kept.at(-1) ?? w.at(-1)) % 2 === 1
    const rounded = up ? (BigInt(w + kept) + 1n).toString() : (w + kept).replace(/^0+(?=\d)/, '')
    const padded = rounded.padStart(digits + 1, '0')
    return [padded.slice(0, padded.length - digits) || '0', padded.slice(padded.length - digits).replace(/0+$/, '')]
  }
  const [rw, rf] = a.toFixed(digits).split('.')
  return [rw, (rf ?? '').replace(/0+$/, '')]
}

/** Mantissa digits and exponent of |x|, shortest form, at most `digits` after the point. */
function scientificParts(a: number, digits: number): [string, string, number] {
  let s = a.toExponential()
  let [mant, exp] = s.split('e')
  let [whole, frac = ''] = mant.split('.')
  if (frac.length > digits) {
    s = a.toExponential(digits)
    ;[mant, exp] = s.split('e')
    ;[whole, frac = ''] = mant.split('.')
    frac = frac.replace(/0+$/, '')
  }
  return [whole, frac, Number(exp)]
}

const expText = (e: number, width: number) =>
  `${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(width, '0')}`

/** How NumPy formats each element of a float array, all to one width. */
function floatFormatter(values: number[]): (x: number) => string {
  const finite = values.filter(Number.isFinite)
  const nonZero = finite.filter((x) => x !== 0).map(Math.abs)
  let useExp = false
  if (nonZero.length > 0) {
    const max = Math.max(...nonZero)
    const min = Math.min(...nonZero)
    useExp = max >= 1e8 || min < 1e-4 || max / min > 1e3
  }

  if (!useExp) {
    const parts = finite.map((x) => {
      const [w, f] = positionalParts(Math.abs(x), PRECISION)
      return [(isNegative(x) ? '-' : '') + w, f] as const
    })
    const padLeft = Math.max(...parts.map((p) => p[0].length))
    const padRight = Math.max(...parts.map((p) => p[1].length))
    return (x) => {
      const [w, f] = positionalParts(Math.abs(x), PRECISION)
      return `${((isNegative(x) ? '-' : '') + w).padStart(padLeft)}.${f.padEnd(padRight)}`
    }
  }

  const parts = finite.map((x) => scientificParts(Math.abs(x), PRECISION))
  const precision = Math.max(...parts.map((p) => p[1].length))
  const expSize = Math.max(2, ...parts.map((p) => String(Math.abs(p[2])).length))
  const padLeft = Math.max(...finite.map((x, k) => parts[k][0].length + (isNegative(x) ? 1 : 0)))
  return (x) => {
    const a = Math.abs(x)
    let whole: string
    let frac: string
    let e: number
    if (a === 0) {
      whole = '0'
      frac = ''
      e = 0
    } else {
      // Re-round to the shared precision so every mantissa has the same length.
      const [m, ex] = a.toExponential(precision).split('e')
      ;[whole, frac = ''] = m.split('.')
      e = Number(ex)
    }
    const sign = isNegative(x) ? '-' : ''
    return `${(sign + whole).padStart(padLeft)}.${frac.padEnd(precision, '0')}e${expText(e, expSize)}`
  }
}

function intFormatter(values: number[]): (x: number) => string {
  const width = Math.max(...values.map((x) => String(x).length))
  return (x) => String(x).padStart(width)
}

/** One bracketed line of elements, wrapped the way NumPy wraps long rows. */
function formatRow(words: string[], hangingIndent: string, width: number): string {
  const elemWidth = width - 1
  let s = ''
  let line = hangingIndent
  words.forEach((word, k) => {
    if (line.length + word.length > elemWidth && line.length > hangingIndent.length) {
      s += line.trimEnd() + '\n'
      line = hangingIndent
    }
    line += word
    if (k < words.length - 1) line += ' '
  })
  s += line
  return '[' + s.slice(hangingIndent.length) + ']'
}

/**
 * What `print(arr)` shows for a 1D or 2D array. `integer` says whether NumPy
 * would hold the array with an integer dtype.
 */
export function npArray(values: number[] | number[][], integer = false): string {
  const twoD = Array.isArray(values[0])
  const rows = (twoD ? values : [values]) as number[][]
  const fmtElem = integer ? intFormatter(rows.flat()) : floatFormatter(rows.flat())
  if (!twoD) return formatRow(rows[0].map(fmtElem), ' ', LINE_WIDTH)
  const inner = rows.map((r) => formatRow(r.map(fmtElem), '  ', LINE_WIDTH - 1))
  return '[' + inner.join('\n ') + ']'
}

/** What `print(x)` shows for a Python float or a NumPy float64 scalar. */
export function npFloat(x: number): string {
  if (Number.isNaN(x)) return 'nan'
  if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf'
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0'
  const a = Math.abs(x)
  if (a >= 1e-4 && a < 1e16) {
    const s = String(x)
    return s.includes('.') ? s : `${s}.0`
  }
  const [m, e] = x.toExponential().split('e')
  return `${m}e${expText(Number(e), 2)}`
}

/** A number written as a Python literal: shortest exact form, never "-0". */
export const pyLiteral = (x: number) => String(x + 0)
