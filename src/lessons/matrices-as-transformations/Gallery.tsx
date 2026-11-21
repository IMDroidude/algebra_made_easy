import { Line, Polygon } from 'mafs'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, Plane } from '../../components/Plane'
import { Slider } from '../../components/Slider'
import { Tex } from '../../components/Tex'
import { Button, Readout, Toggle } from '../../components/ui'
import { COLOR } from '../../lib/palette'
import { columns2 } from '../../linalg'
import type { Mat2 } from '../../linalg'
import {
  DEFAULT_PARAMS,
  FAMILIES,
  MIRRORS,
  SCALE_RANGE,
  SHEAR_RANGE,
  THETA_RANGE,
  UNIT_SQUARE,
  describe,
  familyMatrix,
  matrixTex,
  mirrorById,
  squareImage,
  squareSnippet,
} from './galleryMath'
import type { Family, FamilyId, GalleryParams } from './galleryMath'

/**
 * Four cards, one per family of transformations. Each has a small live plane
 * (unit square before as an outline, after as a filled shape) and one control.
 */
export function Gallery({ onTry }: { onTry: (m: Mat2) => void }) {
  const [params, setParams] = useState<GalleryParams>(DEFAULT_PARAMS)
  const [selected, setSelected] = useState<FamilyId>('rotation')
  const [showCode, setShowCode] = useState(false)

  const set = (id: FamilyId, patch: Partial<GalleryParams>) => {
    setParams({ ...params, ...patch })
    setSelected(id)
  }

  const controls: Record<FamilyId, ReactNode> = {
    rotation: (
      <Slider
        name="θ (degrees)"
        value={params.theta}
        onChange={(theta) => set('rotation', { theta })}
        {...THETA_RANGE}
      />
    ),
    scaling: (
      <div className="grid grid-cols-2 gap-3">
        <Slider name="sx" value={params.sx} onChange={(sx) => set('scaling', { sx })} {...SCALE_RANGE} accent={COLOR.i} />
        <Slider name="sy" value={params.sy} onChange={(sy) => set('scaling', { sy })} {...SCALE_RANGE} accent={COLOR.j} />
      </div>
    ),
    reflection: (
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1 text-sm font-medium">Mirror line</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {MIRRORS.map((mirror) => (
            <label key={mirror.id} className="inline-flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="gallery-mirror"
                checked={params.mirror === mirror.id}
                onChange={() => set('reflection', { mirror: mirror.id })}
              />
              {mirror.label}
            </label>
          ))}
        </div>
      </fieldset>
    ),
    shear: <Slider name="k" value={params.k} onChange={(k) => set('shear', { k })} {...SHEAR_RANGE} />,
  }

  const chosen = FAMILIES.find((f) => f.id === selected)!
  const snippet = squareSnippet(familyMatrix(selected, params))

  return (
    <section aria-labelledby="gallery" className="border-t border-line py-10">
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">
        Transformation gallery
      </p>
      <h2 id="gallery" className="mt-1 mb-5 font-display text-3xl leading-tight">
        Four families you will meet everywhere
      </h2>
      <div className="prose-lesson max-w-[62ch]">
        <p>
          Most matrices you meet are one of these four moves, or several of them in a row. Each
          card shows the <strong>unit square</strong> before (dashed outline) and after (filled).
          Move the control and read the columns: they are still where î and ĵ land.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2" data-testid="gallery-grid">
        {FAMILIES.map((family) => (
          <GalleryCard
            key={family.id}
            family={family}
            matrix={familyMatrix(family.id, params)}
            params={params}
            control={controls[family.id]}
            onTry={onTry}
          />
        ))}
      </div>
      <div className="mt-6">
        <Toggle checked={showCode} onChange={setShowCode}>
          Show the NumPy for the card you last changed ({chosen.name.toLowerCase()})
        </Toggle>
        {showCode && (
          <div className="mt-3">
            <NumpySnippet code={snippet.code} output={snippet.output} />
            <p className="mt-2 text-sm text-muted">
              Putting the four corners side by side as columns lets one <code>@</code> move them
              all at once. Each output column is where one corner lands.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function GalleryCard({
  family,
  matrix,
  params,
  control,
  onTry,
}: {
  family: Family
  matrix: Mat2
  params: GalleryParams
  control: ReactNode
  onTry: (m: Mat2) => void
}) {
  const [iHat, jHat] = columns2(matrix)
  const headingId = `gallery-${family.id}`
  return (
    <article
      aria-labelledby={headingId}
      className="min-w-0 rounded-xl border border-line bg-surface p-4"
    >
      <h3 id={headingId} className="m-0 font-display text-xl">
        {family.name}
      </h3>
      <p className="mt-1 mb-2 text-sm text-muted">{family.meaning}</p>
      <div className="flex flex-wrap items-center gap-x-4 text-sm">
        <span>
          General: <Tex>{family.general}</Tex>
        </span>
        <span>
          Now: <Tex>{matrixTex(matrix)}</Tex>
        </span>
      </div>
      <div className="mx-auto mt-3 max-w-[280px]">
        <Plane label={`${family.name}: the unit square before and after`} extent={2.5} height={230}>
          {family.id === 'reflection' && (
            <Line.Segment
              point1={mirrorById(params.mirror).line[0]}
              point2={mirrorById(params.mirror).line[1]}
              color={COLOR.ghost}
              style="dashed"
            />
          )}
          <Polygon points={UNIT_SQUARE} color={COLOR.ghost} fillOpacity={0} strokeStyle="dashed" />
          <Polygon points={squareImage(matrix)} color={COLOR.result} fillOpacity={0.3} />
          <Arrow tip={iHat} color={COLOR.i} label="î" weight={2.5} labelDistance={8} />
          <Arrow tip={jHat} color={COLOR.j} label="ĵ" weight={2.5} labelDistance={8} />
        </Plane>
      </div>
      <div className="mt-3">{control}</div>
      <Readout>{describe(matrix)}</Readout>
      <Button
        variant="secondary"
        className="mt-3"
        aria-label={`Try ${family.name.toLowerCase()} in step 2`}
        onClick={() => onTry(matrix)}
      >
        Try it in step 2
      </Button>
    </article>
  )
}
