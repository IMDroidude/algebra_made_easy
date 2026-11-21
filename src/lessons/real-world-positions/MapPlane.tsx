import { Coordinates, Line, Mafs, MovablePoint, Point, Polygon } from 'mafs'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Arrow } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { BoundsContext, PADDING, visibleBounds } from '../../lib/planeBounds'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { toLocal } from './positions'
import type { Frame } from './positions'

/**
 * A local variant of the shared Plane for maps: no fixed axes and no world
 * numbers (the whole point of this lesson is that *you* choose where the axes
 * go), a grid with any spacing, and a height that follows the map's shape so
 * a wide room does not leave empty bands on a phone.
 */
export function MapPlane({
  children,
  x,
  y,
  grid = 1,
  gridY,
  stretch = false,
  maxHeight = 420,
  height: fixedHeight,
  axes = false,
  label,
}: {
  children?: ReactNode
  x: [number, number]
  y: [number, number]
  /** Grid spacing; false for no grid. */
  grid?: number | false
  gridY?: number | false
  stretch?: boolean
  maxHeight?: number
  height?: number
  /** Draw the usual axes with numbers (for data charts, where the axes are fixed). */
  axes?: boolean
  label: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    setWidth(el.clientWidth)
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const ratio = (y[1] - y[0] + 2 * PADDING) / (x[1] - x[0] + 2 * PADDING)
  const height =
    fixedHeight ?? (width > 0 ? Math.round(Math.min(maxHeight, Math.max(200, width * ratio))) : 320)
  const bounds = width > 0 ? visibleBounds(x, y, width, height, stretch) : null
  return (
    <div ref={box} role="group" aria-label={label} className="overflow-hidden rounded-xl border border-line">
      <BoundsContext.Provider value={bounds}>
        <Mafs
          height={height}
          pan={false}
          zoom={false}
          viewBox={{ x, y, padding: PADDING }}
          preserveAspectRatio={stretch ? false : 'contain'}
        >
          <Coordinates.Cartesian
            subdivisions={false}
            xAxis={{ axis: axes, labels: axes ? (n) => String(n) : false, lines: grid }}
            yAxis={{ axis: axes, labels: axes ? (n) => String(n) : false, lines: gridY ?? grid }}
          />
          {children}
        </Mafs>
      </BoundsContext.Provider>
    </div>
  )
}

/** Walls of a rectangular room from (0, 0) to (w, h). */
export function Walls({ w, h }: { w: number; h: number }) {
  return (
    <Polygon
      points={[
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ]}
      color={COLOR.ghost}
      fillOpacity={0.06}
      strokeStyle="solid"
      weight={3}
    />
  )
}

/** A gap in a wall (door or window), drawn as a thick coloured segment with a name. */
export function WallFeature({
  from,
  to,
  name,
  attach,
  labelAt,
}: {
  from: Vec2
  to: Vec2
  name: string
  attach: 'n' | 's' | 'e' | 'w' | 'nw' | 'sw'
  /** Where the name is anchored; the middle of the gap by default. */
  labelAt?: Vec2
}) {
  const mid: Vec2 = labelAt ?? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
  return (
    <>
      <Line.Segment point1={from} point2={to} color={COLOR.j} weight={7} opacity={0.55} />
      <PlaneLabel x={mid[0]} y={mid[1]} attach={attach} distance={10} size={13} color="var(--muted)">
        {name}
      </PlaneLabel>
    </>
  )
}

/** A thing in the room: a dot, its name, and its coordinates in the chosen frame. */
export function ThingMark({
  at,
  name,
  frame,
  color = COLOR.v,
  attach = 'e',
}: {
  at: Vec2
  name: string
  frame: Frame
  color?: string
  attach?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
}) {
  const [a, b] = toLocal(at, frame)
  return (
    <>
      <Point x={at[0]} y={at[1]} color={color} />
      <PlaneLabel x={at[0]} y={at[1]} attach={attach} distance={12} size={15} color={color}>
        {`${name} (${fmt(a)}, ${fmt(b)})`}
      </PlaneLabel>
    </>
  )
}

/**
 * The learner's axes: two lines through the chosen origin across the room,
 * arrows showing which way is positive, and tick numbers every metre.
 */
export function FrameAxes({ frame, w, h }: { frame: Frame; w: number; h: number }) {
  const [ox, oy] = frame.origin
  const up = frame.yDir === 'up' ? 1 : -1
  const ticks: ReactNode[] = []
  // Numbers sit outside the room's edge only when there is no room for them inside.
  const xSide = oy < 0.6 ? 'n' : 's'
  const ySide = ox < 0.6 ? 'e' : 'w'
  for (let k = Math.ceil(-ox); k <= Math.floor(w - ox); k++) {
    if (k === 0) continue
    const at: Vec2 = [ox + k, oy]
    ticks.push(
      <PlaneLabel key={`x${k}`} x={at[0]} y={at[1]} attach={xSide} distance={6} size={11} color={COLOR.i}>
        {fmt(toLocal(at, frame)[0])}
      </PlaneLabel>,
    )
  }
  for (let k = Math.ceil(-oy); k <= Math.floor(h - oy); k++) {
    if (k === 0) continue
    const at: Vec2 = [ox, oy + k]
    ticks.push(
      <PlaneLabel key={`y${k}`} x={at[0]} y={at[1]} attach={ySide} distance={6} size={11} color={COLOR.j}>
        {fmt(toLocal(at, frame)[1])}
      </PlaneLabel>,
    )
  }
  // The arrow points into the room where there is space for it.
  const xLen = ox <= w - 1.2 ? 1.2 : -1.2
  const yLen = (oy + up * 1.2 <= h && oy + up * 1.2 >= 0 ? 1.2 : -1.2) * up
  const xTip: Vec2 = [ox + xLen, oy]
  const yTip: Vec2 = [ox, oy + yLen]
  return (
    <>
      <Line.Segment point1={[0, oy]} point2={[w, oy]} color={COLOR.i} weight={1.5} opacity={0.6} />
      <Line.Segment point1={[ox, 0]} point2={[ox, h]} color={COLOR.j} weight={1.5} opacity={0.6} />
      {ticks}
      {xLen > 0 && <Arrow tail={frame.origin} tip={xTip} color={COLOR.i} label="x" showCoords={false} />}
      {(yLen > 0) === (up > 0) && (
        <Arrow tail={frame.origin} tip={yTip} color={COLOR.j} label="y" showCoords={false} labelDistance={10} />
      )}
    </>
  )
}

/** The walk from the origin to a place: across first (x), then up or down (y). */
export function Walk({ from, to }: { from: Vec2; to: Vec2 }) {
  const corner: Vec2 = [to[0], from[1]]
  return (
    <>
      <Line.Segment point1={from} point2={corner} color={COLOR.i} weight={3} style="dashed" />
      <Line.Segment point1={corner} point2={to} color={COLOR.j} weight={3} style="dashed" />
    </>
  )
}

/** The origin marker. Draggable (and arrow-key movable) when `onChange` is given. */
export function OriginMark({
  at,
  onChange,
  constrain,
}: {
  at: Vec2
  onChange?: (next: Vec2) => void
  constrain?: (p: Vec2) => Vec2
}) {
  return (
    <>
      {onChange ? (
        <MovablePoint point={at} onMove={onChange} constrain={constrain} color={COLOR.result} />
      ) : (
        <Point x={at[0]} y={at[1]} color={COLOR.result} />
      )}
      <PlaneLabel
        x={at[0]}
        y={at[1]}
        attach={`${at[1] < 0.6 ? 's' : 'n'}${at[0] < 0.6 ? 'w' : 'e'}` as 'ne'}
        distance={onChange ? 16 : 10}
        size={15}
        color={COLOR.result}
      >
        origin
      </PlaneLabel>
    </>
  )
}
