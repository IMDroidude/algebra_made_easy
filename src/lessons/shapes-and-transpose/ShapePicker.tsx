import { useId } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Readout, Tag, Toggle } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { checkMatmul, effectiveB, pyShape } from './shapes'
import type { PickerState } from './shapes'

export const INNER = COLOR.v
export const OUTER = COLOR.result
const SIZES = [1, 2, 3, 4, 5]


/** A small picture of a matrix shape: one square per entry. */
function Block({
  rows,
  cols,
  color,
  caption,
}: {
  rows: number
  cols: number
  color: string
  caption: string
}) {
  return (
    <figure className="m-0 flex flex-col items-center gap-1">
      <div
        className="grid gap-[3px] rounded-sm border-x-2 border-ink px-1.5 py-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 14px)` }}
      >
        {Array.from({ length: rows * cols }, (_, k) => (
          <span
            key={k}
            className="block h-[14px] w-[14px] rounded-[3px]"
            style={{ background: color, opacity: 0.55 }}
          />
        ))}
      </div>
      <figcaption className="font-mono text-xs whitespace-nowrap">{caption}</figcaption>
    </figure>
  )
}

function SizeSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  const id = useId()
  return (
    <span className="inline-flex items-center gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-base text-ink"
      >
        {SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </span>
  )
}

/**
 * Pick the shapes of A and B and see whether A @ B is allowed, what shape it
 * has, or the exact error NumPy raises.
 */
export function ShapePicker({
  state,
  onChange,
}: {
  state: PickerState
  onChange: (next: PickerState) => void
}) {
  const { a, b, transposeB } = state
  const bEff = effectiveB(state)
  const check = checkMatmul(a, bEff)
  const bName = transposeB ? 'B.T' : 'B'

  const code = [
    'import numpy as np',
    '',
    `A = np.ones(${pyShape(a)})`,
    `B = np.ones(${pyShape(b)})`,
    '',
    'try:',
    `    C = A @ ${bName}`,
    '    print(C.shape)',
    'except ValueError as e:',
    '    print(e)',
  ].join('\n')

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-display text-xl italic">A</span> is
          <SizeSelect
            label="Rows of A"
            value={a[0]}
            onChange={(n) => onChange({ ...state, a: [n, a[1]] })}
          />
          ×
          <SizeSelect
            label="Columns of A"
            value={a[1]}
            onChange={(n) => onChange({ ...state, a: [a[0], n] })}
          />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="font-display text-xl italic">B</span> is
          <SizeSelect
            label="Rows of B"
            value={b[0]}
            onChange={(n) => onChange({ ...state, b: [n, b[1]] })}
          />
          ×
          <SizeSelect
            label="Columns of B"
            value={b[1]}
            onChange={(n) => onChange({ ...state, b: [b[0], n] })}
          />
        </span>
        <Toggle checked={transposeB} onChange={(t) => onChange({ ...state, transposeB: t })}>
          Use <code>B.T</code> (B transposed)
        </Toggle>
      </div>

      <div
        aria-hidden="true"
        className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-line px-3 py-5"
      >
        <Block rows={a[0]} cols={a[1]} color={COLOR.i} caption={`A ${pyShape(a)}`} />
        <span className="text-xl">@</span>
        <Block rows={bEff[0]} cols={bEff[1]} color={COLOR.j} caption={`${bName} ${pyShape(bEff)}`} />
        <span className="text-xl">=</span>
        {check.ok ? (
          <Block
            rows={check.result[0]}
            cols={check.result[1]}
            color={OUTER}
            caption={`C ${pyShape(check.result)}`}
          />
        ) : (
          <span className="rounded-md border-2 border-bad px-2 py-1 text-sm font-semibold text-bad">
            ✗ error
          </span>
        )}
      </div>

      <Readout>
        <span className="block font-mono">
          ({a[0]}, <Tag color={INNER}>{a[1]}</Tag>) @ (<Tag color={INNER}>{bEff[0]}</Tag>, {bEff[1]})
        </span>
        {check.ok ? (
          <>
            A has <Tag color={INNER}>{a[1]} columns</Tag> and {bName} has{' '}
            <Tag color={INNER}>{bEff[0]} rows</Tag>: the inner sizes match. The result takes the
            outer sizes, <Tag color={OUTER}>{a[0]} rows</Tag> from A and{' '}
            <Tag color={OUTER}>{bEff[1]} columns</Tag> from {bName}: shape{' '}
            {pyShape(check.result)}.
          </>
        ) : (
          <>
            A has <Tag color={INNER}>{a[1]} columns</Tag> but {bName} has{' '}
            <Tag color={INNER}>{bEff[0]} rows</Tag>. Each entry of the result pairs a row of A
            with a column of {bName}, entry by entry, and those have different lengths ({a[1]}{' '}
            and {bEff[0]}), so NumPy refuses.
          </>
        )}
      </Readout>

      <div className="mt-4">
        <NumpySnippet code={code} output={check.ok ? pyShape(check.result) : check.error} />
      </div>
    </div>
  )
}
