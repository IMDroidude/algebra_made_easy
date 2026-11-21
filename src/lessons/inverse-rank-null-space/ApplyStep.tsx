import { Line } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { DraggableArrow, Plane, TransformedGrid } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag } from '../../components/ui'
import { fmt, fmtVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { lowRankParams, nullSpace2, outer2, rank2 } from '../../linalg/systems'
import type { Vec2 } from '../../linalg'
import { lowRankSnippet } from './data'
import { RANK_SHAPE, count, texMat2 } from './text'

const DIMS = [768, 4096] as const
const RANKS = [1, 4, 8, 16] as const

/** -0 (from snapping) would read as 0 in the code but behave as -0 in the maths. */
const tidy = (v: Vec2): Vec2 => [v[0] + 0, v[1] + 0]

export function ApplyStep() {
  const [u, setU] = useState<Vec2>([2, 1])
  const [v, setV] = useState<Vec2>([1, -0.5])
  const [d, setD] = useState<number>(4096)
  const [r, setR] = useState<number>(8)

  const dW = outer2(u, v)
  const rank = rank2(dW)
  const ns = nullSpace2(dW)
  const { full, factored } = lowRankParams(d, r)
  const snippet = lowRankSnippet(u, v, d, r)

  return (
    <Step
      n={5}
      kind="Apply"
      title="Low rank: the idea behind cheap fine-tuning"
      visual={
        <>
          <Plane label="The plane after a matrix built as a column u times a row v">
            <TransformedGrid matrix={dW} color={COLOR.grid} />
            {ns.dim === 1 && (
              <Line.ThroughPoints point1={[0, 0]} point2={ns.direction} color={COLOR.ghost} style="dashed" weight={1.5} />
            )}
            <DraggableArrow value={u} onChange={(p) => setU(tidy(p))} color={COLOR.v} label="u" />
            <DraggableArrow value={v} onChange={(p) => setV(tidy(p))} color={COLOR.result} label="v" />
          </Plane>
          <Readout>
            <Tag color={COLOR.v}>u</Tag> = {fmtVec(u)}, <Tag color={COLOR.result}>v</Tag> = {fmtVec(v)}.
            The update ΔW = u vᵀ has rank {rank}: every output lies on {RANK_SHAPE[rank]}
            {rank === 1 && ', the line through u'}.
            {ns.dim === 1 &&
              ` Inputs along ${fmtVec(ns.direction)} (dashed), at right angles to v, are sent to zero.`}
          </Readout>
          <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
            <p className="m-0 font-semibold">How many numbers does the update take?</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="w-28">Layer size d:</span>
              {DIMS.map((x) => (
                <Button key={x} variant={x === d ? 'primary' : 'secondary'} aria-pressed={x === d} onClick={() => setD(x)}>
                  {count(x)}
                </Button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="w-28">Rank r:</span>
              {RANKS.map((x) => (
                <Button key={x} variant={x === r ? 'primary' : 'secondary'} aria-pressed={x === r} onClick={() => setR(x)}>
                  {x}
                </Button>
              ))}
            </div>
            <p className="mt-3 mb-0" aria-live="polite">
              Full {count(d)}×{count(d)} update: <strong>{count(full)}</strong> numbers. As B (
              {count(d)}×{r}) times A ({r}×{count(d)}): <strong>{count(factored)}</strong> numbers,{' '}
              {fmt((100 * factored) / full)}% of the full size.
            </p>
          </div>
          <div className="mt-4">
            <NumpySnippet code={snippet.code} output={snippet.output} />
          </div>
        </>
      }
    >
      <p>
        Rank tells you how many independent directions a matrix really uses. A{' '}
        <strong>low-rank</strong> matrix is big on paper but simple underneath: its outputs live in
        a small subspace.
      </p>
      <p>
        The simplest case is a column times a row. Drag <Tag color={COLOR.v}>u</Tag> and{' '}
        <Tag color={COLOR.result}>v</Tag>:
      </p>
      <Tex block>
        {String.raw`\Delta W = \textcolor{${COLOR.v}}{\mathbf{u}}\,\textcolor{${COLOR.result}}{\mathbf{v}}^{\mathsf T} = \begin{bmatrix} ${fmt(u[0])} \\ ${fmt(u[1])} \end{bmatrix} \begin{bmatrix} ${fmt(v[0])} & ${fmt(v[1])} \end{bmatrix} = ${texMat2(dW)}`}
      </Tex>
      <p>
        Four numbers in, a full 2×2 matrix out, and the grid always collapses onto the line through
        u. Geometrically, ΔW measures how much of the input points along v, and outputs that much
        of u. Whatever is at right angles to v is ignored: that is the null space.
      </p>
      <p>
        This is the intuition behind <strong>low-rank fine-tuning</strong> methods such as LoRA.
        Adapting a trained model means adding an update ΔW to a weight matrix W. Such methods bet
        that the update only needs a few directions, so instead of learning all d × d numbers they
        learn two thin matrices, B (d × r) and A (r × d), and use ΔW = BA. The numbers under the
        plane show what that saves for a layer of size d.
      </p>
      <p className="text-sm text-muted">
        What this leaves out: in 2D the only ranks are 0, 1 and 2, so the picture can only show
        rank 1. A real layer might have d = 4096 and r = 8: its update can only push outputs in 8 of
        the 4096 directions. This is the geometric idea only, not a recipe for how LoRA is trained
        or applied.
      </p>
    </Step>
  )
}
