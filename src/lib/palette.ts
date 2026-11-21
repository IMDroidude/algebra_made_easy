/**
 * Colours for mathematical objects. Chosen to keep at least 3:1 contrast on
 * both the light and the dark canvas, so one set serves both themes. Every
 * coloured object also carries a text label; colour is never the only cue.
 */
export const COLOR = {
  /** first basis vector î, and matrix column 1 */
  i: '#e8590c',
  /** second basis vector ĵ, and matrix column 2 */
  j: '#0c8599',
  /** the vector being studied */
  v: '#7048e8',
  /** a result, such as a sum */
  result: '#2f9e44',
  /** the grid after a transformation, so it stands apart from the fixed grey grid */
  grid: '#4c6ef5',
  /** secondary, de-emphasised objects */
  ghost: '#8a8780',
} as const
