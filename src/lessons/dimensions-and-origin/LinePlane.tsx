import { Line, Mafs, MovablePoint, Point } from 'mafs'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Arrow } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { BoundsContext, PADDING, visibleBounds } from '../../lib/planeBounds'
import { COLOR } from '../../lib/palette'
import { approxEqual, isZero } from '../../linalg'
import { LIMIT, describeNumber, labelEvery, numberOf, showsNumber, signed, snapOnLine } from './model'

const X: [number, number] = [-LIMIT - 0.5, LIMIT + 0.5]
const Y: [number, number] = [-1, 1]

/**
 * A number line (the "wire") whose numbers are measured from a movable origin.
 *
 * Local instead of the shared Plane because the tick numbers must follow the
 * origin: a tick at fixed `place` k shows k − origin. The shared Plane draws
 * Mafs axes numbered from the fixed centre, and its draggables show those
 * fixed coordinates on hover, which would contradict the lesson once the
 * origin moves. So this draws its own wire, ticks and numbers, and uses plain
 * Mafs MovablePoints (keyboard and drag) without the coordinate tooltip.
 */
export function LinePlane({
  label,
  place,
  origin,
  onPlace,
  onOrigin,
  ghostOrigin,
  startMark,
  showDistance = false,
  beadLabel = true,
  height = 170,
  children,
}: {
  label: string
  place: number
  origin: number
  onPlace?: (place: number) => void
  onOrigin?: (origin: number) => void
  /** Where the origin used to be: drawn faintly as "old origin". */
  ghostOrigin?: number
  /** A faint "start" mark at a fixed place (practice); hidden while the bead sits on it. */
  startMark?: number
  /** Arrow from the origin to the bead, labelled with distance and direction. */
  showDistance?: boolean
  beadLabel?: boolean
  height?: number
  children?: ReactNode
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
  const bounds = width > 0 ? visibleBounds(X, Y, width, height, false) : null
  const ppu = bounds ? width / (bounds.x[1] - bounds.x[0]) : 40
  const px = (n: number) => n / ppu
  const every = labelEvery(ppu)
  const n = numberOf(place, origin)
  const tick = px(6)
  const pinY = -px(44)

  const ticks: ReactNode[] = []
  for (let k = -LIMIT; k <= LIMIT; k++) {
    ticks.push(
      <Line.Segment key={`t${k}`} point1={[k, -tick]} point2={[k, tick]} color="var(--muted)" weight={1.5} />,
    )
    // The origin's own tick has no number: the pin below it is labelled "origin (0)".
    if (showsNumber(k, origin, every) && !approxEqual(k, origin))
      ticks.push(
        <PlaneLabel key={`n${k}`} x={k} y={-tick} attach="s" distance={9} size={13} color="var(--muted)">
          {signed(numberOf(k, origin))}
        </PlaneLabel>,
      )
  }

  const ghostShown = ghostOrigin !== undefined && !approxEqual(ghostOrigin, origin)
  // Labels point away from each other: the old origin's label on its far side from the new one.
  const ghostRight = ghostShown && ghostOrigin > origin
  const pinLabelSide = ghostShown ? (ghostRight ? 'w' : 'e') : origin > LIMIT - 3 ? 'w' : 'e'

  return (
    <div ref={box} role="group" aria-label={label} className="overflow-hidden rounded-xl border border-line">
      <BoundsContext.Provider value={bounds}>
        <Mafs height={height} pan={false} zoom={false} viewBox={{ x: X, y: Y, padding: PADDING }} preserveAspectRatio="contain">
          <Line.Segment point1={[-LIMIT - 0.4, 0]} point2={[LIMIT + 0.4, 0]} color="var(--ink)" weight={2} />
          {ticks}

          {startMark !== undefined && !approxEqual(startMark, place) && (
            <>
              <Line.Segment point1={[startMark, 0]} point2={[startMark, px(30)]} color={COLOR.ghost} weight={2} style="dashed" />
              <PlaneLabel x={startMark} y={px(30)} attach="n" distance={2} size={12} color={COLOR.ghost}>
                bead started here
              </PlaneLabel>
            </>
          )}

          {ghostShown && (
            <>
              <Line.Segment point1={[ghostOrigin, 0]} point2={[ghostOrigin, pinY]} color={COLOR.ghost} weight={2} style="dashed" />
              <Point x={ghostOrigin} y={pinY} color={COLOR.ghost} />
              <PlaneLabel x={ghostOrigin} y={pinY} attach={ghostRight ? 'e' : 'w'} distance={10} size={13} color={COLOR.ghost}>
                old origin
              </PlaneLabel>
            </>
          )}

          {/* The origin hangs below the wire like a pin, so it never hides the bead. */}
          <Line.Segment point1={[origin, px(10)]} point2={[origin, pinY]} color={COLOR.result} weight={3} />
          <PlaneLabel x={origin} y={pinY} attach={pinLabelSide} distance={12} size={14} color={COLOR.result}>
            origin (0)
          </PlaneLabel>
          {onOrigin ? (
            <MovablePoint point={[origin, pinY]} onMove={([x]) => onOrigin(snapOnLine([x, 0])[0])} constrain={([x]) => [snapOnLine([x, 0])[0], pinY]} color={COLOR.result} />
          ) : (
            <Point x={origin} y={pinY} color={COLOR.result} />
          )}

          {showDistance && !isZero(n) && (
            <Arrow tail={[origin, px(22)]} tip={[place, px(22)]} color={COLOR.v} weight={3} showCoords={false} />
          )}
          {showDistance && (
            <PlaneLabel x={(origin + place) / 2} y={px(22)} attach="n" distance={10} size={14} color={COLOR.v}>
              {describeNumber(n).replace(' of the origin', '')}
            </PlaneLabel>
          )}

          {onPlace ? (
            <MovablePoint point={[place, 0]} onMove={([x]) => onPlace(snapOnLine([x, 0])[0])} constrain={snapOnLine} color={COLOR.v} />
          ) : (
            <Point x={place} y={0} color={COLOR.v} />
          )}
          {beadLabel && (
            <PlaneLabel x={place} y={0} attach="n" distance={16} size={15} color={COLOR.v}>
              {`bead: ${signed(n)}`}
            </PlaneLabel>
          )}
          {children}
        </Mafs>
      </BoundsContext.Provider>
    </div>
  )
}
