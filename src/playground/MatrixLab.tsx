import { useState } from 'react'
import { MatrixInput } from '../components/MatrixInput'
import { NumpySnippet } from '../components/NumpySnippet'
import { Arrow, DraggableArrow, Plane, TransformedGrid } from '../components/Plane'
import { Button, Readout, Tag } from '../components/ui'
import { asTyped2, fmt, fmtDet, fmtVec, isInteger, numpyMat2, numpyPrint, numpyVec } from '../lib/format'
import { COLOR } from '../lib/palette'
import { useTween } from '../lib/useTween'
import {
  IDENTITY2,
  apply2,
  columns2,
  det2,
  fromColumns2,
  inverse2,
  lerp2,
  rotation2,
} from '../linalg'
import type { Mat2, Vec2 } from '../linalg'

const PRESETS: { label: string; matrix: Mat2 }[] = [
  { label: 'Identity', matrix: IDENTITY2 },
  { label: 'Stretch x ×2', matrix: [[2, 0], [0, 1]] },
  { label: 'Stretch y ×2', matrix: [[1, 0], [0, 2]] },
  { label: 'Rotate 90°', matrix: [[0, -1], [1, 0]] },
  { label: 'Rotate 45°', matrix: rotation2(45) },
  { label: 'Reflect in x-axis', matrix: [[1, 0], [0, -1]] },
  { label: 'Shear', matrix: [[1, 1], [0, 1]] },
  { label: 'Project onto x-axis', matrix: [[1, 0], [0, 0]] },
  { label: 'Singular', matrix: [[1, 2], [0.5, 1]] },
]

export function MatrixLab() {
  const [m, setM] = useState<Mat2>([
    [1, 1],
    [0, 1],
  ])
  const [v, setV] = useState<Vec2>([1, 2])
  const tween = useTween(1200, 1)

  const animating = tween.t < 1
  const shown = lerp2(IDENTITY2, m, tween.t)
  const [iHat, jHat] = columns2(shown)
  const Av = apply2(shown, v)
  const det = det2(m)
  const inverse = inverse2(m)

  const load = (next: Mat2) => {
    setM(next)
    tween.play()
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 [&>*]:min-w-0">
      <div>
        <Plane height={440} label="A plane transformed by the matrix A, with a draggable vector v">
          <TransformedGrid matrix={shown} color={COLOR.grid} />
          <Arrow tip={Av} color={COLOR.v} label="Av" />
          {animating ? (
            <>
              <Arrow tip={v} color={COLOR.v} label="v" dashed opacity={0.55} weight={2} />
              <Arrow tip={iHat} color={COLOR.i} label="î" />
              <Arrow tip={jHat} color={COLOR.j} label="ĵ" />
            </>
          ) : (
            <>
              <DraggableArrow value={v} onChange={setV} color={COLOR.ghost} label="v" />
              <DraggableArrow
                value={iHat}
                onChange={(next) => setM(fromColumns2(next, jHat))}
                color={COLOR.i}
                label="î"
              />
              <DraggableArrow
                value={jHat}
                onChange={(next) => setM(fromColumns2(iHat, next))}
                color={COLOR.j}
                label="ĵ"
              />
            </>
          )}
        </Plane>
        <Readout>
          <Tag color={COLOR.i}>î</Tag> lands at {fmtVec(columns2(m)[0])},{' '}
          <Tag color={COLOR.j}>ĵ</Tag> lands at {fmtVec(columns2(m)[1])}. v = {fmtVec(v)} is carried
          to <Tag color={COLOR.v}>Av</Tag> = {fmtVec(apply2(m, v))}.
          <span className="mt-1 block">
            Determinant {fmtDet(det)}:{' '}
            {inverse === null
              ? 'treated as singular. The plane is squashed onto a line or a point, so there is no inverse.'
              : `areas are multiplied by ${fmt(Math.abs(det))}${det < 0 ? ' and the plane is flipped over' : ''}.`}
          </span>
          {inverse !== null && (
            <span className="mt-1 block">
              Inverse (the matrix that undoes A): [[{fmt(inverse[0][0])}, {fmt(inverse[0][1])}], [
              {fmt(inverse[1][0])}, {fmt(inverse[1][1])}]]
            </span>
          )}
        </Readout>
      </div>

      <div>
        <h2 className="m-0 text-sm font-semibold tracking-wide text-muted uppercase">Presets</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button key={preset.label} variant="secondary" onClick={() => load(preset.matrix)}>
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <MatrixInput value={m} onChange={setM} />
          <Button onClick={tween.play}>Replay from identity</Button>
        </div>

        <p className="mt-5 max-w-[60ch]">
          The columns of <strong>A</strong> are where <Tag color={COLOR.i}>î</Tag> and{' '}
          <Tag color={COLOR.j}>ĵ</Tag> land. Drag those two arrows, type into the matrix, or pick a
          preset; drag <strong>v</strong> to see where any vector is carried.
        </p>

        <div className="mt-4">
          <NumpySnippet
            code={`import numpy as np\n\n${numpyMat2('A', m)}\n${numpyVec('v', v)}\n\nprint(A @ v)`}
            output={numpyPrint(apply2(asTyped2(m), v), isInteger(...m.flat(), ...v))}
          />
        </div>
      </div>
    </div>
  )
}
