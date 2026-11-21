import { useState } from 'react'
import { NumpySnippet } from '../components/NumpySnippet'
import { Arrow, DraggableArrow, Plane } from '../components/Plane'
import { Tex } from '../components/Tex'
import { Button, Readout, Tag } from '../components/ui'
import { fmt, fmtVec, isInteger, numpyPrint, numpyVec } from '../lib/format'
import { COLOR } from '../lib/palette'
import { add, norm, scale } from '../linalg'
import type { Vec2 } from '../linalg'

const col = (v: Vec2) => String.raw`\begin{bmatrix} ${fmt(v[0])} \\ ${fmt(v[1])} \end{bmatrix}`

export function VectorLab() {
  const [mode, setMode] = useState<'add' | 'scale'>('add')
  const [u, setU] = useState<Vec2>([2, 1])
  const [v, setV] = useState<Vec2>([1, 2])
  const [k, setK] = useState(2)

  const sum = add(u, v)
  const scaled = scale(u, k)

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 [&>*]:min-w-0">
      <div>
        <Plane
          height={440}
          label={
            mode === 'add'
              ? 'Two draggable vectors u and v, and their sum'
              : 'A draggable vector u and a scaled copy of it'
          }
        >
          {mode === 'add' ? (
            <>
              <Arrow tail={u} tip={sum} color={COLOR.j} dashed opacity={0.6} weight={2} />
              <Arrow tail={v} tip={sum} color={COLOR.i} dashed opacity={0.6} weight={2} />
              <Arrow tip={sum} color={COLOR.result} label="u + v" />
              <DraggableArrow value={u} onChange={setU} color={COLOR.i} label="u" />
              <DraggableArrow value={v} onChange={setV} color={COLOR.j} label="v" />
            </>
          ) : (
            <>
              <Arrow tip={scaled} color={COLOR.result} label={`${fmt(k)}u`} weight={6} opacity={0.55} />
              <DraggableArrow value={u} onChange={setU} color={COLOR.i} label="u" />
            </>
          )}
        </Plane>
        <Readout>
          {mode === 'add' ? (
            <>
              <Tag color={COLOR.i}>u</Tag> = {fmtVec(u)}, <Tag color={COLOR.j}>v</Tag> = {fmtVec(v)}
              , <Tag color={COLOR.result}>u + v</Tag> = {fmtVec(sum)}. The dashed arrows are copies
              of u and v: walk along one, then the other, in either order, and you reach the sum.
            </>
          ) : (
            <>
              <Tag color={COLOR.i}>u</Tag> = {fmtVec(u)} has length {fmt(norm(u))}.{' '}
              <Tag color={COLOR.result}>{fmt(k)}u</Tag> = {fmtVec(scaled)} has length{' '}
              {fmt(norm(scaled))}.{' '}
              {k === 0
                ? 'Multiplying by 0 shrinks any vector to the origin.'
                : k < 0
                  ? 'A negative number flips the vector to point the opposite way.'
                  : 'The direction is unchanged; only the length is multiplied.'}
            </>
          )}
        </Readout>
      </div>

      <div>
        <div role="group" aria-label="Operation" className="flex flex-wrap gap-2">
          <Button
            variant={mode === 'add' ? 'primary' : 'secondary'}
            aria-pressed={mode === 'add'}
            onClick={() => setMode('add')}
          >
            Add two vectors
          </Button>
          <Button
            variant={mode === 'scale' ? 'primary' : 'secondary'}
            aria-pressed={mode === 'scale'}
            onClick={() => setMode('scale')}
          >
            Scale a vector
          </Button>
        </div>

        {mode === 'add' ? (
          <>
            <p className="mt-5 max-w-[60ch]">
              Adding vectors means adding matching entries: x with x, y with y. On the plane that is
              the same as placing one arrow at the tip of the other.
            </p>
            <Tex block>{String.raw`${col(u)} + ${col(v)} = ${col(sum)}`}</Tex>
            <NumpySnippet
              code={`import numpy as np\n\n${numpyVec('u', u)}\n${numpyVec('v', v)}\n\nprint(u + v)`}
              output={numpyPrint(sum, isInteger(...u, ...v))}
            />
          </>
        ) : (
          <>
            <p className="mt-5 max-w-[60ch]">
              Multiplying a vector by a single number (a <em>scalar</em>) multiplies every entry by
              it. The arrow gets longer or shorter but stays on the same line through the origin.
            </p>
            <label className="mt-4 block max-w-sm">
              <span className="block text-sm font-medium">Scalar k = {fmt(k)}</span>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.25}
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-full"
              />
            </label>
            <Tex block>{String.raw`${k < 0 ? `(${fmt(k)})` : fmt(k)} \cdot ${col(u)} = ${col(scaled)}`}</Tex>
            <NumpySnippet
              code={`import numpy as np\n\n${numpyVec('u', u)}\nk = ${fmt(k)}\n\nprint(k * u)`}
              output={numpyPrint(scaled, isInteger(...u, k))}
            />
          </>
        )}
      </div>
    </div>
  )
}
