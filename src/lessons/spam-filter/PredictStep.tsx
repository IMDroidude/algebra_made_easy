import { Line } from 'mafs'
import { useState } from 'react'
import { Arrow, CoordPoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Predict } from '../../components/Predict'
import { Readout, Step, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { useTween } from '../../lib/useTween'
import { add, norm, scale, sub } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { lineText, score, verdict } from './classifier'
import { ARROW_COLOR, AxisNames, Boundary, CentreMark, EmailDots, EmailPlane, LINE_COLOR, NEW_COLOR } from './EmailPlot'
import { EMAILS, MODEL, PREDICT_EMAIL, VIEW_X, VIEW_Y } from './data'

const { centres, w, b, midpoint } = MODEL
const LINE = lineText(w, b)
const [px, py] = PREDICT_EMAIL
const PREDICT_SCORE = score(w, PREDICT_EMAIL)
const ALONG = scale<Vec2>([-w[1], w[0]], 1 / norm(w))

/** Step 3: where should the line go, and which side is a new email on? */
export function PredictStep() {
  const reveal = useTween(1200)
  const [lineShown, setLineShown] = useState(false)
  const [emailShown, setEmailShown] = useState(false)
  // The line grows out of the midpoint, along the direction at right angles to w, as the reveal plays.
  const half = scale(ALONG, 5 * reveal.t)

  return (
    <Step
      n={3}
      kind="Predict"
      title="Before you look: where does the line go?"
      layout="wide"
      visual={
        <>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={400}
            label="The emails, both centres and the difference arrow; after your prediction, the dividing line and a new email"
          >
            {lineShown && reveal.t >= 1 && <Boundary w={w} b={b} x={VIEW_X} y={VIEW_Y} />}
            {lineShown && reveal.t < 1 && (
              <Line.Segment
                point1={sub(midpoint, half)}
                point2={add(midpoint, half)}
                color={LINE_COLOR}
                weight={3}
              />
            )}
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            <EmailDots data={EMAILS} opacity={0.6} />
            <Arrow tail={centres.normal} tip={centres.spam} color={ARROW_COLOR} label={lineShown ? undefined : 'd'} labelAt="middle" showCoords={false} />
            <CentreMark at={centres.normal} kind="normal" attach="sw" />
            <CentreMark at={centres.spam} kind="spam" attach="ne" />
            {lineShown && (
              <>
                <CoordPoint at={midpoint} color={LINE_COLOR} />
                <PlaneLabel x={midpoint[0]} y={midpoint[1]} attach="se" distance={10} size={13} color={LINE_COLOR}>
                  midpoint
                </PlaneLabel>
              </>
            )}
            {emailShown && (
              <>
                <CoordPoint at={PREDICT_EMAIL} color={NEW_COLOR} />
                <PlaneLabel x={px} y={py} attach="e" distance={12} size={14} color={NEW_COLOR}>
                  new
                </PlaneLabel>
              </>
            )}
          </EmailPlane>
          <Readout>
            {!lineShown && 'No line yet. Lock in a prediction to see where it goes.'}
            {lineShown && (
              <>
                The <Tag color={LINE_COLOR}>line</Tag> passes through the midpoint {fmtVec(midpoint)} at right angles to{' '}
                <Tag color={ARROW_COLOR}>d</Tag>: it is {LINE}.
              </>
            )}
            {emailShown && (
              <>
                {' '}
                The <Tag color={NEW_COLOR}>new email</Tag> {fmtVec(PREDICT_EMAIL)} scores {px} + {py} = {PREDICT_SCORE}, below{' '}
                {b}: it is on the {verdict(w, b, PREDICT_EMAIL)} side.
              </>
            )}
          </Readout>
        </>
      }
    >
      <p>
        You have two centres and the arrow <Tag color={ARROW_COLOR}>d</Tag> between them. A spam filter needs a line
        that splits the plane: one side for normal mail, the other for spam.
      </p>
      <Predict
        question="Where should the dividing line go?"
        onReveal={() => {
          setLineShown(true)
          reveal.play()
        }}
        onRetry={() => {
          setLineShown(false)
          setEmailShown(false)
          reveal.reset(0)
        }}
        options={[
          {
            id: 'along',
            label: 'Along the arrow d, through both centres.',
            correct: false,
            explain: (
              <p className="m-0">
                That line runs right through the middle of both clouds, cutting each group in half. The arrow shows the
                direction to travel <em>from</em> normal <em>to</em> spam, so the dividing line has to cross it, not
                follow it.
              </p>
            ),
          },
          {
            id: 'mid',
            label: 'Through the point halfway between the centres, at right angles to d.',
            correct: true,
            explain: (
              <p className="m-0">
                Yes. Crossing d at right angles means the line separates &ldquo;more like spam&rdquo; from &ldquo;less
                like spam&rdquo;. Crossing it halfway, at {fmtVec(midpoint)}, is fair to both groups: neither centre
                is closer to the line than the other.
              </p>
            ),
          },
          {
            id: 'edge',
            label: 'At right angles to d, but hugging the normal emails, just past N3 and N4.',
            correct: false,
            explain: (
              <p className="m-0">
                That would split these eight correctly, but with no room to spare: a normal email with just one extra
                link would be called spam. Without a reason to favour one group, the fair place is halfway between
                the centres.
              </p>
            ),
          },
          {
            id: 'any',
            label: 'It does not matter: any line with the groups on opposite sides is equally good.',
            correct: false,
            explain: (
              <p className="m-0">
                Many lines split these eight emails, but they disagree about emails they have not seen yet, and those
                are the ones a filter is for. We need a rule that picks one line from the data. Halfway between the
                centres, at right angles to d, is that rule.
              </p>
            ),
          },
        ]}
      />
      {lineShown && (
        <div className="mt-6">
          <Predict
            question={
              <>
                A new email arrives with {px} links and {py} &ldquo;!&rdquo; mark: the point {fmtVec(PREDICT_EMAIL)}.
                Which side of the line is it on?
              </>
            }
            onReveal={() => setEmailShown(true)}
            onRetry={() => setEmailShown(false)}
            options={[
              {
                id: 'spam',
                label: 'The spam side.',
                correct: false,
                explain: (
                  <p className="m-0">
                    Three links is more than any normal email has, so it is tempting. But the line weighs both
                    features together: {px} + {py} = {PREDICT_SCORE}, which is below {b}. The single &ldquo;!&rdquo;
                    mark pulls it back to the normal side. No one feature decides on its own.
                  </p>
                ),
              },
              {
                id: 'normal',
                label: 'The normal side.',
                correct: true,
                explain: (
                  <p className="m-0">
                    Right. Its links and &ldquo;!&rdquo; marks add up to {px} + {py} = {PREDICT_SCORE}, below the line&rsquo;s{' '}
                    {b}. Every point on the line itself adds up to exactly {b}.
                  </p>
                ),
              },
              {
                id: 'on',
                label: 'Exactly on the line.',
                correct: false,
                explain: (
                  <p className="m-0">
                    The line is {LINE}: points on it have links plus &ldquo;!&rdquo; marks equal to exactly {b}. This
                    email adds up to {PREDICT_SCORE}, so it sits a little way off the line, on the side nearer the
                    origin.
                  </p>
                ),
              },
            ]}
          />
        </div>
      )}
    </Step>
  )
}
