import { Line, Polygon } from 'mafs'
import { CoordPoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Button, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { approxEqualVec } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { MAX_PINS, pinName } from './pins'
import { pointTag } from './plane'

const PIN = COLOR.result

/** Pinned points drawn on the plane, lettered A, B, C…, optionally joined into a shape. */
export function PinsOnPlane({ pins, connect }: { pins: Vec2[]; connect: boolean }) {
  return (
    <>
      {connect && pins.length >= 3 && (
        <Polygon points={pins} color={PIN} fillOpacity={0.08} strokeStyle="dashed" weight={2} />
      )}
      {connect && pins.length === 2 && (
        <Line.Segment point1={pins[0]} point2={pins[1]} color={PIN} style="dashed" weight={2} />
      )}
      {pins.map((q, i) => (
        <g key={pinName(i)}>
          <CoordPoint at={q} color={PIN} />
          <PlaneLabel x={q[0]} y={q[1]} attach="sw" distance={8} size={15} color={PIN}>
            {pinName(i)}
          </PlaneLabel>
        </g>
      ))}
    </>
  )
}

/** Controls and the table of pinned points, under the Step 2 plane. */
export function PinControls({
  p,
  pins,
  setPins,
  connect,
  setConnect,
  onPin,
}: {
  p: Vec2
  pins: Vec2[]
  setPins: (next: Vec2[]) => void
  connect: boolean
  setConnect: (next: boolean) => void
  onPin: () => void
}) {
  const pinned = pins.some((q) => approxEqualVec(q, p))
  const full = pins.length >= MAX_PINS
  return (
    <div className="mt-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onPin} disabled={pinned || full}>
          {full ? `${MAX_PINS} pins is the limit` : `Pin ${pinName(pins.length)} at ${fmtVec(p)}`}
        </Button>
        <Toggle checked={connect} onChange={setConnect}>
          Join the pins in order
        </Toggle>
        {pins.length > 0 && (
          <Button variant="secondary" onClick={() => setPins([])}>
            Clear pins
          </Button>
        )}
      </div>
      {pins.length === 0 ? (
        <p className="m-0 mt-2 text-muted">
          Move P, pin it, move again, pin again. Try the corners of a rectangle such as (−4, −2),
          (4, −2), (4, 4), (−4, 4).
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">Pinned points</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-1 pr-2 font-semibold">Point</th>
                <th className="py-1 pr-2 font-semibold">x</th>
                <th className="py-1 pr-2 font-semibold">y</th>
                <th className="py-1 font-semibold">Where</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((q, i) => (
                <tr key={pinName(i)} className="border-b border-line">
                  <td className="py-1 pr-2 font-semibold" style={{ color: PIN }}>
                    {pinName(i)}
                  </td>
                  <td className="py-1 pr-2 font-mono">{fmt(q[0])}</td>
                  <td className="py-1 pr-2 font-mono">{fmt(q[1])}</td>
                  <td className="py-1">{pointTag(q)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
