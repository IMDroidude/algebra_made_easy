import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, DraggablePoint } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { isZero, sub } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { centres, moveEmail, pointsOf, sameData, snapCount } from './classifier'
import type { Example } from './classifier'
import { ARROW_COLOR, AxisNames, CentreMark, EmailDots, EmailPlane } from './EmailPlot'
import { EMAILS, EMAIL_COLOR, VIEW_X, VIEW_Y } from './data'
import { centresSnippet } from './snippets'

/** "(1 + 0 + 1 + 2) / 4" for one coordinate of a group. */
const sumText = (points: Vec2[], k: 0 | 1) => `(${points.map((p) => fmt(p[k])).join(' + ')}) / ${points.length}`

const fracTop = (points: Vec2[], k: 0 | 1) => points.map((p) => fmt(p[k])).join('+')

/** Step 2: drag the emails; the centre of each group (its mean vector) follows. */
export function CentresStep() {
  const [data, setData] = useState<Example[]>(EMAILS)
  const [showD, setShowD] = useState(true)
  const c = centres(data)
  const d = sub(c.spam, c.normal)
  const snippet = centresSnippet(data)
  const normals = pointsOf(data, 'normal')
  const spams = pointsOf(data, 'spam')

  return (
    <Step
      n={2}
      kind="Manipulate"
      title="Find the centre of each cloud"
      layout="wide"
      visual={
        <>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={400}
            label="Eight draggable emails; a marked centre for each group, and an arrow from the normal centre to the spam centre"
          >
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            {showD && !isZero(Math.hypot(d[0], d[1])) && (
              <Arrow tail={c.normal} tip={c.spam} color={ARROW_COLOR} label="d" labelAt="middle" showCoords={false} />
            )}
            <CentreMark at={c.normal} kind="normal" attach="sw" />
            <CentreMark at={c.spam} kind="spam" attach="ne" />
            <EmailDots data={data} />
            {data.map((e, i) => (
              <DraggablePoint
                key={e.name}
                value={e.at}
                onChange={(at) => setData((prev) => moveEmail(prev, i, at))}
                color={EMAIL_COLOR[e.kind]}
                snap={snapCount}
              />
            ))}
          </EmailPlane>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Toggle checked={showD} onChange={setShowD}>
              Show the difference arrow d
            </Toggle>
            <Button variant="secondary" disabled={sameData(data, EMAILS)} onClick={() => setData(EMAILS)}>
              Put the emails back
            </Button>
          </div>
          <Readout>
            <Tag color={EMAIL_COLOR.normal}>Normal centre</Tag> = ({sumText(normals, 0)}, {sumText(normals, 1)}) ={' '}
            {fmtVec(c.normal)}. <Tag color={EMAIL_COLOR.spam}>Spam centre</Tag> = ({sumText(spams, 0)},{' '}
            {sumText(spams, 1)}) = {fmtVec(c.spam)}.
            {showD && (
              <>
                {' '}
                <Tag color={ARROW_COLOR}>d</Tag> = spam centre − normal centre = {fmtVec(d)}.
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        If each group had one &ldquo;typical&rdquo; email, where would it sit? Take the average of the group&rsquo;s
        vectors, one coordinate at a time: average the links, then average the &ldquo;!&rdquo; marks. The result is
        the group&rsquo;s <strong>mean vector</strong>, its centre, written μ (the Greek letter &ldquo;mu&rdquo;).
      </p>
      <Tex block>
        {String.raw`\mu_{\text{normal}} = \left(\tfrac{${fracTop(normals, 0)}}{4},\ \tfrac{${fracTop(normals, 1)}}{4}\right) = ${fmtVec(c.normal)}`}
      </Tex>
      <p>
        Then draw an arrow from one centre to the other. This <Tag color={ARROW_COLOR}>difference vector d</Tag> is
        the trip from a typical normal email to a typical spam email: for the original eight, 3 more links and 3 more
        &ldquo;!&rdquo; marks. It points the way the groups differ most.
      </p>
      <p>
        Drag any email (or click it and use the arrow keys). Notice that moving one email 4 steps moves its
        group&rsquo;s centre only 1 step: it is one of four votes. Moving a normal email changes only the normal
        centre.
      </p>
      <p>
        In the code, <code>y == 0</code> gives True for each normal row, and <code>X[y == 0]</code> keeps just those
        rows. <code>.mean(axis=0)</code> averages down each column.
      </p>
    </Step>
  )
}
