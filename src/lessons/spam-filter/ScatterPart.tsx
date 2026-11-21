import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'

import { Tex } from '../../components/Tex'
import { Readout, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { sub } from '../../linalg'
import type { Mat2, Vec2 } from '../../linalg'
import { fisherDirection, lineText, mistakes, pointsOf, withinScatter } from './classifier'
import type { Example, Model } from './classifier'
import { AxisNames, Boundary, EmailDots, EmailPlane, LINE_COLOR } from './EmailPlot'
import {
  EMAILS,
  MODEL,
  STRETCHED,
  STRETCHED_FISHER,
  STRETCHED_PLAIN,
  STRETCHED_VIEW_X,
  STRETCHED_VIEW_Y,
  VIEW_X,
  VIEW_Y,
} from './data'
import { scatterSnippet } from './snippets'

const matTex = (m: Mat2) => String.raw`\begin{bmatrix} ${fmt(m[0][0])} & ${fmt(m[0][1])} \\ ${fmt(m[1][0])} & ${fmt(m[1][1])} \end{bmatrix}`
const colTex = (v: Vec2) => String.raw`\begin{bmatrix} ${fmt(v[0])} \\ ${fmt(v[1])} \end{bmatrix}`

const SW = withinScatter(EMAILS)
const FISHER = fisherDirection(EMAILS) as Vec2
const DEVIATIONS = pointsOf(EMAILS, 'normal').map((p) => sub(p, MODEL.centres.normal))

type Inbox = 'round' | 'stretched'

const INBOX: Record<Inbox, { data: Example[]; x: [number, number]; y: [number, number]; plain: Pick<Model, 'w' | 'b'>; fisher: Pick<Model, 'w' | 'b'> }> = {
  round: { data: EMAILS, x: VIEW_X, y: VIEW_Y, plain: MODEL, fisher: MODEL },
  stretched: { data: STRETCHED, x: STRETCHED_VIEW_X, y: STRETCHED_VIEW_Y, plain: STRETCHED_PLAIN, fisher: STRETCHED_FISHER },
}

const names = (list: Example[]) => (list.length === 0 ? 'none' : list.map((e) => e.name).join(' and '))

/** The optional part of step 4: within-class scatter, Fisher's direction, and when it matters. */
export function ScatterPart() {
  const [inbox, setInbox] = useState<Inbox>('round')
  const box = INBOX[inbox]
  const plainWrong = mistakes(box.plain, box.data)
  const fisherWrong = mistakes(box.fisher, box.data)
  const sw = withinScatter(box.data)
  const snippet = scatterSnippet(box.data)

  return (
    <div className="mt-4">
      <p>
        The difference of the centres ignores one thing: how spread out each group is. The <strong>within-class
        scatter matrix</strong> measures that. Take every email minus its own group&rsquo;s centre (its deviation),
        multiply each deviation by itself as an outer product (column times row, a 2×2 matrix), and add them all up:
      </p>
      <Tex block>
        {String.raw`S_w = \sum_{\text{normal}} (\mathbf{x}-\mu_{\text{normal}})(\mathbf{x}-\mu_{\text{normal}})^{\mathsf T} + \sum_{\text{spam}} (\mathbf{x}-\mu_{\text{spam}})(\mathbf{x}-\mu_{\text{spam}})^{\mathsf T}`}
      </Tex>
      <p>
        The normal deviations are {DEVIATIONS.map((v) => fmtVec(v)).join(', ')}. The spam ones are the same four
        steps around (4, 4). Each group adds up to 2 on the diagonal, so
      </p>
      <Tex block>{String.raw`S_w = ${matTex(SW)} = 4I`}</Tex>
      <p>
        The zeros say that, inside a group, links and &ldquo;!&rdquo; marks do not rise and fall together. The equal
        4s say each cloud is round. Now the improved direction:
      </p>
      <Tex block>
        {String.raw`\mathbf{w} = S_w^{-1}\,\mathbf{d} = \tfrac{1}{4} I ${colTex(MODEL.difference)} = ${colTex(FISHER)}`}
      </Tex>
      <p>
        That is (0.75, 0.75): the same direction as (1, 1), so nothing changes. This recipe is{' '}
        <strong>Fisher&rsquo;s linear discriminant</strong>, here in its simplest case. When both clouds are round and
        the same size, S_w is a multiple of I and the plain difference d is already the best direction.
      </p>
      <p>
        When the clouds are stretched, it is not. Switch to a made-up second inbox where the number of links varies a
        lot inside each group:
      </p>
      <fieldset className="m-0 mb-3 flex flex-wrap gap-x-5 gap-y-1 border-0 p-0">
        <legend className="sr-only">Which inbox</legend>
        {(['round', 'stretched'] as const).map((k) => (
          <label key={k} className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="scatter-inbox" checked={inbox === k} onChange={() => setInbox(k)} />
            {k === 'round' ? 'Our emails (round clouds)' : 'A stretched inbox'}
          </label>
        ))}
      </fieldset>
      <EmailPlane
        x={box.x}
        y={box.y}
        height={300}
        label="An inbox with the plain line from the difference of centres (dashed) and the line from Fisher's direction (solid)"
      >
        <Boundary w={box.plain.w} b={box.plain.b} x={box.x} y={box.y} shade={false} names={false} color={COLOR.ghost} dashed />
        <Boundary w={box.fisher.w} b={box.fisher.b} x={box.x} y={box.y} names={false} />
        <AxisNames x={box.x} y={box.y} />
        <EmailDots data={box.data} wrong={plainWrong.map((e) => e.name)} />
      </EmailPlane>
      <Readout>
        S_w = [[{fmt(sw[0][0])}, {fmt(sw[0][1])}], [{fmt(sw[1][0])}, {fmt(sw[1][1])}]].{' '}
        <Tag color={COLOR.ghost}>Plain line (dashed)</Tag>: {lineText(box.plain.w, box.plain.b)}, wrong on{' '}
        {names(plainWrong)}. <Tag color={LINE_COLOR}>Fisher line (solid)</Tag>: {lineText(box.fisher.w, box.fisher.b)},
        wrong on {names(fisherWrong)}.
        {inbox === 'round' && ' Here the two lines are the same line.'}
      </Readout>
      {inbox === 'stretched' && (
        <p className="mt-3">
          The centres still differ by (2, 2), so the plain recipe still says w = (1, 1). But S_w = [[36, 0], [0, 4]]:
          links spread nine times as much as &ldquo;!&rdquo; marks (in squared steps). S_w⁻¹ turns down the noisy
          feature, so w = (1/18, 1/2), which scales to (1, 9): the line tilts until it leans on the reliable
          &ldquo;!&rdquo; marks and gets every email right.
        </p>
      )}
      <div className="mt-4">
        <NumpySnippet code={snippet.code} output={snippet.output} />
      </div>
      <p className="mt-3 text-sm text-muted">
        <code>dev_n.T @ dev_n</code> adds up the outer products of all the rows in one step. <code>np.linalg.solve(S,
        d)</code> computes S⁻¹d without forming the inverse.
      </p>
    </div>
  )
}
