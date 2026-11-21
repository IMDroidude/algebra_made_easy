import { Line } from 'mafs'
import { useState } from 'react'
import { NumberField } from '../../components/NumberField'
import { NumpySnippet } from '../../components/NumpySnippet'
import { CoordPoint, DraggablePoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { matVec } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { lineText, predictKind, projectOntoDirection, score, snapCount, verdict } from './classifier'
import { ARROW_COLOR, AxisNames, Boundary, EmailDots, EmailPlane, LINE_COLOR, NEW_COLOR } from './EmailPlot'
import { APPLY_START, EMAILS, EMAIL_COLOR, MODEL, PROJECTED, VIEW_X, VIEW_Y } from './data'
import { scoresSnippet } from './snippets'

const { w, b } = MODEL
const LINE = lineText(w, b)
const SCORES = matVec(
  EMAILS.map((e) => e.at),
  w,
)
const ALL_RIGHT = EMAILS.every((e) => predictKind(w, b, e.at) === e.kind)
const X_TEX = EMAILS.map((e) => `${e.at[0]} & ${e.at[1]}`).join(String.raw` \\ `)
const S_TEX = SCORES.join(String.raw` \\ `)
const MAX = 6

const verdictText = (v: ReturnType<typeof verdict>) =>
  v === 'on the line' ? `exactly ${b}, on the line; not above it, so called normal` : v === 'spam' ? `above ${b}, so spam` : `not above ${b}, so normal`

/** Step 5: score every email with one multiplication, then judge a new one; the score is a projection. */
export function ApplyStep() {
  const [e, setE] = useState<Vec2>(APPLY_START)
  const [links, marks] = e
  const s = score(w, e)
  const foot = projectOntoDirection(e, w)
  const snippet = scoresSnippet(e)
  const v = verdict(w, b, e)
  const set = (k: 0 | 1) => (n: number) => setE((prev) => snapCount(k === 0 ? [n, prev[1]] : [prev[0], n]))

  return (
    <Step
      n={5}
      kind="Apply"
      title="Score every email at once, then a new one"
      layout="wide"
      visual={
        <>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={420}
            label="The emails, the boundary line, the diagonal direction of w through the origin, and a draggable new email with its projection onto that diagonal"
          >
            <Boundary w={w} b={b} x={VIEW_X} y={VIEW_Y} />
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            <Line.ThroughPoints point1={[0, 0]} point2={w} color={ARROW_COLOR} weight={1.5} style="dashed" opacity={0.7} />
            <PlaneLabel x={6} y={6} attach="w" distance={10} size={12} color={ARROW_COLOR}>
              w direction
            </PlaneLabel>
            <EmailDots data={EMAILS} opacity={0.55} />
            <Line.Segment point1={e} point2={foot} color={NEW_COLOR} style="dashed" weight={2} />
            <CoordPoint at={foot} color={ARROW_COLOR} />
            <DraggablePoint value={e} onChange={setE} color={NEW_COLOR} snap={snapCount} />
            <PlaneLabel x={links} y={marks} attach="e" distance={14} size={14} color={NEW_COLOR}>
              new
            </PlaneLabel>
          </EmailPlane>
          <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
            <div className="grid gap-1 text-sm font-medium">
              links
              <span className="w-24">
                <NumberField label="links" value={links} onChange={set(0)} step={1} min={0} max={MAX} accent={NEW_COLOR} />
              </span>
            </div>
            <div className="grid gap-1 text-sm font-medium">
              &ldquo;!&rdquo; marks
              <span className="w-24">
                <NumberField label="exclamation marks" value={marks} onChange={set(1)} step={1} min={0} max={MAX} accent={NEW_COLOR} />
              </span>
            </div>
            <Button variant="secondary" onClick={() => setE(PROJECTED.at)}>
              Put it where {PROJECTED.name} is
            </Button>
          </div>
          <Readout>
            <Tag color={NEW_COLOR}>The new email</Tag> {fmtVec(e)} scores w · x = {fmt(links)} + {fmt(marks)} = {fmt(s)},{' '}
            {verdictText(v)}. Its shadow on the <Tag color={ARROW_COLOR}>w direction</Tag> lands at {fmtVec(foot)}; the
            line crosses that diagonal at {fmtVec(MODEL.midpoint)}.
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        Checking emails one at a time works, but a matrix does all of them at once. Each row of X meets w in a dot
        product, so <code>X @ w</code> is a column of 8 scores:
      </p>
      <Tex block>
        {String.raw`X\mathbf{w} = \begin{bmatrix} ${X_TEX} \end{bmatrix} \begin{bmatrix} ${w[0]} \\ ${w[1]} \end{bmatrix} = \begin{bmatrix} ${S_TEX} \end{bmatrix}`}
      </Tex>
      <p>
        Compare each with b = {b}: the four normal emails score {SCORES.slice(0, 4).join(', ')} and the four spam
        emails score {SCORES.slice(4).join(', ')}. {ALL_RIGHT ? 'All 8 are on the correct side.' : ''} No loop, one
        multiplication. With a million emails it is still one line of NumPy.
      </p>
      <p>
        <strong>The score is a projection.</strong> Drop a perpendicular from an email onto the dashed{' '}
        <Tag color={ARROW_COLOR}>w direction</Tag>. Where it lands says how far the email has travelled in the spam
        direction. Press &ldquo;Put it where {PROJECTED.name} is&rdquo;: {PROJECTED.name} {fmtVec(PROJECTED.at)} lands at{' '}
        {fmtVec(projectOntoDirection(PROJECTED.at, w))}, past the line&rsquo;s crossing at {fmtVec(MODEL.midpoint)}, so it is
        spam. The cut-off b is just a mark on that diagonal.
      </p>
      <p>
        Now try a new email: drag it, use the arrow keys, or type its counts. The rule is still {LINE}, learned once.
        The model did not memorise eight emails; it kept a <strong>direction</strong> (w) and a{' '}
        <strong>cut-off</strong> (b), which is why it can judge an email it has never seen.
      </p>
      <p className="text-sm text-muted">
        What the picture leaves out: real spam filters use thousands of features (words, senders, links, formatting),
        so x and w have thousands of entries and the &ldquo;line&rdquo; becomes a flat sheet in that many dimensions.
        It cannot be drawn, but the recipe is identical: centres, a direction, a threshold, and X @ w. The shading
        shows the <Tag color={EMAIL_COLOR.normal}>normal</Tag> and <Tag color={EMAIL_COLOR.spam}>spam</Tag> sides of
        the <Tag color={LINE_COLOR}>line</Tag>; the projected point is the <Tag color={COLOR.v}>dot</Tag> on the
        diagonal.
      </p>
    </Step>
  )
}
