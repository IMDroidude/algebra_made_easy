/** Small display pieces used by several steps of the attention lesson. */
import type { ReactNode } from 'react'
import { Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { QUERY_COLOR } from './data'

/** Hex colour plus an alpha from 0 to 1, as an rgba() string. */
function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha.toFixed(3)})`
}

/**
 * A table of scores, one row per query and one column per key. Positive cells
 * are tinted purple and negative ones orange, darker for bigger numbers; the
 * number is always printed, so colour is not the only cue. Each cell is a
 * button that selects that query/key pair.
 */
export function HeatMap({
  scores,
  rowNames,
  colNames,
  colColors,
  selected,
  onSelect,
}: {
  scores: number[][]
  rowNames: string[]
  colNames: string[]
  colColors: readonly string[]
  selected: [row: number, col: number]
  onSelect: (row: number, col: number) => void
}) {
  const biggest = Math.max(1, ...scores.flat().map(Math.abs))
  return (
    <table className="w-full table-fixed border-separate border-spacing-1 text-center text-sm">
      <caption className="sr-only">
        Scores: the dot product of each query with each key. Pick a cell to see how it is
        computed.
      </caption>
      <thead>
        <tr>
          <th scope="col" className="w-[30%] text-left text-xs font-medium text-muted">
            query ↓ · key →
          </th>
          {colNames.map((c, j) => (
            <th key={c} scope="col" className="font-semibold" style={{ color: colColors[j] }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {scores.map((row, i) => (
          <tr key={rowNames[i]}>
            <th scope="row" className="text-left font-semibold" style={{ color: QUERY_COLOR }}>
              {rowNames[i]}
            </th>
            {row.map((s, j) => {
              const isSel = selected[0] === i && selected[1] === j
              const inLine = selected[0] === i || selected[1] === j
              return (
                <td key={j} className="p-0">
                  <button
                    type="button"
                    aria-pressed={isSel}
                    aria-label={`${rowNames[i]} · ${colNames[j]} = ${fmt(s)}`}
                    onClick={() => onSelect(i, j)}
                    className={`w-full cursor-pointer rounded-md border-2 py-2 font-mono text-ink ${
                      isSel ? 'border-ink' : inLine ? 'border-line' : 'border-transparent'
                    }`}
                    style={{
                      background: tint(s >= 0 ? COLOR.v : COLOR.i, (Math.abs(s) / biggest) * 0.55),
                    }}
                  >
                    {fmt(s)}
                  </button>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Horizontal bars for a row of weights that sum to 1, each with its number. */
export function WeightBars({
  weights,
  names,
  colors,
  caption,
}: {
  weights: number[]
  names: readonly string[]
  colors: readonly string[]
  caption: ReactNode
}) {
  return (
    <figure className="m-0 rounded-xl border border-line bg-surface p-4">
      <figcaption className="mb-3 text-sm text-muted">{caption}</figcaption>
      <ul className="m-0 grid list-none gap-2 p-0">
        {weights.map((w, j) => (
          <li key={names[j]} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2">
            <span className="truncate text-sm">
              <Tag color={colors[j]}>{names[j]}</Tag>
            </span>
            <span className="h-4 overflow-hidden rounded bg-line" aria-hidden="true">
              <span
                className="block h-full rounded"
                style={{ width: `${Math.max(0, Math.min(1, w)) * 100}%`, background: colors[j] }}
              />
            </span>
            <span className="text-right font-mono text-sm">{fmt(w)}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/** A row of buttons choosing which token's query to follow. */
export function TokenPicker({
  names,
  value,
  onChange,
}: {
  names: readonly string[]
  value: number
  onChange: (i: number) => void
}) {
  return (
    <div role="group" aria-label="Which token's query to follow" className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Follow the query of:</span>
      {names.map((n, i) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === i}
          onClick={() => onChange(i)}
          className={`cursor-pointer rounded-lg border-2 px-3 py-1 text-sm font-semibold ${
            value === i ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink hover:border-accent'
          }`}
        >
          {n} (q{i + 1})
        </button>
      ))}
    </div>
  )
}
