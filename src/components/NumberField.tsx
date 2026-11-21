import { useState } from 'react'
import { fmt } from '../lib/format'
import { approxEqual } from '../linalg'

function parse(text: string, min: number, max: number): number | null {
  if (text.trim() === '') return null
  const n = Number(text)
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

/**
 * A number box that can be typed in, stepped with its arrows, or nudged with
 * the up/down keys. While the text is not a valid number it is flagged and the
 * last valid value stays in effect.
 */
export function NumberField({
  value,
  onChange,
  label,
  step = 0.5,
  min = -9,
  max = 9,
  accent,
  emphasised = false,
}: {
  value: number
  onChange: (next: number) => void
  label: string
  step?: number
  min?: number
  max?: number
  /** Colour of the underline that ties this cell to an object on the plane. */
  accent?: string
  emphasised?: boolean
}) {
  const [text, setText] = useState(() => fmt(value, 3))
  const [seen, setSeen] = useState(value)

  // The value changed from outside (for example by dragging): show it, unless
  // the box already holds an equivalent number the user is still typing.
  if (value !== seen) {
    setSeen(value)
    const current = parse(text, min, max)
    if (current === null || !approxEqual(current, value)) setText(fmt(value, 3))
  }

  const invalid = parse(text, min, max) === null

  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={label}
      aria-invalid={invalid}
      title={invalid ? `Enter a number from ${min} to ${max}` : undefined}
      value={text}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        setText(e.target.value)
        const n = parse(e.target.value, min, max)
        if (n !== null) onChange(n)
      }}
      onBlur={() => {
        if (invalid) setText(fmt(value, 3))
      }}
      style={accent ? { borderBottomColor: accent } : undefined}
      className={[
        'w-[4.5rem] rounded-md border border-line border-b-[3px] bg-surface px-2 py-1.5 text-center font-mono text-base text-ink',
        invalid ? 'bg-bad-bg outline outline-2 outline-bad' : '',
        emphasised ? 'ring-2 ring-accent' : '',
      ].join(' ')}
    />
  )
}
