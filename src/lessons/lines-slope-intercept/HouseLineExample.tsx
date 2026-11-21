import { Line, Polygon } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Button, Readout, Tag, Toggle } from '../../components/ui'
import { HOUSES } from '../../data/houses'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { CLASS_COLOR } from './boundaryData'
import {
  BEST,
  BOUNDARY,
  HOUSE_START,
  PRICE_POINTS,
  PRICE_SPLIT,
  boundaryDistance,
  boundaryScoreHouse,
  houseLineCode,
  houseLineOutput,
} from './houseData'
import { HousePlane } from './HousePlane'
import { lineEquation, lineY, meanAbsMiss } from './lineMath'
import { SliderField } from './SliderField'

const X_RANGE: [number, number] = [-300, 2700]
const D_RANGE: [number, number] = [-2, 19]
/** Typed or slid values keep two decimals, so the code shows exactly what the picture uses. */
const two = (v: number) => Number(v.toFixed(2)) + 0

/** Running example: a line through the houses as a relationship, then a line as a boundary. */
export function HouseLineExample() {
  const [m, setM] = useState(HOUSE_START.m)
  const [b, setB] = useState(HOUSE_START.b)
  const [showBest, setShowBest] = useState(false)
  const [showBoundary, setShowBoundary] = useState(false)

  const miss = meanAbsMiss(m, b, PRICE_POINTS)
  const pricey = HOUSES.filter((h) => h.priceK > PRICE_SPLIT)
  const sideMore = HOUSES.filter((h) => boundaryScoreHouse(h.sqft, h.distanceKm) > 0)
  const split = pricey.length === sideMore.length && pricey.every((h) => sideMore.includes(h))

  return (
    <RunningExample title="A line through the houses">
      <p>
        A line is a <strong>relationship</strong>: all the points that satisfy one rule. The rule{' '}
        <em>income = 2 × experience + 30</em> is a line; so is{' '}
        <em>price = 0.22 × sqft + 30</em>. Every (sqft, price) pair that obeys the rule sits on
        the line, and every point on the line obeys it.
      </p>
      <p>
        Below are the course&rsquo;s eight houses as points (size, price). No line passes through
        all of them, but one can run close. Move m and b until the line follows the houses and
        the average miss is small. Under $20k is good going.
      </p>
      <HousePlane
        label="Eight houses as points of size against price, with your line price = m times sqft plus b"
        x={X_RANGE}
        y={[-60, 680]}
        xLines={500}
        yLines={100}
      >
        {showBest && (
          <Line.ThroughPoints
            point1={[0, BEST.b]}
            point2={[1000, lineY(BEST.m, BEST.b, 1000)]}
            color={COLOR.ghost}
            style="dashed"
          />
        )}
        <Line.ThroughPoints point1={[0, b]} point2={[1000, lineY(m, b, 1000)]} color={COLOR.v} />
        {PRICE_POINTS.map((p, k) => (
          <g key={HOUSES[k].id}>
            <CoordPoint at={p} color={COLOR.i} />
            <PlaneLabel x={p[0]} y={p[1]} attach="nw" distance={9} size={12} color={COLOR.i}>
              {HOUSES[k].id}
            </PlaneLabel>
          </g>
        ))}
        <PlaneLabel x={X_RANGE[1]} y={0} attach="nw" distance={8} size={13} color="var(--muted)">
          sqft →
        </PlaneLabel>
        <PlaneLabel x={0} y={650} attach="e" distance={10} size={13} color="var(--muted)">
          ↑ price ($k)
        </PlaneLabel>
      </HousePlane>
      <div className="mt-4 grid gap-3">
        <SliderField
          symbol="m"
          label="house line slope m"
          value={m}
          onChange={(v) => setM(two(v))}
          min={0}
          max={0.4}
          step={0.01}
          accent={COLOR.j}
        />
        <SliderField
          symbol="b"
          label="house line intercept b"
          value={b}
          onChange={(v) => setB(two(v))}
          min={-100}
          max={250}
          step={5}
          accent={COLOR.result}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Toggle checked={showBest} onChange={setShowBest}>
          Show the best-fit line
        </Toggle>
        <Button
          variant="secondary"
          onClick={() => {
            setM(HOUSE_START.m)
            setB(HOUSE_START.b)
          }}
        >
          Reset line
        </Button>
      </div>
      <Readout>
        Your line: <Tag color={COLOR.v}>{lineEquation(m, b, ' × sqft', 'price')}</Tag>. On average it
        misses a house&rsquo;s price by ${fmt(miss)}k
        {miss < 20 ? ': a good fit.' : '.'}
        {showBest &&
          ` Dashed: the best-fit line, ${lineEquation(BEST.m, BEST.b, ' × sqft', 'price', 3)}.`}
      </Readout>
      <p style={{ marginTop: '1rem' }}>
        The slope m is the price of one more square foot (0.22 means about $220), and b is where
        the line meets the price axis. The best-fit line, found by least squares in lesson 5.1, is
        about <Tex>{String.raw`\text{price} = ${fmt(BEST.m, 3)}\,\text{sqft} + ${fmt(BEST.b, 1)}`}</Tex>
        . It is a model, and like any model it is a little wrong for every house.
      </p>
      <NumpySnippet code={houseLineCode(m, b)} output={houseLineOutput(m, b)} />

      <div className="mt-5">
        <Toggle checked={showBoundary} onChange={setShowBoundary}>
          Use a line as a boundary instead
        </Toggle>
      </div>
      {showBoundary && (
        <div className="mt-4" data-testid="house-boundary">
          <p>
            Plot each house by size and distance to the centre instead. The line{' '}
            <Tex>{String.raw`\text{sqft} - ${BOUNDARY.perKm}\cdot\text{distance} = ${BOUNDARY.cut}`}</Tex>{' '}
            splits the plane in two. Every house on the lower-right side (big for how far out it
            is) sold for more than ${PRICE_SPLIT}k; every house on the other side for less. In this
            rule, one km further out cancels {BOUNDARY.perKm} sqft of size.
          </p>
          <HousePlane
            label={`Eight houses by size and distance to the centre, split by the line sqft minus ${BOUNDARY.perKm} times distance equals ${BOUNDARY.cut}`}
            x={X_RANGE}
            y={D_RANGE}
            xLines={500}
            yLines={5}
            height={280}
          >
            <Polygon
              points={[
                [BOUNDARY.cut, 0],
                [X_RANGE[1], boundaryDistance(X_RANGE[1])],
                [X_RANGE[1], 0],
              ]}
              color={CLASS_COLOR.a}
              fillOpacity={0.08}
              weight={0}
            />
            <Line.ThroughPoints
              point1={[BOUNDARY.cut, 0]}
              point2={[BOUNDARY.cut + BOUNDARY.perKm * 10, 10]}
              color="var(--ink)"
            />
            {HOUSES.map((h) => {
              const more = h.priceK > PRICE_SPLIT
              return (
                <g key={h.id}>
                  <CoordPoint at={[h.sqft, h.distanceKm]} color={more ? CLASS_COLOR.a : CLASS_COLOR.b} />
                  <PlaneLabel
                    x={h.sqft}
                    y={h.distanceKm}
                    // B sits right next to the line, so its label goes to the side.
                    attach={h.id === 'B' ? 'e' : 'n'}
                    distance={9}
                    size={12}
                    color={more ? CLASS_COLOR.a : CLASS_COLOR.b}
                  >
                    {`${h.id} ${h.priceK}`}
                  </PlaneLabel>
                </g>
              )
            })}
            <PlaneLabel x={X_RANGE[1]} y={0} attach="nw" distance={8} size={13} color="var(--muted)">
              sqft →
            </PlaneLabel>
            <PlaneLabel x={0} y={D_RANGE[1]} attach="se" distance={8} size={13} color="var(--muted)">
              ↑ distance (km)
            </PlaneLabel>
          </HousePlane>
          <Readout>
            Over ${PRICE_SPLIT}k: {pricey.map((h) => h.id).join(', ')}. On the lower-right side of the
            line: {sideMore.map((h) => h.id).join(', ')}.{' '}
            {split ? 'The line splits the two groups perfectly.' : 'The line puts some houses on the wrong side.'}
          </Readout>
          <p className="text-sm text-muted" style={{ marginTop: '1rem' }}>
            Same idea as the fruit boundary above: one rule, two sides. Eight houses make it easy;
            with real data some houses would land on the wrong side.
          </p>
        </div>
      )}
    </RunningExample>
  )
}
