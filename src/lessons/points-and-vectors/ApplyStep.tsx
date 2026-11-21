import { useState } from 'react'
import { CoordPoint, Plane } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import type { Vec2 } from '../../linalg'
import { DEPOT, ROBOT_MOVES, UPDATE, WEIGHTS, directions, route, updatedWeights } from './model'
import { StartHandle, TripArrow } from './parts'

const signed = (x: number) => (x > 0 ? `+${fmt(x)}` : fmt(x))

export function ApplyStep() {
  const [depot, setDepot] = useState<Vec2>(DEPOT)
  const [made, setMade] = useState(0)

  const stops = route(depot, ROBOT_MOVES)
  const here = stops[made]
  /** Every position on the full route, relative to the depot: keeps the whole route on screen. */
  const reach = route([0, 0], ROBOT_MOVES).slice(1)
  const after = updatedWeights()

  return (
    <Step
      n={5}
      kind="Apply"
      title="Robots, games and AI models all move by vectors"
      visual={
        <>
          <Plane height={400} label="A delivery robot following a list of three moves from a draggable depot">
            {ROBOT_MOVES.map((m, k) =>
              k < made ? (
                <TripArrow key={k} from={stops[k]} to={stops[k + 1]} color={COLOR.v} label={fmtVec(m)} />
              ) : (
                <TripArrow key={k} from={stops[k]} to={stops[k + 1]} color={COLOR.ghost} dashed opacity={0.5} />
              ),
            )}
            <StartHandle value={depot} onChange={setDepot} offsets={reach} color={COLOR.ghost} />
            <PlaneLabel x={depot[0]} y={depot[1]} attach="s" distance={12} size={13} color={COLOR.ghost}>
              depot
            </PlaneLabel>
            {made > 0 && <CoordPoint at={here} color={COLOR.result} />}
            {made > 0 && (
              <PlaneLabel x={here[0]} y={here[1]} attach="ne" distance={10} size={15} color={COLOR.result}>
                robot
              </PlaneLabel>
            )}
          </Plane>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button disabled={made === ROBOT_MOVES.length} onClick={() => setMade(made + 1)}>
              Next move
            </Button>
            <Button variant="secondary" disabled={made === 0} onClick={() => setMade(0)}>
              Back to the depot
            </Button>
          </div>
          <ol className="mt-3 mb-0 pl-6 text-sm">
            {ROBOT_MOVES.map((m, k) => (
              <li key={k} className={k < made ? 'font-semibold' : 'text-muted'}>
                {fmtVec(m)}: {directions(m)}
                {k < made && <> → robot at {fmtVec(stops[k + 1])}</>}
              </li>
            ))}
          </ol>
          <Readout>
            {made === 0
              ? `The robot is waiting at the depot, ${fmtVec(depot)}. It has ${ROBOT_MOVES.length} moves to make.`
              : `After ${made} move${made === 1 ? '' : 's'} the robot is at ${fmtVec(here)}: the depot ${fmtVec(depot)} plus each move so far.`}
          </Readout>
        </>
      }
    >
      <p>
        A delivery robot is often given its route as <strong>moves</strong>, not addresses:
        &ldquo;(3, 1), then (1, 3), then (−2, 2)&rdquo;. Each move is a vector. Its position is a
        point. Every step is point + vector = new point.
      </p>
      <p>
        The dashed grey arrows are the planned route. Press <strong>Next move</strong> to follow it. Then drag the{' '}
        <strong>depot</strong> somewhere else and replay it: the same three moves trace the same
        shape from the new start. The moves did not care where they began.
      </p>
      <p>
        A game character works the same way. Its position is a point; every frame the game adds
        its velocity, a vector, to get the next position.
      </p>

      <h3 className="mt-6 mb-2 font-display text-xl">Where this shows up in AI</h3>
      <p>
        A model&rsquo;s weights are a long list of numbers: a <strong>point</strong> that says
        where the model is right now. Training nudges every weight a little. That nudge is a{' '}
        <strong>vector</strong>, and the new weights are point + vector:
      </p>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Three weights before and after one training update</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1 pr-3 font-semibold"> </th>
              {WEIGHTS.map((_, k) => (
                <th key={k} className="py-1 pr-3 font-semibold">
                  weight {k + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <th className="py-1 pr-3 text-left font-normal">now (a point)</th>
              {WEIGHTS.map((w, k) => (
                <td key={k} className="py-1 pr-3 tabular-nums">{fmt(w)}</td>
              ))}
            </tr>
            <tr className="border-b border-line">
              <th className="py-1 pr-3 text-left font-normal">
                <Tag color={COLOR.v}>update (a vector)</Tag>
              </th>
              {UPDATE.map((u, k) => (
                <td key={k} className="py-1 pr-3 tabular-nums">{signed(u)}</td>
              ))}
            </tr>
            <tr>
              <th className="py-1 pr-3 text-left font-normal">
                <Tag color={COLOR.result}>after (a point)</Tag>
              </th>
              {after.map((w, k) => (
                <td key={k} className="py-1 pr-3 tabular-nums">{fmt(w)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Real models have millions of weights instead of three, and nobody can draw that many
        directions. The robot&rsquo;s map stops at 2D, but the arithmetic is exactly the same.
        Gradients (which way to nudge) and the gap between two word embeddings are vectors too:
        movements in &ldquo;feature space&rdquo;.
      </p>
    </Step>
  )
}
