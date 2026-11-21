import { fmt } from '../../lib/format'
import type { FitLine } from '../../linalg/systems'

/** "y = 0.62x + 0.08", "y = −1", "y = x − 0.5" with a real minus sign. */
export function lineText(line: FitLine): string {
  const m = fmt(line.slope)
  const b = fmt(line.intercept)
  const slopePart = m === '0' ? '' : m === '1' ? 'x' : m === '-1' ? '−x' : `${m.replace('-', '−')}x`
  if (slopePart === '') return `y = ${b.replace('-', '−')}`
  if (b === '0') return `y = ${slopePart}`
  return `y = ${slopePart} ${b.startsWith('-') ? '−' : '+'} ${b.replace('-', '')}`
}
