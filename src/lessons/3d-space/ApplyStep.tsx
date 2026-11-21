import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, numpyPrint } from '../../lib/format'
import { CORNER_VIEW } from '../../linalg/project3d'
import type { View } from '../../linalg/project3d'
import { Cube3D, ViewControls } from './Cube3D'
import { coord3Text, describeView } from './cube'
import { FRUIT, FRUIT_COLOR, fruitCode } from './fruit'

export function ApplyStep() {
  const [view, setView] = useState<View>(CORNER_VIEW)
  const [row, setRow] = useState(0)
  const chosen = FRUIT[row]

  return (
    <Step
      n={5}
      kind="Apply"
      title="Three features, three axes"
      visual={
        <>
          <Cube3D
            label="Eight fruits plotted as points: weight along x, roundness along y, sourness along z"
            view={view}
            onViewChange={setView}
            shadows={false}
            points={FRUIT.map((f, k) => ({
              at: f.at,
              label: f.name,
              color: FRUIT_COLOR[f.kind],
              highlight: k === row,
            }))}
          />
          <ViewControls view={view} onChange={setView} />
          <Readout>
            Selected: <strong>{chosen.name}</strong>, {chosen.kind === 'apple' ? 'an apple' : 'a lemon'},
            row {row} of the table, at {coord3Text(chosen.at)}. {describeView(view)}
          </Readout>
          <div className="mt-4">
            <NumpySnippet
              code={fruitCode(row)}
              output={`(${FRUIT.length}, 3)\n${numpyPrint(chosen.at, false)}`}
            />
          </div>
        </>
      }
    >
      <p>
        A machine-learning dataset is a table: one row per example, one column per{' '}
        <em>feature</em> (a measured number). Here are eight fruits measured three ways. The weight
        is in units of 50 g; roundness and sourness are scores from 0 to 5.
      </p>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Eight fruits and their three features</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1 pr-2 font-semibold">Row</th>
              <th className="py-1 pr-2 font-semibold">Fruit</th>
              <th className="py-1 pr-2 font-semibold">weight (x)</th>
              <th className="py-1 pr-2 font-semibold">round (y)</th>
              <th className="py-1 font-semibold">sour (z)</th>
            </tr>
          </thead>
          <tbody>
            {FRUIT.map((f, k) => (
              <tr key={f.name} className={`border-b border-line ${k === row ? 'bg-surface font-semibold' : ''}`}>
                <td className="py-1 pr-2 font-mono">{k}</td>
                <td className="py-1 pr-2">
                  <button
                    type="button"
                    aria-pressed={k === row}
                    onClick={() => setRow(k)}
                    className="cursor-pointer rounded border border-line bg-transparent px-1.5 py-0.5 text-left hover:border-accent"
                  >
                    <Tag color={FRUIT_COLOR[f.kind]}>{f.name}</Tag> {f.kind}
                  </button>
                </td>
                <td className="py-1 pr-2 font-mono">{fmt(f.at[0])}</td>
                <td className="py-1 pr-2 font-mono">{fmt(f.at[1])}</td>
                <td className="py-1 font-mono">{fmt(f.at[2])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Each row is three numbers, so each fruit is a point in the room. Click a fruit to find it.
        Then press <strong>Front (xy)</strong>: you see only weight and roundness, and the{' '}
        <Tag color={FRUIT_COLOR.apple}>apples (A)</Tag> and <Tag color={FRUIT_COLOR.lemon}>lemons (L)</Tag> are
        mixed together. Press <strong>Top (xz)</strong> or <strong>Side (yz)</strong> and sourness
        comes into view: the two groups split cleanly apart.
      </p>
      <p>
        That is why models want more features: a third number can separate examples that two
        numbers could not. A classifier&rsquo;s job is to find where one group ends and the other
        begins.
      </p>
      <p>
        In the code, <code>X.shape</code> is (rows, columns): 8 points, 3 coordinates each.{' '}
        <code>X[{row}]</code> picks one row; NumPy counts rows from 0.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: real datasets have tens, hundreds or thousands of features. A
        text embedding often has 768. Nobody can draw a 768-axis room, and you do not need to: each
        example is still a point, written as a list of numbers in a fixed order, and everything you
        just did (reading a coordinate, dropping one to get a flat view) works the same way. Every
        2D or 3D chart of such data is a shadow that hides most of its coordinates.
      </p>
    </Step>
  )
}
