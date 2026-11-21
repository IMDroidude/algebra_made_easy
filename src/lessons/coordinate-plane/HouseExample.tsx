import { Coordinates, Mafs } from 'mafs'
import { useLayoutEffect, useRef, useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { RunningExample } from '../../components/RunningExample'
import { Button, Readout, Tag } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { BoundsContext, PADDING, visibleBounds } from '../../lib/planeBounds'
import { COLOR } from '../../lib/palette'
import {
  PRICE_GRID,
  PRICE_RANGE,
  PRICE_TICKS,
  SQFT_GRID,
  SQFT_RANGE,
  SQFT_TICKS,
  housePlaneCode,
  housePoint,
  housePointText,
  topRightHouse,
} from './houses'
import { usePlaneHeight } from './layout'

/** Running example: the eight houses as points (size, price) on a plane sized to fit them. */
export function HouseExample() {
  const [chosen, setChosen] = useState(6)
  const height = Math.min(usePlaneHeight('medium'), 440)
  const top = topRightHouse()!
  const h = HOUSES[chosen]
  const code = housePlaneCode(chosen)

  return (
    <RunningExample title="Eight houses on a plane">
      <p>
        Give each house two numbers, its size and its price, and it becomes a point:{' '}
        <strong>x = size</strong> in square feet, <strong>y = price</strong> in thousands of
        dollars. House A, 1100 sqft for $265k, is the point (1100, 265).
      </p>
      <HousePlane height={height} chosen={h.id} />
      <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Pick a house">
        <span className="mr-1 text-sm font-medium">House:</span>
        {HOUSES.map((x, k) => (
          <Button key={x.id} variant={k === chosen ? 'primary' : 'secondary'} aria-pressed={k === chosen} onClick={() => setChosen(k)}>
            {x.id}
          </Button>
        ))}
      </div>
      <Readout>
        <Tag color={COLOR.v}>House {h.id}</Tag> ({h.name}) is the point ({h.sqft}, {h.priceK}):{' '}
        {h.sqft} sqft along x, ${h.priceK}k up y.
        {h.id === top.id && ' It is the top-right point: the biggest house and the dearest.'}
      </Readout>
      <p className="mt-4">
        Bigger houses sit further right, dearer ones higher up. The top-right point is house{' '}
        <strong>{top.id}</strong> ({top.sqft}, {top.priceK}): the biggest and the most expensive.
        Hover a point to see its coordinates.
      </p>
      <p>
        Notice the plane. It does not start at the origin: no house has 0 sqft, so the picture
        shows only sizes from {SQFT_RANGE[0]} to {SQFT_RANGE[1]} and prices from {PRICE_RANGE[0]}{' '}
        to {PRICE_RANGE[1]}. And one step across (100 sqft) is not the same length as one step up
        ($50k): each axis gets its own scale so the data fills the space. The coordinates still
        mean exactly what they did.
      </p>
      <p>
        In the code, <code>X[:, 0]</code> means &ldquo;every row, column 0&rdquo;: all eight
        sizes. <code>np.column_stack</code> sets two lists side by side as columns.
      </p>
      <NumpySnippet code={code.code} output={code.output} />
    </RunningExample>
  )
}

function HousePlane({ height, chosen }: { height: number; chosen: string }) {
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
  const bounds = width > 0 ? visibleBounds(SQFT_RANGE, PRICE_RANGE, width, height, true) : null
  const [x0] = SQFT_RANGE
  const [y0] = PRICE_RANGE

  return (
    <div
      ref={box}
      role="group"
      aria-label={`The eight houses as points: size in square feet across, price in thousands of dollars up. ${HOUSES.map(housePointText).join(', ')}.`}
      className="overflow-hidden rounded-xl border border-line"
    >
      <BoundsContext.Provider value={bounds}>
        <Mafs height={height} pan={false} zoom={false} viewBox={{ x: SQFT_RANGE, y: PRICE_RANGE, padding: PADDING }} preserveAspectRatio={false}>
          <Coordinates.Cartesian
            subdivisions={false}
            xAxis={{ axis: false, labels: false, lines: SQFT_GRID }}
            yAxis={{ axis: false, labels: false, lines: PRICE_GRID }}
          />
          {SQFT_TICKS.map((t) => (
            <PlaneLabel key={t} x={t} y={y0} attach="n" distance={6} size={12} color="var(--muted)">
              {String(t)}
            </PlaneLabel>
          ))}
          {PRICE_TICKS.map((t) => (
            <PlaneLabel key={t} x={x0} y={t} attach="e" distance={6} size={12} color="var(--muted)">
              {String(t)}
            </PlaneLabel>
          ))}
          <PlaneLabel x={SQFT_RANGE[1]} y={y0 + 2 * PRICE_GRID} attach="w" distance={6} size={13} color="var(--muted)">
            size (sqft) →
          </PlaneLabel>
          <PlaneLabel x={x0} y={PRICE_RANGE[1]} attach="se" distance={10} size={13} color="var(--muted)">
            ↑ price ($k)
          </PlaneLabel>
          {HOUSES.map((h) => {
            const on = h.id === chosen
            return (
              <g key={h.id} data-house={h.id}>
                <CoordPoint at={housePoint(h)} color={on ? COLOR.v : COLOR.i} />
                <PlaneLabel x={h.sqft} y={h.priceK} attach="nw" distance={8} size={on ? 15 : 13} color={on ? COLOR.v : COLOR.i}>
                  {h.id}
                </PlaneLabel>
              </g>
            )
          })}
        </Mafs>
      </BoundsContext.Provider>
    </div>
  )
}
