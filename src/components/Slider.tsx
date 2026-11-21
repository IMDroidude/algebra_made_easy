import { useId } from 'react'
import { fmt } from '../lib/format'

/** A labelled range slider for one scalar. Works with arrow keys, Home and End. */
export function Slider({
  name,
  value,
  onChange,
  min = -3,
  max = 3,
  step = 0.5,
  accent,
  disabled = false,
}: {
  /** What the slider sets, e.g. "k" or "a". Also used as its accessible name. */
  name: string
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  accent?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className={`min-w-0 ${disabled ? 'opacity-45' : ''}`}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium">
        <span>
          <span className="font-display text-lg italic" style={accent ? { color: accent } : undefined}>
            {name}
          </span>{' '}
          = <span className="font-mono">{fmt(value)}</span>
        </span>
        <span className="text-xs text-muted">
          {fmt(min)} to {fmt(max)}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={name}
        aria-valuetext={`${name} = ${fmt(value)}`}
        onChange={(e) => onChange(Number(e.target.value) + 0)}
        className="w-full"
        style={accent ? { accentColor: accent } : undefined}
      />
    </div>
  )
}
