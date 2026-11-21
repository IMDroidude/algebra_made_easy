import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { NumberField } from '../../components/NumberField'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { LinePlane } from './LinePlane'
import { PRACTICE_CHECKS, PRACTICE_START, describeNumber, numberOf, signed } from './model'
import type { PracticeState } from './model'

const ITEMS: Challenge[] = [
  {
    id: 'neg',
    title: 'Far to the left',
    task: <p className="m-0">Give the bead the number −6.</p>,
    insight: (
      <p className="m-0">
        −6 is 6 steps from the origin, to the left. You could do it by moving the bead, the origin,
        or both: only the gap between them counts.
      </p>
    ),
  },
  {
    id: 'still',
    title: 'Same place, new number',
    task: (
      <p className="m-0">
        With the bead back where it started (the grey mark), make its number 5 by moving only the
        origin.
      </p>
    ),
    insight: (
      <p className="m-0">
        For the bead to be 5 steps to the right of the origin, the origin must sit 5 steps to the
        left of the bead. The place did not change; the description did.
      </p>
    ),
  },
  {
    id: 'dims',
    title: 'Count the dimensions',
    task: (
      <div className="m-0">
        <p className="mt-0 mb-2">
          A weather station logs the temperature, humidity, wind speed and rainfall every hour. How
          many dimensions does one reading have?
        </p>
        <span className="text-sm text-muted">Type your answer in the box under the line.</span>
      </div>
    ),
    insight: (
      <p className="m-0">
        Four measured numbers, so each reading is a point in 4 dimensions. We cannot draw it, but
        the list (temperature, humidity, wind, rain) says exactly where it is.
      </p>
    ),
  },
]

export function PracticeStep() {
  const [s, setS] = useState<PracticeState>({ ...PRACTICE_START, dims: 0 })
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())

  const update = (patch: Partial<PracticeState>) => {
    const next = { ...s, ...patch }
    setS(next)
    const solved = Object.keys(PRACTICE_CHECKS).filter((id) => PRACTICE_CHECKS[id](next))
    if (solved.some((id) => !done.has(id))) setDone(new Set([...done, ...solved]))
  }
  const n = numberOf(s.place, s.origin)

  return (
    <Step
      n={6}
      kind="Practice"
      title="Your turn"
      layout="wide"
      visual={
        <>
          <LinePlane
            label="Practice number line with a draggable bead and a draggable origin"
            place={s.place}
            origin={s.origin}
            onPlace={(place) => update({ place })}
            onOrigin={(origin) => update({ origin })}
            startMark={PRACTICE_START.place}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => update({ place: PRACTICE_START.place, origin: PRACTICE_START.origin })}>
              Reset the line
            </Button>
            <label className="inline-flex items-center gap-2 text-sm">
              Dimensions of one weather reading:
              <NumberField label="Dimensions of one weather reading" value={s.dims} onChange={(dims) => update({ dims })} step={1} min={0} max={20} />
            </label>
          </div>
          <Readout>
            The <Tag color={COLOR.v}>bead</Tag>&rsquo;s number is {signed(n)}: it is {describeNumber(n)}.
          </Readout>
        </>
      }
    >
      <p>
        No answers are shown. Drag the <Tag color={COLOR.v}>bead</Tag> and the green{' '}
        <Tag color={COLOR.result}>origin</Tag> pin (or click one and use the arrow keys). Each task
        ticks itself as soon as it is true.
      </p>
      <Challenges items={ITEMS} done={done} />
    </Step>
  )
}
