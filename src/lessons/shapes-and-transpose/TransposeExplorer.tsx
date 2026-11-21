import { useState } from 'react'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { transpose } from '../../linalg'
import type { Matrix } from '../../linalg'
import { pyShape, shapeOf } from './shapes'

type Cell = [row: number, col: number]

/**
 * A matrix and its transpose side by side. Pick any entry (click, or focus it
 * with Tab): it is highlighted in both, and its row in A is highlighted as the
 * matching column in A.T.
 */
export function TransposeExplorer({ matrix }: { matrix: Matrix }) {
  const [sel, setSel] = useState<Cell>([0, 2])
  const t = transpose(matrix)
  const [i, j] = sel

  const grid = (m: Matrix, name: string, isT: boolean) => {
    const cols = m[0].length
    return (
      <figure className="m-0">
        <figcaption className="mb-1 text-center font-mono text-sm">
          {name} {pyShape(shapeOf(m))}
        </figcaption>
        <div
          role="group"
          aria-label={`${name}, shape ${pyShape(shapeOf(m))}`}
          className="grid gap-1.5 rounded-sm border-x-2 border-ink px-2 py-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, 2.75rem)` }}
        >
          {m.map((row, r) =>
            row.map((x, c) => {
              // In A.T the entry at (r, c) came from A's (c, r).
              const [ai, aj] = isT ? [c, r] : [r, c]
              const picked = ai === i && aj === j
              const sameLine = ai === i
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-pressed={picked}
                  aria-label={`${name} row ${r + 1}, column ${c + 1}: ${fmt(x)}`}
                  onClick={() => setSel([ai, aj])}
                  onFocus={() => setSel([ai, aj])}
                  className="h-9 cursor-pointer rounded-md border-2 font-mono text-base text-ink"
                  style={{
                    borderColor: picked ? COLOR.v : sameLine ? COLOR.i : 'var(--line)',
                    background: picked ? `color-mix(in srgb, ${COLOR.v} 22%, transparent)` : 'var(--surface)',
                    fontWeight: picked ? 700 : 400,
                  }}
                >
                  {fmt(x)}
                </button>
              )
            }),
          )}
        </div>
      </figure>
    )
  }

  return (
    <div className="my-4 rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {grid(matrix, 'A', false)}
        <span aria-hidden="true" className="text-xl">
          →
        </span>
        {grid(t, 'A.T', true)}
      </div>
      <p aria-live="polite" className="m-0 mt-3 text-sm">
        <strong style={{ color: COLOR.v }}>A[{i}, {j}]</strong> = {fmt(matrix[i][j])} (row {i + 1},
        column {j + 1}) moves to <strong style={{ color: COLOR.v }}>A.T[{j}, {i}]</strong> (row{' '}
        {j + 1}, column {i + 1}); NumPy indexes count from 0. The whole of <strong style={{ color: COLOR.i }}>row {i + 1} of A</strong> becomes{' '}
        <strong style={{ color: COLOR.i }}>column {i + 1} of A.T</strong> (outlined).
      </p>
    </div>
  )
}
