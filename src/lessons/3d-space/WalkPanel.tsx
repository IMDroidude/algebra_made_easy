import { Button } from '../../components/ui'
import type { Vec3 } from '../../linalg/project3d'
import { approxEqualVec } from '../../linalg'
import { AXIS_COLOR, coord3Text } from './cube'
import { AXES, EQUAL, ORIGIN, START, pointNote, walkSteps } from './walk'

/** "How to reach this point": the three legs of the walk from the corner, in words, live. */
export function WalkPanel({ point }: { point: Vec3 }) {
  const steps = walkSteps(point)
  const note = pointNote(point)
  return (
    <div
      aria-live="polite"
      data-testid="walk-panel"
      className="mt-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm"
    >
      <p className="m-0 font-semibold">How to reach {coord3Text(point)} from the corner</p>
      <ol className="mt-1 mb-0 pl-5">
        {AXES.map((a, k) => (
          <li key={a} className="my-0.5 border-l-4 pl-2" style={{ borderColor: AXIS_COLOR[a] }}>
            {steps[k]}
          </li>
        ))}
      </ol>
      {note && <p className="mt-2 mb-0">{note}</p>}
    </div>
  )
}

/** Buttons that jump the point to the origin, to equal coordinates, or back to the start. */
export function PointPresets({
  value,
  onChange,
  onReset,
}: {
  value: Vec3
  onChange: (next: Vec3) => void
  /** What Reset does; by default it puts the point back at the start. */
  onReset?: () => void
}) {
  const presets: [string, Vec3][] = [
    ['Origin (0, 0, 0)', ORIGIN],
    ['Equal coordinates (3, 3, 3)', EQUAL],
  ]
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Jump to:</span>
      {presets.map(([name, at]) => (
        <Button
          key={name}
          variant={approxEqualVec(value, at) ? 'primary' : 'secondary'}
          aria-pressed={approxEqualVec(value, at)}
          onClick={() => onChange(at)}
        >
          {name}
        </Button>
      ))}
      <Button variant="secondary" onClick={onReset ?? (() => onChange(START))}>
        Reset
      </Button>
    </div>
  )
}
