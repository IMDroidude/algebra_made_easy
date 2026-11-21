import { Polygon } from 'mafs'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Button, Readout, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { add, norm, scale, sub } from '../../linalg'
import { cleanZero2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { Slider } from '../../components/Slider'
import { OPS, scaleEffect } from './ops'
import type { Op } from './ops'

/**
 * Plane, controls and readout for the three vector operations. The state lives
 * in the parent so other steps can show the same numbers.
 */
export function VectorOps({
  op,
  setOp,
  u,
  setU,
  v,
  setV,
  k,
  setK,
  children,
}: {
  op: Op
  setOp: (next: Op) => void
  u: Vec2
  setU: (next: Vec2) => void
  v: Vec2
  setV: (next: Vec2) => void
  k: number
  setK: (next: number) => void
  /** Extra things to draw on the plane, such as a target marker. */
  children?: ReactNode
}) {
  const [parallelogram, setParallelogram] = useState(false)
  const [fromOrigin, setFromOrigin] = useState(false)

  const sum = add(u, v)
  const diff = sub(u, v)
  const ku = scale(u, k)

  const label =
    op === 'add'
      ? 'Two draggable vectors u and v, and their sum drawn tip to tail'
      : op === 'subtract'
        ? 'Two draggable vectors u and v, and u minus v drawn from the tip of v to the tip of u'
        : 'A draggable vector u and the scaled vector k times u'

  return (
    <>
      <div role="group" aria-label="Operation" className="mb-3 flex flex-wrap gap-2">
        {OPS.map((o) => (
          <Button
            key={o.id}
            variant={op === o.id ? 'primary' : 'secondary'}
            aria-pressed={op === o.id}
            onClick={() => setOp(o.id)}
          >
            {o.label}
          </Button>
        ))}
      </div>
      <Plane label={label}>
        {children}
        {op === 'add' && (
          <>
            {parallelogram && (
              <>
                <Polygon points={[[0, 0], u, sum, v]} color={COLOR.result} fillOpacity={0.12} strokeOpacity={0} />
                <Arrow tail={v} tip={sum} color={COLOR.i} dashed opacity={0.6} weight={2} />
              </>
            )}
            <Arrow tail={u} tip={sum} color={COLOR.j} dashed opacity={0.7} weight={2} />
            <Arrow tip={sum} color={COLOR.result} label="u + v" />
          </>
        )}
        {op === 'subtract' && (
          <>
            {fromOrigin && (
              <Arrow tip={diff} color={COLOR.result} dashed opacity={0.6} weight={2} label="u − v" />
            )}
            <Arrow tail={v} tip={u} color={COLOR.result} label="u − v" labelAt="middle" />
          </>
        )}
        {op === 'scale' && (
          <Arrow tip={ku} color={COLOR.result} label={`${fmt(k)}u`} weight={4} opacity={0.75} />
        )}
        <DraggableArrow value={u} onChange={(p) => setU(cleanZero2(p))} color={COLOR.i} label="u" />
        {op !== 'scale' && (
          <DraggableArrow value={v} onChange={(p) => setV(cleanZero2(p))} color={COLOR.j} label="v" />
        )}
      </Plane>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {op === 'add' && (
          <Toggle checked={parallelogram} onChange={setParallelogram}>
            Show the parallelogram (v first, then u)
          </Toggle>
        )}
        {op === 'subtract' && (
          <Toggle checked={fromOrigin} onChange={setFromOrigin}>
            Also draw u − v from the origin
          </Toggle>
        )}
        {op === 'scale' && (
          <div className="w-full max-w-sm">
            <Slider name="k" value={k} onChange={setK} accent={COLOR.result} />
          </div>
        )}
      </div>
      <Readout>
        {op === 'add' && (
          <>
            <Tag color={COLOR.i}>u</Tag> = {fmtVec(u)}, <Tag color={COLOR.j}>v</Tag> = {fmtVec(v)}.{' '}
            <Tag color={COLOR.result}>u + v</Tag> = {fmtVec(sum)}. The dashed copy of v starts at
            the tip of u: walk along u, then along v, and you arrive at the sum.
            {parallelogram && ' Walking v first and then u (the other dashed side) reaches the same corner.'}
          </>
        )}
        {op === 'subtract' && (
          <>
            <Tag color={COLOR.i}>u</Tag> = {fmtVec(u)}, <Tag color={COLOR.j}>v</Tag> = {fmtVec(v)}.{' '}
            <Tag color={COLOR.result}>u − v</Tag> = {fmtVec(diff)}, drawn from the tip of v to the
            tip of u, because v + (u − v) = u.
            {fromOrigin && ' The dashed copy is the same arrow, moved to start at the origin.'}
          </>
        )}
        {op === 'scale' && (
          <>
            <Tag color={COLOR.i}>u</Tag> = {fmtVec(u)}, length {fmt(norm(u))}. Scalar k = {fmt(k)}.{' '}
            <Tag color={COLOR.result}>{fmt(k)}u</Tag> = {fmtVec(ku)}, length {fmt(norm(ku))}.{' '}
            {scaleEffect(k)}
          </>
        )}
      </Readout>
    </>
  )
}
