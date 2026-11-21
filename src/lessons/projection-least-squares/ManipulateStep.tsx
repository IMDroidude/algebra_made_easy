import { useState } from 'react'
import { CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { fitLine, lineThrough, sumSquaredResiduals } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
import { DATA } from './data'
import { FitDrawing } from './FitDrawing'
import { lineText } from './text'

const HANDLE_X = [-4, 4] as const
/** Handles slide up and down only, in quarter steps, so the line stays a function of x. */
const onColumn = (x: number) => ([, y]: Vec2): Vec2 => [x, Math.max(-5, Math.min(5, Math.round(y * 4) / 4)) + 0]

export function ManipulateStep() {
  const [left, setLeft] = useState<Vec2>([HANDLE_X[0], 0])
  const [right, setRight] = useState<Vec2>([HANDLE_X[1], 0])
  const [showBest, setShowBest] = useState(false)

  const mine = lineThrough(left, right)!
  const best = fitLine(DATA)!
  const myError = sumSquaredResiduals(DATA, mine)
  const bestError = sumSquaredResiduals(DATA, best)
  const ratio = myError / bestError
  const scaleMax = Math.max(myError, bestError)

  return (
    <Step
      n={2}
      kind="Manipulate"
      title="Try to beat the best line"
      visual={
        <>
          <Plane label="Six data points and your own line, with the square of each residual drawn">
            {showBest && <FitDrawing points={[]} line={best} color={COLOR.result} dashed />}
            <FitDrawing points={DATA} line={mine} color={COLOR.i} squares />
            {DATA.map((p, k) => (
              <CoordPoint key={k} at={p} color={COLOR.v} />
            ))}
            <DraggablePoint value={left} onChange={setLeft} color={COLOR.i} snap={onColumn(HANDLE_X[0])} />
            <DraggablePoint value={right} onChange={setRight} color={COLOR.i} snap={onColumn(HANDLE_X[1])} />
          </Plane>
          <div className="mt-3">
            <Toggle checked={showBest} onChange={setShowBest}>
              Show the best line (dashed green)
            </Toggle>
          </div>
          <div className="mt-3 grid gap-2 text-sm" aria-hidden="true">
            {[
              { label: 'Your line', value: myError, color: COLOR.i },
              { label: 'Best line', value: bestError, color: COLOR.result },
            ].map((bar) => (
              <div key={bar.label} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-2">
                <span>{bar.label}</span>
                <div className="h-3 rounded bg-line">
                  <div
                    className="h-3 rounded"
                    style={{ width: `${(100 * bar.value) / scaleMax}%`, background: bar.color }}
                  />
                </div>
                <span className="text-right font-mono">{fmt(bar.value)}</span>
              </div>
            ))}
          </div>
          <Readout>
            <Tag color={COLOR.i}>Your line</Tag>: {lineText(mine)}, sum of squared residuals{' '}
            {fmt(myError)}. <Tag color={COLOR.result}>Best line</Tag>
            {showBest ? `: ${lineText(best)},` : ''} sum {fmt(bestError)}.{' '}
            {ratio < 1.005
              ? 'You have matched the best line.'
              : `Yours is ${fmt(ratio, 1)} times as large.`}
          </Readout>
        </>
      }
    >
      <p>
        Your turn. The <Tag color={COLOR.i}>orange line</Tag> is yours: drag its two handles at x =
        −4 and x = 4 up and down (or focus one and use the arrow keys).
      </p>
      <p>
        Each orange square sits on one residual, so its area is that residual squared. The number to
        beat is the <strong>total area of the squares</strong>, shown in the bars under the plane.
      </p>
      <p>
        Notice how the big squares dominate: halving a large residual removes far more area than
        halving a small one. Get as close to the best line as you can, then switch it on to compare.
      </p>
    </Step>
  )
}
