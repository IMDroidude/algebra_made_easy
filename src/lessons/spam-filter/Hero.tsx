import { Arrow } from '../../components/Plane'
import { Readout, Tag } from '../../components/ui'
import { fmtVec } from '../../lib/format'
import { lineText, mistakes } from './classifier'
import { ARROW_COLOR, AxisNames, Boundary, CentreMark, EmailDots, EmailPlane, LINE_COLOR } from './EmailPlot'
import { EMAILS, EMAIL_COLOR, MODEL, VIEW_X, VIEW_Y } from './data'

/** The whole lesson in one picture, before step 1: what you are about to build. */
export function Hero() {
  const { centres, w, b } = MODEL
  return (
    <section aria-labelledby="whole-story" className="border-t border-line py-10">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="prose-lesson max-w-[62ch]">
          <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">The whole story in one picture</p>
          <h2 id="whole-story" className="mt-1 mb-4 font-display text-3xl leading-tight">
            8 emails, 8 points, 1 line
          </h2>
          <p>
            Here is where this lesson ends up. Each dot is an email you met in lesson 1.2, placed by how many links
            and how many &ldquo;!&rdquo; marks it has. The <Tag color={EMAIL_COLOR.normal}>normal</Tag> ones sit near
            the origin; the <Tag color={EMAIL_COLOR.spam}>spam</Tag> sits up and to the right.
          </p>
          <p>
            By the end you will have worked out every piece of this picture yourself: the centre of each group,
            the <Tag color={ARROW_COLOR}>arrow</Tag> between them, and the <Tag color={LINE_COLOR}>line</Tag> that
            splits the plane. Then the line can judge emails it has never seen.
          </p>
        </div>
        <div>
          <EmailPlane
            x={VIEW_X}
            y={VIEW_Y}
            height={360}
            label="Eight emails as points, the centre of each group, an arrow from the normal centre to the spam centre, and the learned boundary line"
          >
            <Boundary w={w} b={b} x={VIEW_X} y={VIEW_Y} />
            <AxisNames x={VIEW_X} y={VIEW_Y} />
            <EmailDots data={EMAILS} />
            <Arrow tail={centres.normal} tip={centres.spam} color={ARROW_COLOR} weight={3} showCoords={false} />
            <CentreMark at={centres.normal} kind="normal" attach="sw" />
            <CentreMark at={centres.spam} kind="spam" attach="ne" />
          </EmailPlane>
          <Readout>
            Normal centre {fmtVec(centres.normal)}, spam centre {fmtVec(centres.spam)}. The learned line is{' '}
            {lineText(w, b)}: every email above it is called spam, and {EMAILS.length - mistakes(MODEL, EMAILS).length} of{' '}
            {EMAILS.length} land on the correct side.
          </Readout>
        </div>
      </div>
    </section>
  )
}
