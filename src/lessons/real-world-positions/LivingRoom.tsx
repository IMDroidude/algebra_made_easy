import { Point } from 'mafs'
import type { Vec2 } from '../../linalg'
import { PlaneLabel } from '../../components/PlaneLabel'
import { COLOR } from '../../lib/palette'
import { Button } from '../../components/ui'
import { FrameAxes, MapPlane, OriginMark, ThingMark, Walk, WallFeature, Walls } from './MapPlane'
import { ORIGINS, ROOM, UNIT_NAME, presetAt, roomSnap } from './positions'
import type { Frame, Thing, Unit, YDir } from './positions'

const snap = roomSnap(ROOM.w, ROOM.h)

/** The living room floor plan, seen from above, with the learner's axes drawn in it. */
export function LivingRoom({
  label,
  frame,
  things,
  walkTo,
  onOriginChange,
  ghostOrigin,
}: {
  label: string
  frame: Frame
  things: Thing[]
  /** Draw the walk from the origin to this thing. */
  walkTo?: Thing
  onOriginChange?: (next: Vec2) => void
  /** A faint marker for a place the origin could move to. */
  ghostOrigin?: Vec2
}) {
  return (
    <MapPlane label={label} x={[-1, ROOM.w + 0.6]} y={[-0.6, ROOM.h + 0.6]} grid={0.5}>
      <Walls w={ROOM.w} h={ROOM.h} />
      <WallFeature from={[0, 2]} to={[0, 3]} name="door" attach="sw" labelAt={[0, 2]} />
      <WallFeature from={[3.5, ROOM.h]} to={[4.5, ROOM.h]} name="window" attach="nw" labelAt={[3.5, ROOM.h]} />
      <FrameAxes frame={frame} w={ROOM.w} h={ROOM.h} />
      {walkTo && <Walk from={frame.origin} to={walkTo.at} />}
      {ghostOrigin && <OriginGhost at={ghostOrigin} />}
      {things.map((t) => (
        <ThingMark key={t.id} at={t.at} name={t.name} frame={frame} attach={t.attach} />
      ))}
      <OriginMark at={frame.origin} onChange={onOriginChange} constrain={snap} />
    </MapPlane>
  )
}

function OriginGhost({ at }: { at: Vec2 }) {
  return (
    <>
      <Point x={at[0]} y={at[1]} color={COLOR.ghost} />
      <PlaneLabel x={at[0]} y={at[1]} attach="ne" distance={10} size={14} color="var(--muted)">
        new origin?
      </PlaneLabel>
    </>
  )
}

/** A row of buttons where exactly one is chosen. */
export function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string
  value: T | undefined
  options: { id: T; label: string }[]
  onChange: (id: T) => void
}) {
  return (
    <fieldset className="m-0 mt-3 border-0 p-0">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button
            key={o.id}
            variant={value === o.id ? 'primary' : 'secondary'}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </fieldset>
  )
}

export function OriginChoice({ origin, onChange }: { origin: Vec2; onChange: (o: Vec2) => void }) {
  return (
    <Choice
      legend="1. Origin"
      value={presetAt(origin)?.id}
      options={ORIGINS.map((o) => ({ id: o.id, label: o.name.replace(/^the /, '') }))}
      onChange={(id) => onChange(ORIGINS.find((o) => o.id === id)!.at)}
    />
  )
}

export function UnitChoice({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  return (
    <Choice
      legend="3. Unit"
      value={unit}
      options={[
        { id: 'm', label: UNIT_NAME.m },
        { id: 'tiles', label: `${UNIT_NAME.tiles} (½ m)` },
      ]}
      onChange={onChange}
    />
  )
}

export function DirChoice({ yDir, onChange }: { yDir: YDir; onChange: (d: YDir) => void }) {
  return (
    <Choice
      legend="2. Directions (x always points right)"
      value={yDir}
      options={[
        { id: 'up', label: 'y up the map (maths)' },
        { id: 'down', label: 'y down the map (screens)' },
      ]}
      onChange={onChange}
    />
  )
}
