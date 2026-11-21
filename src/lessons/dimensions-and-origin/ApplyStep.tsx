import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Readout, Step } from '../../components/ui'
import { Chooser } from './Chooser'
import { DimensionPicture } from './DimensionPicture'
import { HOUSE, featureText, houseCode, houseDrawing, houseText } from './model'
import type { Dims } from './model'

const OPTIONS = HOUSE.map((_, i) => [i + 1, `${i + 1}`] as const)

export function ApplyStep() {
  const [k, setK] = useState(3)
  const features = HOUSE.slice(0, k)
  const code = houseCode(k)
  const drawable = k <= 3

  return (
    <Step
      n={5}
      kind="Apply"
      title="Beyond three: a house as a point"
      layout="wide"
      visual={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Features measured:</span>
            <Chooser label="Number of features measured" options={OPTIONS} value={k} onChange={setK} />
          </div>
          <div className="mt-4 rounded-xl border border-line bg-surface p-3">
            {drawable ? (
              <DimensionPicture
                dims={k as Dims}
                values={houseDrawing(k)}
                axes={features.map((f) => f.name)}
                pointLabel={`house ${houseText(k)}`}
                label={`House space with ${k} ${k === 1 ? 'axis' : 'axes'}: ${features.map((f) => f.name).join(', ')}`}
              />
            ) : (
              <div className="flex min-h-[200px] flex-col justify-center gap-3 p-2" role="img" aria-label={`${k} features: too many directions to draw`}>
                <p className="m-0 font-semibold">{k} directions: no picture can show this.</p>
                <p className="m-0 text-sm text-muted">
                  Paper has 2 directions and a room has 3. There is nowhere to draw a 4th axis. The
                  list of numbers still works perfectly well:
                </p>
              </div>
            )}
            <ol className="mt-3 mb-0 flex list-none flex-wrap gap-2 p-0 text-sm">
              {features.map((f, i) => (
                <li key={f.name} className="rounded-md border border-line px-2 py-1">
                  <span className="text-muted">{i + 1}.</span> {featureText(f)}
                </li>
              ))}
            </ol>
          </div>
          <Readout>
            The house is the point {houseText(k)} in {k}-dimensional house space: {k}{' '}
            {k === 1 ? 'number' : 'numbers'}, one per feature.
            {!drawable && ' We cannot draw it, but the numbers still say exactly where it is.'}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code.code} output={code.output} />
          </div>
        </>
      }
    >
      <p>
        &ldquo;Where&rdquo; does not have to mean a place in a room. Describe a house by its size,
        its number of rooms and its age, and you have three numbers, say (120, 3, 15). That makes
        the house a point in three dimensions of &ldquo;house space&rdquo;: one axis per feature.
      </p>
      <p>
        Change how many features are measured. With 1, 2 or 3 we can still draw the space (the
        pictures are not to scale). Past 3 there is no picture, but nothing else changes: the house
        is a list of numbers, and the length of the list is the number of dimensions.
      </p>
      <p>
        This is exactly how AI models see data. Every piece of data has a number of dimensions: one
        per measured feature. A spreadsheet row with 300 columns is a point in 300 dimensions.
      </p>
      <p>
        In the code, <code>house.shape</code> is <code>(5,)</code> for five numbers, and{' '}
        <code>len(house)</code> gives the same count as a plain number.
      </p>
    </Step>
  )
}
