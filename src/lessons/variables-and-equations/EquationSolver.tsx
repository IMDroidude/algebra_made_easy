import { useState } from 'react'
import { NumberField } from '../../components/NumberField'
import { Button, Readout } from '../../components/ui'
import { fmt } from '../../lib/format'
import { BalanceScale } from './BalanceScale'
import { equationText, imbalance, isAllowed, isBalanced, isSolved, opLabel, replay, solve } from './equation'
import type { Equation, Move, Op, Target } from './equation'

const OPS: { op: Op; sign: string; name: string }[] = [
  { op: 'sub', sign: '−', name: 'Subtract' },
  { op: 'add', sign: '+', name: 'Add' },
  { op: 'div', sign: '÷', name: 'Divide' },
  { op: 'mul', sign: '×', name: 'Multiply' },
]

/**
 * The interactive balance: pick an operation and a number, then apply it to
 * both sides or (to see what goes wrong) to one side only. The list of moves
 * is owned by the caller so other steps can show it.
 */
export function EquationSolver({
  start,
  moves,
  onMovesChange,
  idPrefix,
}: {
  start: Equation
  moves: Move[]
  onMovesChange: (next: Move[]) => void
  /** Keeps the labels of two solvers on one page distinct. */
  idPrefix: string
}) {
  const [op, setOp] = useState<Op>('sub')
  const [n, setN] = useState(1)

  const xTrue = solve(start) ?? 0
  const steps = replay(start, moves)
  const current = steps[steps.length - 1]
  const diff = imbalance(current, xTrue)
  const solved = isSolved(current, xTrue)
  const allowed = isAllowed(op, n)

  const apply = (target: Target) => onMovesChange([...moves, { op, n, target }])

  return (
    <div>
      <BalanceScale
        equation={current}
        xTrue={xTrue}
        label={`Balance scale showing ${equationText(current)}`}
      />

      <div className="mt-4 grid gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`${idPrefix}: operation`}>
          <span className="text-sm text-muted">Operation:</span>
          {OPS.map((o) => (
            <Button
              key={o.op}
              variant={o.op === op ? 'primary' : 'secondary'}
              aria-pressed={o.op === op}
              onClick={() => setOp(o.op)}
            >
              <span aria-hidden="true">{o.sign} </span>
              {o.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Number:</span>
          <NumberField label={`${idPrefix}: amount`} value={n} onChange={setN} step={1} min={-50} max={50} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!allowed || solved} onClick={() => apply('both')}>
            {opLabel(op, n, 'both')}
          </Button>
          <Button variant="secondary" disabled={!allowed || solved} onClick={() => apply('left')} aria-label={opLabel(op, n, 'left')}>
            Left side only
          </Button>
          <Button variant="secondary" disabled={!allowed || solved} onClick={() => apply('right')} aria-label={opLabel(op, n, 'right')}>
            Right side only
          </Button>
        </div>
        {!allowed && (
          <p className="m-0 text-sm text-bad">
            {op === 'div'
              ? 'Dividing by 0 has no answer, so it is not a move you can make.'
              : 'Multiplying both sides by 0 turns any equation into 0 = 0: true, but x is gone.'}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={moves.length === 0} onClick={() => onMovesChange(moves.slice(0, -1))}>
            Undo
          </Button>
          <Button variant="secondary" disabled={moves.length === 0} onClick={() => onMovesChange([])}>
            Start again
          </Button>
        </div>
      </div>

      <Readout>
        <span className="block">
          Equation now: <strong>{equationText(current)}</strong>.{' '}
          {solved
            ? `Solved: x = ${fmt(xTrue)}, and the scale is level.`
            : isBalanced(current, xTrue)
              ? 'The scale is level.'
              : `The scale has tipped: the ${diff > 0 ? 'left' : 'right'} side is heavier. Undo the last move.`}
        </span>
        {moves.length > 0 && (
          <ol className="mt-2 mb-0 pl-5 text-muted">
            {moves.map((m, k) => (
              <li key={k}>
                {opLabel(m.op, m.n, m.target)} → {equationText(steps[k + 1])}
              </li>
            ))}
          </ol>
        )}
      </Readout>
    </div>
  )
}
