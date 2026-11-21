import { Circle, Line, Plot, Text } from 'mafs'
import { Arrow, DraggablePoint, Plane } from '../../components/Plane'
import { Button, Readout, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { apply2 } from '../../linalg'
import {
  angleOf,
  eigen2,
  eigenAngles,
  eigenPairs,
  lineTest,
  nextEigenAngle,
  snapToEigenAngle,
  unitAt,
} from '../../linalg/eigen'
import type { Mat2, Vec2 } from '../../linalg'
import { describeMatrix, describeV, extentFor } from './describe'
import { useSweep } from './useSweep'

/**
 * The plane for sweeping a unit vector v around and watching Av. v can be
 * dragged (it stays on the unit circle), moved with the arrow keys, set with
 * the angle slider, swept round automatically, or jumped to the next eigen
 * direction.
 */
export function SweepPlane({
  matrix,
  angle,
  onAngle,
  label,
  showEigen,
  onShowEigen,
  showTrace,
  onShowTrace,
}: {
  matrix: Mat2
  angle: number
  onAngle: (deg: number) => void
  label: string
  showEigen: boolean
  onShowEigen: (on: boolean) => void
  showTrace: boolean
  onShowTrace: (on: boolean) => void
}) {
  const e = eigen2(matrix)
  const stops = eigenAngles(e)
  const sweep = useSweep(angle, onAngle, stops)
  const extent = extentFor(matrix)
  const v = unitAt(angle)
  const t = lineTest(matrix, v)
  const hit = t.kept
  const near = !t.collapsed && Math.hypot(t.Av[0] - v[0], t.Av[1] - v[1]) < 0.45
  const lineEnd: Vec2 = [v[0] * extent * 2, v[1] * extent * 2]

  // Dragging: keep v on the unit circle, and let it click onto an eigen line when close.
  const snapToCircle = (p: Vec2): Vec2 => {
    if (Math.hypot(p[0], p[1]) < 1e-9) return v
    return unitAt(snapToEigenAngle(e, angleOf(p), 3))
  }
  const next = nextEigenAngle(e, angle)

  return (
    <>
      <Plane label={label} extent={extent}>
        <Circle center={[0, 0]} radius={1} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
        {showTrace && (
          <Plot.Parametric
            xy={(s) => apply2(matrix, [Math.cos(s), Math.sin(s)])}
            domain={[0, 2 * Math.PI]}
            color={COLOR.result}
            opacity={0.5}
            weight={1.5}
          />
        )}
        {showEigen &&
          eigenPairs(e).map((p, k) => (
            <g key={k}>
              <Line.ThroughPoints
                point1={[0, 0]}
                point2={p.vector}
                color={COLOR.grid}
                weight={2}
                opacity={0.7}
                style="dashed"
              />
              <Text
                x={p.vector[0] * extent * 0.8}
                y={p.vector[1] * extent * 0.8}
                attach={p.vector[0] * p.vector[1] >= 0 ? 'se' : 'ne'}
                size={14}
                color={COLOR.grid}
              >
                λ = {fmt(p.value)}
              </Text>
            </g>
          ))}
        {/* v's own line: Av is on it exactly when v is an eigenvector. */}
        <Line.Segment
          point1={[-lineEnd[0], -lineEnd[1]]}
          point2={lineEnd}
          color={hit ? COLOR.result : COLOR.ghost}
          opacity={hit ? 0.8 : 0.5}
          weight={hit ? 2.5 : 1}
        />
        {!t.collapsed && (
          <Arrow tip={t.Av} color={COLOR.result} label={hit ? `Av = ${fmt(t.factor ?? 0)}v` : 'Av'} weight={hit ? 5 : 3} />
        )}
        {/* When Av sits on top of v, Av's label already names v. */}
        <Arrow tip={v} color={COLOR.v} label={near ? undefined : 'v'} labelDistance={22} showCoords={false} />
        <DraggablePoint value={v} onChange={(p) => onAngle(angleOf(p))} color={COLOR.v} snap={snapToCircle} />
      </Plane>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          Angle of <Tag color={COLOR.v}>v</Tag>
          <input
            type="range"
            min={0}
            max={359}
            step={1}
            value={Math.round(angle) % 360}
            onChange={(ev) => onAngle(snapToEigenAngle(e, Number(ev.target.value), 1))}
            aria-valuetext={`${fmt(angle, 1)} degrees`}
            className="w-36"
          />
          <span className="w-12 font-mono tabular-nums">{fmt(angle, 1)}°</span>
        </label>
        <Button variant="secondary" onClick={sweep.running ? sweep.stop : sweep.start}>
          {sweep.running ? 'Stop' : 'Sweep v around'}
        </Button>
        <Button
          variant="secondary"
          disabled={next === null || sweep.running}
          onClick={() => next !== null && onAngle(next)}
          title={next === null ? 'This matrix has no single eigen line to jump to' : undefined}
        >
          Jump to next eigenvector
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
        <Toggle checked={showEigen} onChange={onShowEigen}>
          Show eigen directions
        </Toggle>
        <Toggle checked={showTrace} onChange={onShowTrace}>
          Trace where Av goes as v sweeps round
        </Toggle>
      </div>
      <Readout>
        <span className="block">
          <Tag color={COLOR.v}>v</Tag> = {fmtVec(v)} at {fmt(angle, 1)}°. {describeV(matrix, angle)}
        </span>
        {showEigen && <span className="mt-1 block">{describeMatrix(matrix)}</span>}
        {showTrace && (
          <span className="mt-1 block">
            The green curve is every Av as v goes once round the unit circle (dashed).
          </span>
        )}
      </Readout>
    </>
  )
}
