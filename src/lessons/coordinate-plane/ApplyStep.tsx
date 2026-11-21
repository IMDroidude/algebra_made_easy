import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Readout, Step, Tag } from '../../components/ui'
import { fmt, numpyPrint } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { snapTo } from '../../lib/snap'
import { approxEqual } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { EMAILS, EMAIL_COLOR, NEW_EMAIL_START, emailCode } from './emails'
import { GridPlane } from './GridPlane'
import { usePlaneHeight } from './layout'
import { AxisNames } from './Guides'
import { noNegZero } from './plane'

/** Counts are whole numbers, and cannot be negative. */
const snapCount = (p: Vec2): Vec2 => {
  const [x, y] = snapTo(1)(p)
  return [Math.max(0, x), Math.max(0, y)]
}

export function ApplyStep() {
  const [e, setE] = useState<Vec2>(NEW_EMAIL_START)
  const [links, marks] = e
  const height = usePlaneHeight('medium')

  return (
    <Step
      n={5}
      kind="Apply"
      title="A row of data is a point"
      visual={
        <>
          <GridPlane
            x={[-1, 9]}
            y={[-1, 7]}
            height={height}
            label="Eight emails plotted by number of links and number of exclamation marks, plus one new email you can drag"
          >
            <AxisNames xName="links (x) →" yName="↑ “!” marks (y)" />
            {EMAILS.map((m) => (
              <g key={m.name}>
                <CoordPoint at={m.at} color={EMAIL_COLOR[m.kind]} />
                <PlaneLabel x={m.at[0]} y={m.at[1]} attach={m.at[0] > 4 || m.at[0] === 0 ? 'nw' : 'ne'} distance={8} size={13} color={EMAIL_COLOR[m.kind]}>
                  {m.name}
                </PlaneLabel>
              </g>
            ))}
            <DraggablePoint value={e} onChange={(n) => setE(noNegZero(n))} color={COLOR.v} snap={snapCount} />
            <PlaneLabel x={links} y={marks} attach="nw" distance={12} size={14} color={COLOR.v}>
              new
            </PlaneLabel>
          </GridPlane>
          <Readout>
            <Tag color={COLOR.v}>The new email</Tag> has {fmt(links)} link{approxEqual(links, 1) ? '' : 's'} and{' '}
            {fmt(marks)} exclamation mark{approxEqual(marks, 1) ? '' : 's'}: the row [{fmt(links)}, {fmt(marks)}],
            drawn at ({fmt(links)}, {fmt(marks)}).
          </Readout>
          <div className="mt-4">
            <NumpySnippet
              code={emailCode(e)}
              output={`(${EMAILS.length}, 2)\n${numpyPrint(e, true)}`}
            />
          </div>
        </>
      }
    >
      <p>
        Machine learning starts with a table. Each row is one example; each column is one{' '}
        <em>feature</em>, a number measured about it. Here each row is an email, and the two
        features are how many links it contains and how many exclamation marks.
      </p>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Eight emails and their two features</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1 pr-2 font-semibold">Email</th>
              <th className="py-1 pr-2 font-semibold">links (x)</th>
              <th className="py-1 pr-2 font-semibold">&ldquo;!&rdquo; marks (y)</th>
              <th className="py-1 font-semibold">Kind</th>
            </tr>
          </thead>
          <tbody>
            {EMAILS.map((m) => (
              <tr key={m.name} className="border-b border-line">
                <td className="py-1 pr-2">
                  <Tag color={EMAIL_COLOR[m.kind]}>{m.name}</Tag>
                </td>
                <td className="py-1 pr-2 font-mono">{fmt(m.at[0])}</td>
                <td className="py-1 pr-2 font-mono">{fmt(m.at[1])}</td>
                <td className="py-1">{m.kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Two numbers per row means each email is a point on the plane: links along x, exclamation
        marks along y. Plotted, the <Tag color={EMAIL_COLOR.normal}>normal emails (N)</Tag> sit
        together near the origin and the <Tag color={EMAIL_COLOR.spam}>spam (S)</Tag> sits together
        up and to the right. A spam filter&rsquo;s job is to learn where one group ends and the
        other begins.
      </p>
      <p>
        Drag the <Tag color={COLOR.v}>new</Tag> email around. Each position is a different row of
        two numbers; which group does it look like it belongs to?
      </p>
      <p>
        In the code, <code>X.shape</code> is (rows, columns): 8 emails, 2 features each. Counts can
        never be negative, so all these points live in quadrant I. Later lessons often shift data
        so its average sits at the origin; after that, half the values are negative and all four
        quadrants are used.
      </p>
      <p className="text-sm text-muted">
        What this picture leaves out: a real spam filter looks at hundreds or thousands of features
        per email, not two. That cannot be drawn on a flat grid, but each email is still a point,
        just with more numbers. The next lesson adds a third axis to show how that grows.
      </p>
    </Step>
  )
}
