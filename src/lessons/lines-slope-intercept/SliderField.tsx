import type { ReactNode } from 'react'
import { NumberField } from '../../components/NumberField'
import { snapToStep } from './lineMath'

/**
 * A slider and a number box bound to the same value. Typed values are rounded
 * to the slider's step, so the picture, the equation and the NumPy code always
 * hold the same number.
 */
export function SliderField({
  symbol,
  label,
  value,
  onChange,
  min,
  max,
  step,
  accent,
}: {
  /** Short name shown in front of the controls, e.g. "m". */
  symbol: ReactNode
  /** Accessible name, e.g. "slope m". */
  label: string
  value: number
  onChange: (next: number) => void
  min: number
  max: number
  step: number
  accent: string
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, snapToStep(n, step))))
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 shrink-0 font-display text-2xl italic" style={{ color: accent }} aria-hidden="true">
        {symbol}
      </span>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="min-w-0 flex-1"
        style={{ accentColor: accent }}
      />
      <NumberField label={label} value={value} onChange={set} step={step} min={min} max={max} accent={accent} />
    </div>
  )
}
