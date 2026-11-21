import { NumberField } from '../../components/NumberField'
import type { Matrix } from '../../linalg'

/**
 * An editable matrix of any shape (the shared MatrixInput is 2×2 only).
 * Optional column headings and colours tie columns to objects on the plane.
 */
export function GridInput({
  value,
  onChange,
  name,
  columnLabels,
  colors,
}: {
  value: Matrix
  onChange: (next: Matrix) => void
  name: string
  columnLabels?: string[]
  colors?: string[]
}) {
  const cols = value[0]?.length ?? 0
  const set = (row: number, col: number, x: number) =>
    onChange(value.map((r, i) => r.map((y, j) => (i === row && j === col ? x : y))))

  return (
    <div className="inline-flex items-end gap-3">
      <span
        className={`font-display text-2xl italic ${columnLabels ? 'pb-6' : 'pb-2'}`}
        aria-hidden="true"
      >
        {name} =
      </span>
      <div role="group" aria-label={`Matrix ${name}, ${value.length} by ${cols}`}>
        {columnLabels && (
          <div
            className="mb-1 grid gap-2 px-3 text-center text-xs font-medium"
            style={{ gridTemplateColumns: `repeat(${cols}, 4.5rem)` }}
          >
            {columnLabels.map((label, col) => (
              <span key={col} style={{ color: colors?.[col] }}>
                {label}
              </span>
            ))}
          </div>
        )}
        <div
          className="grid gap-2 rounded-sm border-x-2 border-ink px-3 py-2"
          style={{ gridTemplateColumns: `repeat(${cols}, 4.5rem)` }}
        >
          {value.map((row, i) =>
            row.map((x, j) => (
              <NumberField
                key={`${i}-${j}`}
                label={`${name} row ${i + 1}, column ${j + 1}`}
                value={x}
                onChange={(n) => set(i, j, n)}
                accent={colors?.[j]}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
}
