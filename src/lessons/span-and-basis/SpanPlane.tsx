import { Line } from 'mafs'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Arrow, DraggableArrow, Plane } from '../../components/Plane'
import { Readout, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { scale } from '../../linalg'
import { cleanZero2, combine2, spanKind2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { Slider } from '../../components/Slider'
import { spanSentence } from './spanText'
import { SpanLayer } from './SpanLayer'

/** Brackets around negatives so "a·u" reads well: (−1.5)·u. */
const coef = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x))

/**
 * The linear-combination widget: draggable u and v, sliders for a and b, the
 * walk a·u then b·v, and optionally every point the pair can reach.
 */
export function SpanPlane({
  u,
  setU,
  v,
  setV,
  a,
  setA,
  b,
  setB,
  useV = true,
  setUseV,
  showSpanAtStart = false,
  extra,
  extraReadout,
}: {
  u: Vec2
  setU: (next: Vec2) => void
  v: Vec2
  setV: (next: Vec2) => void
  a: number
  setA: (next: number) => void
  b: number
  setB: (next: number) => void
  useV?: boolean
  /** When given, a toggle lets the learner switch v off to see what u alone reaches. */
  setUseV?: (next: boolean) => void
  showSpanAtStart?: boolean
  /** Extra things to draw on the plane, such as a target. */
  extra?: ReactNode
  extraReadout?: ReactNode
}) {
  const [showSpan, setShowSpan] = useState(showSpanAtStart)
  const au = scale(u, a)
  const w = useV ? combine2(a, u, b, v) : au
  const kind = spanKind2(useV ? [u, v] : [u])

  return (
    <>
      <Plane
        label={
          useV
            ? 'Draggable vectors u and v; the point a times u plus b times v is built by walking a·u then b·v'
            : 'A draggable vector u; the point a times u'
        }
      >
        {showSpan && <SpanLayer u={u} v={useV ? v : undefined} />}
        {extra}
        <Line.Segment point1={[0, 0]} point2={au} color={COLOR.i} weight={8} opacity={0.35} />
        {useV && <Line.Segment point1={au} point2={w} color={COLOR.j} weight={8} opacity={0.35} />}
        <Arrow tip={w} color={COLOR.v} label={useV ? 'w' : 'a·u'} />
        <DraggableArrow value={u} onChange={(p) => setU(cleanZero2(p))} color={COLOR.i} label="u" />
        {useV && <DraggableArrow value={v} onChange={(p) => setV(cleanZero2(p))} color={COLOR.j} label="v" />}
      </Plane>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Slider name="a" value={a} onChange={setA} step={0.25} accent={COLOR.i} />
        <Slider name="b" value={b} onChange={setB} step={0.25} accent={COLOR.j} disabled={!useV} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Toggle checked={showSpan} onChange={setShowSpan}>
          Show every reachable point (the span)
        </Toggle>
        {setUseV && (
          <Toggle checked={!useV} onChange={(off) => setUseV(!off)}>
            Use u alone
          </Toggle>
        )}
      </div>
      <Readout>
        <Tag color={COLOR.i}>u</Tag> = {fmtVec(u)}
        {useV && (
          <>
            , <Tag color={COLOR.j}>v</Tag> = {fmtVec(v)}
          </>
        )}
        .{' '}
        {useV ? (
          <>
            <Tag color={COLOR.v}>w</Tag> = {coef(a)}·u + {coef(b)}·v = {fmtVec(au)} +{' '}
            {fmtVec(scale(v, b))} = {fmtVec(w)}.
          </>
        ) : (
          <>
            <Tag color={COLOR.v}>a·u</Tag> = {coef(a)}·u = {fmtVec(w)}.
          </>
        )}{' '}
        {spanSentence(kind, useV ? 2 : 1)}
        {extraReadout}
      </Readout>
    </>
  )
}
