import { COLOR } from '../lib/palette'
import type { Mat2 } from '../linalg'
import { NumberField } from './NumberField'

/**
 * An editable 2×2 matrix. Each column is tied to a basis vector on the plane
 * by a heading and a matching underline colour.
 */
export function MatrixInput({
  value,
  onChange,
  name = 'A',
  columnLabels = ['î lands at', 'ĵ lands at'],
  highlightRow,
}: {
  value: Mat2
  onChange: (next: Mat2) => void
  name?: string
  columnLabels?: [string, string]
  highlightRow?: 0 | 1
}) {
  const set = (row: 0 | 1, col: 0 | 1, x: number) => {
    const next: Mat2 = [
      [value[0][0], value[0][1]],
      [value[1][0], value[1][1]],
    ]
    next[row][col] = x
    onChange(next)
  }
  const colors = [COLOR.i, COLOR.j]

  return (
    <div className="inline-flex items-end gap-3">
      <span className="pb-6 font-display text-2xl italic" aria-hidden="true">
        {name} =
      </span>
      <div role="group" aria-label={`Matrix ${name}`}>
        <div className="mb-1 grid grid-cols-2 gap-2 px-3 text-center text-xs font-medium">
          {columnLabels.map((label, col) => (
            <span key={label} style={{ color: colors[col] }}>
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-sm border-x-2 border-ink px-3 py-2">
          {([0, 1] as const).map((row) =>
            ([0, 1] as const).map((col) => (
              <NumberField
                key={`${row}${col}`}
                label={`${name} row ${row + 1}, column ${col + 1}`}
                value={value[row][col]}
                onChange={(x) => set(row, col, x)}
                accent={colors[col]}
                emphasised={highlightRow === row}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
}
