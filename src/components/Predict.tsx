import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './ui'

export type PredictOption = {
  id: string
  label: ReactNode
  correct: boolean
  /** Shown after confirming this option: why it is right, or which misconception it reflects. */
  explain: ReactNode
}

/**
 * Predict-before-you-see. The learner picks an answer and confirms it; only
 * then is the result revealed (via `onReveal`) and the choice explained.
 */
export function Predict({
  question,
  options,
  onReveal,
  onRetry,
}: {
  question: ReactNode
  options: PredictOption[]
  onReveal?: () => void
  onRetry?: () => void
}) {
  const name = useId()
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const chosen = options.find((o) => o.id === selected)

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <fieldset disabled={confirmed} className="m-0 border-0 p-0">
        <legend className="mb-3 font-medium">{question}</legend>
        <div className="grid gap-2">
          {options.map((o) => {
            const isChosen = o.id === selected
            const tone =
              confirmed && isChosen
                ? o.correct
                  ? 'border-ok bg-ok-bg'
                  : 'border-bad bg-bad-bg'
                : isChosen
                  ? 'border-accent'
                  : 'border-line'
            return (
              <label
                key={o.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 px-3 py-2 ${tone}`}
              >
                <input
                  type="radio"
                  name={name}
                  className="mt-1.5"
                  checked={isChosen}
                  onChange={() => setSelected(o.id)}
                />
                <span>{o.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {!confirmed && (
        <div className="mt-4">
          <Button
            disabled={!chosen}
            onClick={() => {
              setConfirmed(true)
              onReveal?.()
            }}
          >
            Lock in my prediction
          </Button>
        </div>
      )}

      {confirmed && chosen && (
        <div role="status" className="mt-4">
          <p className={`m-0 font-semibold ${chosen.correct ? 'text-ok' : 'text-bad'}`}>
            {chosen.correct ? '✓ Correct.' : '✗ Not quite.'}
          </p>
          <div className="mt-1">{chosen.explain}</div>
          {!chosen.correct && (
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmed(false)
                  setSelected(null)
                  onRetry?.()
                }}
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
