import { MovablePoint, Polygon } from 'mafs'
import { useState } from 'react'
import { CoordPoint, DraggablePoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { Globe } from './Globe'
import { Choice } from './LivingRoom'
import { MapPlane } from './MapPlane'
import {
  CINEMA,
  FILES,
  FRUITS,
  FRUIT_X,
  FRUIT_Y,
  KNIGHT_START,
  ROW_LETTERS,
  chessSquare,
  nearestFruit,
  seatName,
  seatPair,
  snapFruit,
  snapToSquare,
} from './positions'

type Tab = 'chess' | 'cinema' | 'world' | 'data'

const TABS: { id: Tab; label: string }[] = [
  { id: 'chess', label: 'Chessboard' },
  { id: 'cinema', label: 'Cinema seat' },
  { id: 'world', label: 'Game world & GPS' },
  { id: 'data', label: 'Fruit as data' },
]

export function ApplyStep() {
  const [tab, setTab] = useState<Tab>('chess')
  const [knight, setKnight] = useState<Vec2>(KNIGHT_START)
  const [seat, setSeat] = useState<[number, number]>([3, 7])
  const [fruit, setFruit] = useState<Vec2>([150, 4])

  return (
    <Step
      n={5}
      kind="Apply"
      title="Addresses out in the world"
      layout="wide"
      visual={
        <>
          {tab === 'chess' && <Chess knight={knight} onChange={setKnight} />}
          {tab === 'cinema' && <Cinema seat={seat} onChange={setSeat} />}
          {tab === 'world' && <World />}
          {tab === 'data' && <FruitChart fruit={fruit} onChange={setFruit} />}
        </>
      }
    >
      <p>
        Every address system in daily life is the same recipe with different choices. Pick an
        example.
      </p>
      <div className="mb-4">
        <Choice legend="Example" value={tab} options={TABS} onChange={setTab} />
      </div>
      {tab === 'chess' && (
        <>
          <p>
            Chess players name squares like <strong>e4</strong>: a letter for the column, a number
            for the row. That is a pair of coordinates in disguise: e is the 5th letter, so e4 is
            (5, 4).
          </p>
          <p>
            The choices: origin at the corner by a1, x along the letters, y along the numbers, unit
            one square. Using a letter for one axis is a neat trick: you can never mix up which
            number comes first. Notice one difference from a ruler: squares are <em>counted</em>{' '}
            from 1, not measured from 0.
          </p>
          <p>Drag the knight (or click it and use the arrow keys).</p>
        </>
      )}
      {tab === 'cinema' && (
        <>
          <p>
            A cinema ticket says <strong>row C, seat 7</strong>. That is a position with two
            numbers: C is the 3rd row back from the screen, so the seat is (7, 3) if you write seat
            first.
          </p>
          <p>
            The choices: origin at the front-left corner, one direction along the row, the other
            away from the screen, unit one seat. The order matters here too: &ldquo;seat 3, row
            7&rdquo; is a different seat. Click any seat.
          </p>
        </>
      )}
      {tab === 'world' && (
        <>
          <p>
            <strong>A game world</strong> uses exactly the room from lesson 1.3: a character&rsquo;s
            position is (x, y, z), three numbers measured from the world&rsquo;s origin, updated
            every frame. A <strong>lift</strong> or a <strong>drone</strong> works the same way:
            how far along, how high, how far out.
          </p>
          <p>
            <strong>GPS</strong> also gives three numbers: latitude, longitude and altitude. But be
            careful: latitude and longitude are <em>angles</em> on a round Earth, not distances on a
            flat grid. Latitude is how far north or south of the equator you are, in degrees;
            longitude is how far east or west of a chosen line through Greenwich. Altitude is
            height above sea level, in metres.
          </p>
          <p>
            So GPS still follows the recipe (an origin where the equator meets the Greenwich line,
            directions north and east, units of degrees), but its grid is wrapped around a sphere.
            One degree of longitude is about 111 km at the equator and zero at the poles. They are
            coordinates with a different shape of system.
          </p>
        </>
      )}
      {tab === 'data' && (
        <>
          <p>
            The recipe works for things that are not places at all. Measure a fruit&rsquo;s{' '}
            <strong>weight</strong> and <strong>sweetness</strong>, and it becomes a point: an
            apple at (180, 6). The axes are now features instead of directions, and the units are
            grams and a 0–10 sweetness score.
          </p>
          <p>
            A house could be (size, rooms, age) = (120, 4, 35): a point in a 3D space of houses.
            A real dataset might measure hundreds of features per thing. You cannot draw that, but
            the rules are exactly the same: one number per feature, always in the same order.
          </p>
          <p>
            <strong>Turning real things into lists of numbers is the first step of every AI
            project.</strong> Drag your own fruit and see which known fruit it lands closest to.
          </p>
        </>
      )}
    </Step>
  )
}

// ---------------------------------------------------------------- chess

function Chess({ knight, onChange }: { knight: Vec2; onChange: (p: Vec2) => void }) {
  const sq = chessSquare(knight)
  const dark: Vec2[][] = []
  for (let c = 0; c < 8; c++)
    for (let r = 0; r < 8; r++)
      if ((c + r) % 2 === 0)
        dark.push([
          [c, r],
          [c + 1, r],
          [c + 1, r + 1],
          [c, r + 1],
        ])
  return (
    <>
      <MapPlane
        label="A chessboard with a draggable knight; columns a to h, rows 1 to 8"
        x={[-0.7, 8.2]}
        y={[-0.7, 8.2]}
        grid={false}
        maxHeight={460}
      >
        <Polygon
          points={[
            [0, 0],
            [8, 0],
            [8, 8],
            [0, 8],
          ]}
          color={COLOR.ghost}
          fillOpacity={0}
          weight={2}
        />
        {dark.map((pts, k) => (
          <Polygon key={k} points={pts} color={COLOR.ghost} fillOpacity={0.4} weight={0} />
        ))}
        {[...FILES].map((f, k) => (
          <PlaneLabel key={f} x={k + 0.5} y={0} attach="s" distance={8} size={14} color="var(--muted)">
            {`${f}=${k + 1}`}
          </PlaneLabel>
        ))}
        {Array.from({ length: 8 }, (_, k) => (
          <PlaneLabel key={k} x={0} y={k + 0.5} attach="w" distance={8} size={14} color="var(--muted)">
            {String(k + 1)}
          </PlaneLabel>
        ))}
        <MovablePoint point={knight} onMove={onChange} constrain={snapToSquare} color={COLOR.v} />
        <PlaneLabel
          x={knight[0]}
          y={knight[1]}
          attach={knight[1] > 6 ? 's' : 'n'}
          distance={16}
          size={16}
          color={COLOR.v}
        >
          {`knight ${sq.name}`}
        </PlaneLabel>
      </MapPlane>
      <Readout>
        The <Tag color={COLOR.v}>knight</Tag> is on <strong>{sq.name}</strong>: column{' '}
        {FILES[sq.col - 1]} (the {ordinal(sq.col)} column), row {sq.row}. As a pair of numbers:{' '}
        <strong>
          ({sq.col}, {sq.row})
        </strong>
        .
      </Readout>
    </>
  )
}

const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`

// ---------------------------------------------------------------- cinema

function Cinema({
  seat,
  onChange,
}: {
  seat: [number, number]
  onChange: (s: [number, number]) => void
}) {
  const [row, num] = seat
  const pair = seatPair(row, num)
  return (
    <>
      <div
        role="group"
        aria-label="Cinema seating plan; row A is nearest the screen"
        className="overflow-x-auto rounded-xl border border-line p-3"
      >
        <div className="mx-auto mb-3 max-w-xs rounded bg-line py-1 text-center text-xs font-semibold tracking-widest text-muted uppercase">
          Screen
        </div>
        <div className="mx-auto grid w-max gap-1">
          {Array.from({ length: CINEMA.rows }, (_, r) => (
            <div key={r} className="flex items-center gap-1">
              <span className="w-5 text-center text-xs font-semibold text-muted">{ROW_LETTERS[r]}</span>
              {Array.from({ length: CINEMA.seats }, (_, s) => {
                const chosen = row === r + 1 && num === s + 1
                return (
                  <button
                    key={s}
                    type="button"
                    aria-label={`Row ${ROW_LETTERS[r]}, seat ${s + 1}`}
                    aria-pressed={chosen}
                    onClick={() => onChange([r + 1, s + 1])}
                    className={`h-7 w-7 cursor-pointer rounded-t-lg border-2 text-[10px] font-semibold ${
                      chosen ? 'border-transparent text-white' : 'border-line bg-surface text-muted hover:border-accent'
                    }`}
                    style={chosen ? { background: COLOR.v } : undefined}
                  >
                    {s + 1}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <Readout>
        Seat <strong>{seatName(row, num)}</strong>: row {ROW_LETTERS[row - 1]} is the{' '}
        {ordinal(row)} row from the screen, seat {num} along it. As (seat, row):{' '}
        <strong>
          ({pair[0]}, {pair[1]})
        </strong>
        .
      </Readout>
    </>
  )
}

// ---------------------------------------------------------------- game world and GPS

function World() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="m-0 font-semibold">Game world</p>
          <pre className="m-0 mt-2 overflow-x-auto rounded-lg bg-code-bg px-3 py-2 font-mono text-sm text-code-ink">
            player.position = (12.5, 0, -40)
          </pre>
          <p className="m-0 mt-2 text-sm">
            12.5 m sideways (x), on the ground (y = 0, height), 40 m into the screen (z = −40,
            depth). Unit: metres. Origin: the world&rsquo;s centre, chosen by the game designer.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="m-0 font-semibold">GPS</p>
          <Globe />
          <p className="m-0 mt-2 text-sm">
            Latitude 48.86° N, longitude 2.35° E, altitude 35 m: two <strong>angles</strong> and a
            height. The grid lines curve around the sphere, so these are not flat (x, y) distances.
          </p>
        </div>
      </div>
      <Readout>
        Game world: three distances in metres, (12.5, 0, −40). GPS: two angles in degrees
        (latitude 48.86, longitude 2.35) and one height in metres (35).
      </Readout>
    </>
  )
}

// ---------------------------------------------------------------- fruit

function FruitChart({ fruit, onChange }: { fruit: Vec2; onChange: (p: Vec2) => void }) {
  const near = nearestFruit(fruit)
  return (
    <>
      <MapPlane
        label="A chart of fruits by weight in grams (across) and sweetness from 0 to 10 (up), with a draggable fruit of your own"
        x={[FRUIT_X[0] - 35, FRUIT_X[1] + 10]}
        y={[FRUIT_Y[0] - 1.3, FRUIT_Y[1] + 0.6]}
        grid={50}
        gridY={2}
        stretch
        axes
        height={320}
      >
        {FRUITS.map((f) => (
          <FruitDot key={f.name} at={[f.grams, f.sweet]} name={f.name} />
        ))}
        <DraggablePoint value={fruit} onChange={onChange} color={COLOR.v} snap={snapFruit} />
        <PlaneLabel
          x={fruit[0]}
          y={fruit[1]}
          attach={fruit[0] > 220 ? 'w' : 'e'}
          distance={16}
          size={15}
          color={COLOR.v}
        >
          your fruit
        </PlaneLabel>
        <PlaneLabel x={FRUIT_X[1]} y={0} attach="nw" distance={8} size={12} color="var(--muted)">
          weight (g) →
        </PlaneLabel>
        <PlaneLabel x={12} y={FRUIT_Y[1] - 1} attach="e" distance={8} size={12} color="var(--muted)">
          ↑ sweetness
        </PlaneLabel>
      </MapPlane>
      <Readout>
        <Tag color={COLOR.v}>Your fruit</Tag> = ({fmt(fruit[0])} g, sweetness {fmt(fruit[1])}),
        written as the list [{fmt(fruit[0])}, {fmt(fruit[1])}]. Of the known fruits, it sits
        closest to the <strong>{near.name}</strong> ({near.grams} g, {near.sweet}).
      </Readout>
    </>
  )
}

function FruitDot({ at, name }: { at: Vec2; name: string }) {
  return (
    <>
      <CoordPoint at={at} color={COLOR.i} />
      <PlaneLabel x={at[0]} y={at[1]} attach="n" distance={10} size={14} color={COLOR.i}>
        {name}
      </PlaneLabel>
    </>
  )
}
