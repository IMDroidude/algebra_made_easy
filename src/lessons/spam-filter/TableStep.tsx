import { Line } from 'mafs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { AxisNames, EmailDots, EmailPlane } from './EmailPlot'
import { EMAILS, EMAIL_COLOR, VIEW_X, VIEW_Y } from './data'
import { tableSnippet } from './snippets'

const plural = (n: number, word: string) => `${fmt(n)} ${word}${n === 1 ? '' : 's'}`

const X_TEX = EMAILS.map((e) => `${e.at[0]} & ${e.at[1]}`).join(String.raw` \\ `)
const Y_TEX = EMAILS.map((e) => (e.kind === 'spam' ? 1 : 0)).join(String.raw` \\ `)

/** Step 1: the table is a matrix, each row is a vector, each vector is an arrow. */
export function TableStep() {
  const [row, setRow] = useState(2)
  const [arrows, setArrows] = useState(true)
  const email = EMAILS[row]
  const [x, y] = email.at
  const color = EMAIL_COLOR[email.kind]
  const snippet = tableSnippet(row)

  return (
    <Step
      n={1}
      kind="See"
      title="A table is already a matrix"
      visual={
        <>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={360}
            label="The eight emails as points, each with an arrow from the origin; the chosen email shows its walk right then up"
          >
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            {arrows &&
              EMAILS.map((e, i) =>
                i === row ? null : (
                  <Line.Segment key={e.name} point1={[0, 0]} point2={e.at} color={EMAIL_COLOR[e.kind]} weight={1.5} opacity={0.4} />
                ),
              )}
            {x > 0 && <Line.Segment point1={[0, 0]} point2={[x, 0]} color={COLOR.ghost} style="dashed" weight={2} />}
            {y > 0 && <Line.Segment point1={[x, 0]} point2={[x, y]} color={COLOR.ghost} style="dashed" weight={2} />}
            {x > 0 && (
              <PlaneLabel x={x / 2} y={0} attach="n" distance={6} size={12} color="var(--muted)">
                {`${x} right`}
              </PlaneLabel>
            )}
            {y > 0 && (
              <PlaneLabel x={x} y={y / 2} attach="e" distance={8} size={12} color="var(--muted)">
                {`${y} up`}
              </PlaneLabel>
            )}
            <Arrow tip={email.at} color={color} weight={3.5} showCoords={false} />
            <EmailDots data={EMAILS} />
          </EmailPlane>
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Choose an email">
            {EMAILS.map((e, i) => (
              <Button
                key={e.name}
                variant={i === row ? 'primary' : 'secondary'}
                aria-pressed={i === row}
                onClick={() => setRow(i)}
                className="px-2.5 font-mono"
              >
                {e.name}
              </Button>
            ))}
          </div>
          <div className="mt-3">
            <Toggle checked={arrows} onChange={setArrows}>
              Show every arrow from the origin
            </Toggle>
          </div>
          <Readout>
            <Tag color={color}>{email.name}</Tag> is row {row + 1} of X: the vector ({x}, {y}). From the origin, walk{' '}
            {plural(x, 'step')} right (its links), then {plural(y, 'step')} up (its &ldquo;!&rdquo; marks). It is a{' '}
            {email.kind} email.
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        Machine learning starts with a table. Here are the eight emails from{' '}
        <Link to="/lessons/coordinate-plane">lesson 1.2</Link> again: for each one, how many links it has and how many
        exclamation marks.
      </p>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Eight emails, their two features and their kind</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1 pr-2 font-semibold">Email</th>
              <th className="py-1 pr-2 font-semibold">links</th>
              <th className="py-1 pr-2 font-semibold">&ldquo;!&rdquo; marks</th>
              <th className="py-1 font-semibold">kind (y)</th>
            </tr>
          </thead>
          <tbody>
            {EMAILS.map((e) => (
              <tr key={e.name} className="border-b border-line">
                <td className="py-1 pr-2">
                  <Tag color={EMAIL_COLOR[e.kind]}>{e.name}</Tag>
                </td>
                <td className="py-1 pr-2 font-mono">{e.at[0]}</td>
                <td className="py-1 pr-2 font-mono">{e.at[1]}</td>
                <td className="py-1">
                  {e.kind} ({e.kind === 'spam' ? 1 : 0})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Nothing needs turning into maths: the two number columns already <em>are</em> a matrix. Call it{' '}
        <strong>X</strong>. It has 8 rows (one per email) and 2 columns (one per feature), so it is 8×2. The answers
        go in a separate <strong>label vector y</strong>, with 0 for normal and 1 for spam.
      </p>
      <Tex block>
        {String.raw`X = \begin{bmatrix} ${X_TEX} \end{bmatrix} \qquad \mathbf{y} = \begin{bmatrix} ${Y_TEX} \end{bmatrix}`}
      </Tex>
      <p>
        Each row is a vector, and a vector is an arrow from the origin. Its <strong>direction</strong> tells you what
        kind of email it is: normal mail points low, spam points up and to the right. Its <strong>length</strong>{' '}
        tells you how extreme it is. Pick an email to see its walk.
      </p>
      <p>
        In the code, <code>X[2]</code> is the third row: Python counts from 0.
      </p>
    </Step>
  )
}
