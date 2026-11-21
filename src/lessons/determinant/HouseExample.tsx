import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { HouseTable, RunningExample } from '../../components/RunningExample'
import { Tex } from '../../components/Tex'
import { Button, Readout } from '../../components/ui'
import { det2 } from '../../linalg'
import { HOUSES } from '../../data/houses'
import { TRANSFORMS, collidingPairs, houseSnippet, outputText, sameAs } from './runningExample'
import type { Which } from './runningExample'

const tex = (m: readonly (readonly number[])[]) =>
  String.raw`\begin{bmatrix} ${m.map((r) => r.join(' & ')).join(String.raw` \\ `)} \end{bmatrix}`

/** The running example: a det-0 feature transform merges houses; a det-1 one does not. */
export function HouseExample() {
  const [which, setWhich] = useState<Which>('flat')
  const { m } = TRANSFORMS[which]
  const name = which === 'flat' ? 'T' : 'S'
  const det = det2(m)
  const snippet = houseSnippet(which)
  const pairs = collidingPairs(m)

  return (
    <RunningExample title="A feature transform that loses houses">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <p>
            Take two features of each house, (sqft, bedrooms), and turn them into two new ones.
            <strong> T</strong> gives the spare space (sqft minus 200 per bedroom) and then the
            same number again, doubled. <strong>S</strong> gives the spare space and keeps the
            bedrooms.
          </p>
          <Tex block>{String.raw`T = ${tex(TRANSFORMS.flat.m)}, \qquad S = ${tex(TRANSFORMS.keep.m)}`}</Tex>
          <p>
            Row 2 of T is just twice row 1, so det T = 0: T squashes the plane onto a line. Houses
            A and C are different, but both have 700 sqft of spare space, so T sends them to the
            same output. From the output alone you cannot tell them apart, and no matrix can undo
            T. S has det 1: every house keeps its own output, and you can always get back.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Feature transform">
            {(Object.keys(TRANSFORMS) as Which[]).map((w) => (
              <Button
                key={w}
                variant={w === which ? 'primary' : 'secondary'}
                aria-pressed={w === which}
                onClick={() => setWhich(w)}
              >
                {TRANSFORMS[w].label}
              </Button>
            ))}
          </div>
          <Readout>
            <span data-testid="house-det">
              det {name} = {det}.{' '}
              {pairs.length > 0
                ? `${pairs.length} pairs of houses land on the same output: ${pairs.map(([p, q]) => `${p.id} and ${q.id}`).join(', ')}.`
                : `All ${HOUSES.length} houses land on different outputs.`}
            </span>
          </Readout>
        </div>
        <div>
          <HouseTable
            columns={['sqft', 'bedrooms']}
            caption={`Each house after ${name}`}
            extra={[
              { heading: `${name} x`, cell: (h) => <span className="whitespace-nowrap">{outputText(m, h)}</span> },
              {
                heading: 'same output as',
                cell: (h) =>
                  sameAs(m, h)
                    .map((o) => o.id)
                    .join(', ') || '—',
              },
            ]}
          />
          <NumpySnippet code={snippet.code} output={snippet.output} />
        </div>
      </div>
    </RunningExample>
  )
}
