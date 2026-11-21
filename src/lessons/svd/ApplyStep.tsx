import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Tex } from '../../components/Tex'
import { Readout, Step } from '../../components/ui'
import { fmt } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { frobenius, lowRank, lowRankStorage, svd } from '../../linalg/svd'
import { houseImage, SIZE } from './image'
import { PixelImage } from './PixelImage'
import { imageCode, imageOutput, numpyRank } from './snippets'

const IMAGE = houseImage()
const DECOMP = svd(IMAGE)
const NORM = frobenius(IMAGE)
const RANK = numpyRank(DECOMP.s, SIZE, SIZE)

/** Bar chart of all singular values, the kept ones highlighted. */
function SigmaBars({ s, k }: { s: number[]; k: number }) {
  const w = 320
  const h = 110
  const bar = w / s.length
  const max = s[0]
  return (
    <svg
      viewBox={`0 0 ${w} ${h + 18}`}
      role="img"
      aria-label={`Bar chart of the ${s.length} singular values, largest first; the first ${k} are kept`}
      className="block w-full"
    >
      {s.map((x, i) => {
        const bh = Math.max(x > 1e-9 ? 1 : 0, (x / max) * h)
        return (
          <rect
            key={i}
            x={i * bar + 1}
            y={h - bh}
            width={bar - 2}
            height={bh}
            fill={i < k ? COLOR.result : COLOR.ghost}
            opacity={i < k ? 1 : 0.45}
          />
        )
      })}
      <line x1={0} x2={w} y1={h} y2={h} stroke="currentColor" strokeOpacity={0.4} />
      <text x={bar * 1.3} y={12} fontSize={11} fill="currentColor">
        σ₁ = {fmt(s[0], 1)}
      </text>
      <text x={0} y={h + 14} fontSize={11} fill="currentColor" opacity={0.7}>
        σ₁
      </text>
      <text x={w - 4} y={h + 14} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="end">
        σ₃₂
      </text>
    </svg>
  )
}

export function ApplyStep() {
  const [k, setK] = useState(4)
  const approx = lowRank(DECOMP, k)
  const err = frobenius(IMAGE.map((row, i) => row.map((x, j) => x - approx[i][j]))) / NORM
  const stored = lowRankStorage(SIZE, SIZE, k)
  const full = SIZE * SIZE
  const saving = stored < full

  return (
    <Step
      n={5}
      kind="Apply"
      title="Compress an image by keeping the biggest singular values"
      visual={
        <>
          <div className="grid grid-cols-2 gap-4">
            <PixelImage values={IMAGE} label="The original 32 by 32 picture of a house under the sun" caption="Original, 1024 numbers" />
            <PixelImage
              values={approx}
              label={`The picture rebuilt from the ${k} largest singular values`}
              caption={`Rebuilt from k = ${k}`}
            />
          </div>
          <label className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span>
              Keep the largest <strong>k</strong> singular values
            </span>
            <input
              type="range"
              min={1}
              max={SIZE}
              step={1}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-48"
            />
            <span className="w-14 font-mono">k = {k}</span>
          </label>
          <div className="mt-3">
            <SigmaBars s={DECOMP.s} k={k} />
          </div>
          <Readout>
            <span className="block">
              Keeping k = {k}: {stored} numbers instead of {full} ({fmt((100 * stored) / full, 0)}%
              of the original). Error {fmt(100 * err, 1)}% of the picture&rsquo;s total size.
            </span>
            <span className="mt-1 block font-semibold">
              {!saving
                ? `No saving any more: from k = 16 the three pieces hold more numbers than the picture itself.`
                : k >= RANK
                  ? `The picture has rank ${RANK}, so k = ${k} rebuilds it exactly while still saving space.`
                  : k === 1
                    ? 'One singular value gives one row pattern times one column pattern: only stripes.'
                    : `The other ${RANK - k} non-zero singular values are left out (the last ${SIZE - RANK} are zero anyway).`}
            </span>
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={imageCode(k)} output={imageOutput(k, DECOMP.s, err)} />
          </div>
        </>
      }
    >
      <p>
        A greyscale picture is a matrix: one number per pixel, 0 for black and 1 for white. This
        one is 32×32, so 1024 numbers. Its SVD writes it as a sum of simple layers, each one a
        column pattern times a row pattern, weighted by a singular value:
      </p>
      <Tex block>
        {String.raw`\text{img} = \sigma_1\,\mathbf{u}_1\mathbf{v}_1^{\mathsf T} + \sigma_2\,\mathbf{u}_2\mathbf{v}_2^{\mathsf T} + \dots + \sigma_{32}\,\mathbf{u}_{32}\mathbf{v}_{32}^{\mathsf T}`}
      </Tex>
      <p>
        The σ&rsquo;s come sorted largest first, and the bar chart shows how fast they fall. Keep
        only the first <strong>k</strong> layers and you have an approximation that needs k
        columns of U, k rows of Vᵀ and k numbers σ: k × (32 + 32 + 1) numbers. Slide k and watch
        the picture sharpen.
      </p>
      <p>
        This is the <strong>low-rank approximation</strong> from the lesson on rank: each layer
        has rank 1, so k layers make a rank-k matrix. Of all rank-k matrices, the SVD one is the
        closest to the original (a result called the Eckart–Young theorem). The picture&rsquo;s
        full rank is {RANK}; from k = {RANK} on, the error is zero.
      </p>
      <p>
        The same idea runs through ML: compressing a big weight matrix into two thin ones
        (the intuition behind LoRA-style fine-tuning), recommendation systems, and denoising.
        Small singular values often carry noise rather than signal.
      </p>
      <p>
        In the code, <code>np.mgrid</code> builds row and column numbers for every pixel, and{' '}
        <code>img[condition] = value</code> paints every pixel where the condition is true.{' '}
        <code>U[:, :k]</code> takes the first k columns, <code>Vt[:k, :]</code> the first k rows.
      </p>
      <p className="text-sm text-muted">
        Honest limits: real photos are much bigger and less blocky, so they need more layers, and
        formats such as JPEG use a different method. The 32×32 picture is just small enough to see
        every pixel.
      </p>
    </Step>
  )
}
