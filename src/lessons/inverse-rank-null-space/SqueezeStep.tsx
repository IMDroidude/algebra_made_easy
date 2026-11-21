import { useState } from 'react'
import { Arrow, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtDet, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { useTween } from '../../lib/useTween'
import { columns2, det2, inverse2 } from '../../linalg'
import { rank2, thereAndBack2 } from '../../linalg/systems'
import { SQUEEZE_DETS, squeezeMatrix } from './data'
import { FShape } from './FShape'
import { RANK_SHAPE, fmtFixed, texMat2 } from './text'

export function SqueezeStep() {
  const [k, setK] = useState(0)
  const [dir, setDir] = useState<'undo' | 'redo'>('undo')
  const tween = useTween(1800)

  const A = squeezeMatrix(SQUEEZE_DETS[k])
  const det = det2(A)
  const inv = inverse2(A)
  const rank = rank2(A)
  // Phase 1 is "A applied", 2 is "undone". Undo plays 1 → 2, redo plays 0 → 1.
  const phase = dir === 'undo' ? 1 + tween.t : tween.t
  const shown = thereAndBack2(A, phase) ?? A
  const undone = dir === 'undo' && tween.t === 1
  const [iHat, jHat] = columns2(A)

  const pick = (next: number) => {
    setK(next)
    setDir('undo')
    tween.reset(0)
  }

  return (
    <Step
      n={2}
      kind="Manipulate"
      title="Squeeze the plane until the undo breaks"
      visual={
        <>
          <Plane extent={4} label="The F after a matrix whose second column is squeezed towards the first">
            <FShape matrix={shown} />
            {!undone && (
              <>
                <Arrow tip={iHat} color={COLOR.i} label="î" />
                <Arrow tip={jHat} color={COLOR.j} label="ĵ" />
              </>
            )}
          </Plane>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Squeeze ĵ towards the line of î (determinant {fmtDet(det)})
              <input
                type="range"
                min={0}
                max={SQUEEZE_DETS.length - 1}
                step={1}
                value={k}
                aria-valuetext={`determinant ${fmtDet(det)}`}
                onChange={(e) => pick(Number(e.target.value))}
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                disabled={!inv}
                onClick={() => {
                  setDir(undone ? 'redo' : 'undo')
                  tween.play()
                }}
              >
                {undone ? 'Apply A again' : 'Undo with A⁻¹'}
              </Button>
              {!inv && <span className="text-sm text-muted">No undo: A has no inverse.</span>}
            </div>
          </div>
          <Tex block>
            {inv
              ? String.raw`A = ${texMat2(A, 8)} \qquad A^{-1} = ${texMat2(inv)}`
              : String.raw`A = ${texMat2(A, 8)} \qquad A^{-1}\ \text{does not exist}`}
          </Tex>
          <Readout>
            <Tag color={COLOR.i}>î</Tag> is at {fmtVec(iHat)}, <Tag color={COLOR.j}>ĵ</Tag> is at{' '}
            ({fmt(jHat[0])}, {fmtFixed(jHat[1])}). Determinant {fmtDet(det)}
            {inv ? (
              <>
                : A multiplies areas by {fmtFixed(det)}, so the undo has to multiply them by{' '}
                {fmt(1 / det)}. Outputs still fill {RANK_SHAPE[rank]} (rank {rank}).
                {undone && ' Undone: the F is back on its dashed outline.'}
              </>
            ) : (
              <>
                {det === 0 ? '' : ', treated as singular'}. The exact value is {fmtFixed(det)}
                {det === 0 ? '' : ', below the 0.000001 this app counts as zero'}. Every output lies on{' '}
                {RANK_SHAPE[rank]} (rank {rank}), so the undo is not available.
              </>
            )}
          </Readout>
        </>
      }
    >
      <p>
        The undo does not always exist. Use the slider to push <Tag color={COLOR.j}>ĵ</Tag> down
        towards the line that <Tag color={COLOR.i}>î</Tag> lies on, and press{' '}
        <strong>Undo</strong> at each stop.
      </p>
      <p>
        Watch the <strong>determinant</strong>: it is how much the matrix scales areas. As it
        shrinks, the <Tag color={COLOR.v}>F</Tag> gets thinner, and the entries of A⁻¹ get bigger.
        To undo a squash by a factor 1000, the inverse has to stretch by a factor 1000.
      </p>
      <p>
        At the last stops the F is flattened onto a line. There is nothing left to stretch back: two
        points that were apart now sit on top of each other, and no matrix can pull them apart
        again. The undo button switches off.
      </p>
      <p>
        One stop is honest about computers: the determinant is 0.0000001, not exactly 0. Floats
        carry tiny rounding errors, so any program has to choose a cut-off below which it treats a
        number as zero. This app uses 0.000001, so it shows &ldquo;≈&nbsp;0, treated as singular&rdquo;.
        A matrix with no inverse is called <strong>singular</strong>.
      </p>
    </Step>
  )
}
