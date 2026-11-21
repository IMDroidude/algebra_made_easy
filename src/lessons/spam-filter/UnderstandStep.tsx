import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Tex } from '../../components/Tex'
import { Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { add, dot, scale } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { columnSums, lineText, pointsOf, score } from './classifier'
import { ARROW_COLOR, AxisNames, Boundary, CentreMark, EmailDots, EmailPlane, LINE_COLOR } from './EmailPlot'
import { EMAILS, EMAIL_COLOR, MODEL, VIEW_X, VIEW_Y } from './data'
import { ScatterPart } from './ScatterPart'
import { recipeSnippet } from './snippets'

const { centres, difference: d, w, midpoint: mid, b } = MODEL
const LINE = lineText(w, b)
const W2 = scale(w, 2)
const B2 = dot(W2, mid)
const N3 = EMAILS[2]
const S1 = EMAILS[4]
const RECIPE = recipeSnippet()

const matTex = (points: Vec2[]) => String.raw`\begin{bmatrix} ${points.map((p) => `${p[0]} & ${p[1]}`).join(String.raw` \\ `)} \end{bmatrix}`
const rowTex = (v: Vec2) => String.raw`\begin{bmatrix} ${fmt(v[0])} & ${fmt(v[1])} \end{bmatrix}`

function meanTex(kind: 'normal' | 'spam') {
  const pts = pointsOf(EMAILS, kind)
  const sums = columnSums(pts)
  return String.raw`\mu_{\text{${kind}}} = \tfrac{1}{4}\,\mathbf{1}^{\mathsf T} X_{\text{${kind}}} = \tfrac{1}{4} \begin{bmatrix} 1 & 1 & 1 & 1 \end{bmatrix} ${matTex(pts)} = \tfrac{1}{4} ${rowTex(sums)} = ${rowTex(centres[kind])}`
}

/** Step 4: the arithmetic behind the line, from centres to threshold; the scatter matrix is optional. */
export function UnderstandStep() {
  const [doubled, setDoubled] = useState(false)
  const [advanced, setAdvanced] = useState(false)

  return (
    <Step
      n={4}
      kind="Understand"
      title="From two centres to one rule"
      visual={
        <>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={380}
            label="The two centres, the difference arrow d, the midpoint, the direction w drawn from the midpoint, and the boundary line"
          >
            <Boundary w={w} b={b} x={VIEW_X} y={VIEW_Y} />
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            <EmailDots data={EMAILS} opacity={0.45} />
            <Arrow tail={centres.normal} tip={centres.spam} color={ARROW_COLOR} weight={2} opacity={0.5} showCoords={false} />
            {doubled && <Arrow tail={mid} tip={add(mid, W2)} color={ARROW_COLOR} dashed label="2w" />}
            <Arrow tail={mid} tip={add(mid, w)} color={ARROW_COLOR} label="w" showCoords={false} />
            <CentreMark at={centres.normal} kind="normal" attach="sw" />
            <CentreMark at={centres.spam} kind="spam" attach="ne" />
            <CoordPoint at={mid} color={LINE_COLOR} />
            <PlaneLabel x={mid[0]} y={mid[1]} attach="se" distance={10} size={13} color={LINE_COLOR}>
              midpoint
            </PlaneLabel>
          </EmailPlane>
          <Readout>
            Centres {fmtVec(centres.normal)} and {fmtVec(centres.spam)}; <Tag color={ARROW_COLOR}>d</Tag> = {fmtVec(d)},{' '}
            <Tag color={ARROW_COLOR}>w</Tag> = {fmtVec(w)}; midpoint {fmtVec(mid)}; threshold b = {fmt(b)}. The{' '}
            <Tag color={LINE_COLOR}>boundary</Tag> is {LINE}.
            {doubled && (
              <>
                {' '}
                With 2w = {fmtVec(W2)} the threshold becomes {fmt(B2)}: the line {lineText(W2, B2)}{' '}
                is the same line.
              </>
            )}
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={RECIPE.code} output={RECIPE.output} />
          </div>
        </>
      }
    >
      <p>
        <strong>1. The centres, as one matrix product.</strong> Averaging is &ldquo;add up, then divide&rdquo;. A row
        of ones, written 1ᵀ, times a matrix adds up its rows. So each centre is
      </p>
      <Tex block>{meanTex('normal')}</Tex>
      <Tex block>{meanTex('spam')}</Tex>
      <p>Same arithmetic as step 2, written in a way NumPy can do in one go.</p>

      <p>
        <strong>2. The direction.</strong> Subtract the centres:
      </p>
      <Tex block>
        {String.raw`\mathbf{d} = \mu_{\text{spam}} - \mu_{\text{normal}} = ${fmtVec(centres.spam)} - ${fmtVec(centres.normal)} = ${fmtVec(d)}`}
      </Tex>
      <p>
        Only its direction matters, and scaling an arrow never changes where it points. Dividing by 3 gives the tidier{' '}
        <Tag color={ARROW_COLOR}>w</Tag> = {fmtVec(w)}, which points the same way.
      </p>

      <p>
        <strong>3. The threshold.</strong> The dot product <Tex>{String.raw`\mathbf{w}\cdot\mathbf{x}`}</Tex> gives
        every email a <em>score</em>: how far it has travelled in the spam direction. With w = (1, 1), the score is
        just links plus &ldquo;!&rdquo; marks. The cut-off b is the score of the midpoint:
      </p>
      <Tex block>
        {String.raw`\text{midpoint} = \tfrac{1}{2}(\mu_{\text{normal}} + \mu_{\text{spam}}) = ${fmtVec(mid)}`}
      </Tex>
      <Tex block>
        {String.raw`b = \mathbf{w}\cdot\text{midpoint} = ${fmt(mid[0])} + ${fmt(mid[1])} = ${fmt(b)}`}
      </Tex>
      <p>
        The rule is: <strong>spam when w · x &gt; b</strong>, here <strong>x + y &gt; {fmt(b)}</strong>. Check two
        emails:
      </p>
      <Tex block>
        {String.raw`\text{N3: } ${N3.at[0]} + ${N3.at[1]} = ${score(w, N3.at)} < ${fmt(b)} \;\Rightarrow\; \text{normal}`}
      </Tex>
      <Tex block>
        {String.raw`\text{S1: } ${S1.at[0]} + ${S1.at[1]} = ${score(w, S1.at)} > ${fmt(b)} \;\Rightarrow\; \text{spam}`}
      </Tex>
      <p>
        <strong>Why the line is at right angles to w.</strong> The boundary is every point whose score is exactly{' '}
        {fmt(b)}. Walking along it, the score never changes, so the walking direction has a dot product of 0 with w:
        it is perpendicular to w (lesson 3.3).
      </p>

      <div className="my-6">
        <Predict
          question="Suppose we use w = (2, 2) instead, and work out b from the midpoint the same way. What happens to the line?"
          onReveal={() => setDoubled(true)}
          onRetry={() => setDoubled(false)}
          options={[
            {
              id: 'out',
              label: 'It moves twice as far from the origin.',
              correct: false,
              explain: (
                <p className="m-0">
                  Every score doubles, but so does the cut-off: b = (2, 2) · {fmtVec(mid)} = {fmt(B2)}. Doubling both
                  sides of x + y = {fmt(b)} gives 2x + 2y = {fmt(B2)}, which is satisfied by exactly the same points.
                </p>
              ),
            },
            {
              id: 'tilt',
              label: 'It tilts.',
              correct: false,
              explain: (
                <p className="m-0">
                  A line tilts only when w changes direction. (2, 2) points exactly where (1, 1) points; it is just
                  longer. And b doubles with it, to {fmt(B2)}.
                </p>
              ),
            },
            {
              id: 'same',
              label: 'Nothing: the line stays exactly where it is.',
              correct: true,
              explain: (
                <p className="m-0">
                  Right. Scores double and the threshold doubles too (b = {fmt(B2)}), so 2x + 2y = {fmt(B2)} is the same
                  line as x + y = {fmt(b)}. That is why we were free to divide d by 3: the length of w does not matter,
                  only its direction and the cut-off.
                </p>
              ),
            },
            {
              id: 'in',
              label: 'It moves closer to the origin.',
              correct: false,
              explain: (
                <p className="m-0">
                  That would happen if you doubled w but kept the old b = {fmt(b)}: 2x + 2y = {fmt(b)} is the line x +
                  y = {fmt(b / 2)}. But b is worked out from the midpoint with the new w, so it doubles to {fmt(B2)} and
                  the line stays put.
                </p>
              ),
            },
          ]}
        />
      </div>

      <div className="rounded-xl border border-line p-4">
        <Toggle checked={advanced} onChange={setAdvanced}>
          <span>
            <strong>Optional, advanced:</strong> why (1, 1) is the best direction (the scatter matrix)
          </span>
        </Toggle>
        {advanced && <ScatterPart />}
      </div>
      <p className="mt-4 text-sm text-muted">
        <Tag color={EMAIL_COLOR.normal}>Normal</Tag> and <Tag color={EMAIL_COLOR.spam}>spam</Tag> sides are shaded on
        the plane; the advanced part is not needed for the rest of the lesson.
      </p>
    </Step>
  )
}
