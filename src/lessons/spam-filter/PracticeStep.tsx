import { useState } from 'react'
import { Challenges } from '../../components/Challenges'
import type { Challenge } from '../../components/Challenges'
import { Arrow, DraggablePoint } from '../../components/Plane'
import { PlaneLabel } from '../../components/PlaneLabel'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { approxEqual } from '../../linalg'
import type { Vec2 } from '../../linalg'
import { learn, lineText, mistakes, moveEmail, sameData, score, snapCount, verdict } from './classifier'
import { PRACTICE_START, solved } from './practice'
import type { Example } from './classifier'
import { ARROW_COLOR, AxisNames, Boundary, CentreMark, EmailDots, EmailPlane, NEW_COLOR } from './EmailPlot'
import { EMAILS, EMAIL_COLOR, VIEW_X, VIEW_Y } from './data'

/** Step 6: retrain on your own moved emails and test the line it learns. */
export function PracticeStep() {
  const [data, setData] = useState<Example[]>(EMAILS)
  const [e, setE] = useState<Vec2>(PRACTICE_START)
  const model = learn(data)
  // A challenge stays solved once it has been met, even after the points move on.
  const live = solved(data, model, e)
  const [ever, setEver] = useState<ReadonlySet<string>>(new Set())
  if ([...live].some((id) => !ever.has(id))) setEver(new Set([...ever, ...live]))
  const done = new Set([...ever, ...live])
  const wrong = model ? mistakes(model, data) : []
  const moved = data.filter((x, i) => !approxEqual(x.at[0], EMAILS[i].at[0]) || !approxEqual(x.at[1], EMAILS[i].at[1]))

  const items: Challenge[] = [
    {
      id: 'on-line',
      title: 'On the fence',
      task: (
        <p className="m-0">
          Move the <Tag color={NEW_COLOR}>new</Tag> email so it sits exactly on the learned line.
        </p>
      ),
      insight: (
        <p className="m-0">
          On the line, the score equals the threshold b exactly. Exactly on the line counts as
          normal here, because the rule is &ldquo;spam when the score is <em>above</em> b&rdquo;. With real features
          the scores are rarely whole numbers, so exact ties almost never happen.
        </p>
      ),
    },
    {
      id: 'one-link',
      title: 'Spam with a single link',
      task: <p className="m-0">Find a new email with exactly 1 link that the filter calls spam.</p>,
      insight: (
        <p className="m-0">
          No single feature decides. With one link, the &ldquo;!&rdquo; marks have to carry the score past the
          threshold on their own: on the original line, 1 + y &gt; 5 needs at least 5 of them.
        </p>
      ),
    },
    {
      id: 'move',
      title: 'Change what it learns',
      task: (
        <p className="m-0">
          Drag one of the <em>training</em> emails (N or S) so the learned line changes. Say to yourself why it moved
          before you read the answer.
        </p>
      ),
      insight: model && (
        <p className="m-0">
          You moved {moved.map((x) => x.name).join(', ') || 'nothing'}. That shifted a centre: they are now{' '}
          {fmtVec(model.centres.normal)} and {fmtVec(model.centres.spam)}, so d = {fmtVec(model.difference)}. The line
          turns to stay at right angles to d and moves to the new midpoint {fmtVec(model.midpoint)}. Training is just
          recomputing these averages.
        </p>
      ),
    },
    {
      id: 'fool',
      title: 'A line cannot please everyone',
      task: <p className="m-0">Move training emails until the learned line gets at least one of them wrong.</p>,
      insight: (
        <p className="m-0">
          {wrong.length > 0 && <>The line now misclassifies {wrong.map((x) => x.name).join(', ')}. </>}A straight line can only split the plane
          in two; when the groups overlap, some training emails land on the wrong side. The model keeps a direction
          and a cut-off, not a list of emails, so it cannot make exceptions.
        </p>
      ),
    },
  ]

  return (
    <Step
      n={6}
      kind="Practice"
      title="Retrain it yourself"
      layout="wide"
      visual={
        <>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={420}
            label="Draggable training emails, their centres and the line learned from them, plus a draggable new email"
          >
            {model && <Boundary w={model.w} b={model.b} x={VIEW_X} y={VIEW_Y} names={false} />}
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            {model && (
              <>
                <Arrow tail={model.centres.normal} tip={model.centres.spam} color={ARROW_COLOR} weight={2} opacity={0.6} showCoords={false} />
                <CentreMark at={model.centres.normal} kind="normal" attach="sw" />
                <CentreMark at={model.centres.spam} kind="spam" attach="ne" />
              </>
            )}
            <EmailDots data={data} wrong={wrong.map((x) => x.name)} />
            {data.map((x, i) => (
              <DraggablePoint
                key={x.name}
                value={x.at}
                onChange={(at) => setData((prev) => moveEmail(prev, i, at))}
                color={EMAIL_COLOR[x.kind]}
                snap={snapCount}
              />
            ))}
            <DraggablePoint value={e} onChange={setE} color={NEW_COLOR} snap={snapCount} />
            <PlaneLabel x={e[0]} y={e[1]} attach="e" distance={14} size={14} color={NEW_COLOR}>
              new
            </PlaneLabel>
          </EmailPlane>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" disabled={sameData(data, EMAILS)} onClick={() => setData(EMAILS)}>
              Put the training emails back
            </Button>
          </div>
          <Readout>
            {model ? (
              <>
                Learned line: {lineText(model.w, model.b)} (w = {fmtVec(model.w)}, b = {fmt(model.b)}).{' '}
                {wrong.length === 0
                  ? `All ${data.length} training emails are on the correct side.`
                  : `Wrong on ${wrong.map((x) => x.name).join(', ')} (circled).`}{' '}
                <Tag color={NEW_COLOR}>New email</Tag> {fmtVec(e)}: score {fmt(score(model.w, e))}, {verdict(model.w, model.b, e)}
                {verdict(model.w, model.b, e) === 'on the line' ? ' (counts as normal)' : ''}.
              </>
            ) : (
              'The two centres are in the same place, so there is no direction to learn. Move an email apart.'
            )}
          </Readout>
        </>
      }
    >
      <p>
        Here is the whole filter, live. The training emails can be dragged too: every time one moves, the filter
        retrains, which means recomputing the two centres, the direction and the midpoint. The w shown is d scaled so
        its largest entry is 1.
      </p>
      <p>
        The <Tag color={NEW_COLOR}>new</Tag> email is one the filter has not seen. Do the first two challenges
        before you move any training emails; &ldquo;Put the training emails back&rdquo; restores them.
      </p>
      <Challenges items={items} done={done} />
    </Step>
  )
}
