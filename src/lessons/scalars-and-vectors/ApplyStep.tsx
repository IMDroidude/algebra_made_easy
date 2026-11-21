import { Text } from 'mafs'
import { useState } from 'react'
import { NumpySnippet } from '../../components/NumpySnippet'
import { Arrow, CoordPoint, DraggablePoint, Plane } from '../../components/Plane'
import { Tex } from '../../components/Tex'
import { Button, Readout, Step, Tag, Toggle } from '../../components/ui'
import { fmt, fmtVec, isInteger, numpyVec } from '../../lib/format'
import { COLOR } from '../../lib/palette'
import { sub } from '../../linalg'
import { cleanZero2 } from '../../linalg/span'
import type { Vec2 } from '../../linalg'
import { WORDS, analogy, nearestWord } from './embeddings'
import type { AnalogyInput } from './embeddings'
import { numpyPrint1d } from './numpyOut'

const START: AnalogyInput = { king: WORDS.king, man: WORDS.man, woman: WORDS.woman }
const DRAGGABLE = ['king', 'man', 'woman'] as const

export function ApplyStep() {
  const [input, setInput] = useState<AnalogyInput>(START)
  const [showMove, setShowMove] = useState(true)

  const points: Record<string, Vec2> = { ...WORDS, ...input }
  const result = analogy(input)
  const shift = sub(input.woman, input.man)
  const best = nearestWord(points, result, DRAGGABLE)
  const integer = isInteger(...input.king, ...input.man, ...input.woman)
  const isMovable = (word: string) => (DRAGGABLE as readonly string[]).includes(word)
  const wordColor = (word: string) =>
    isMovable(word) ? COLOR.v : word === best.word ? COLOR.result : COLOR.ghost

  const code = [
    'import numpy as np',
    '',
    '# made-up 2D "embeddings"',
    numpyVec('king ', input.king),
    numpyVec('man  ', input.man),
    numpyVec('woman', input.woman),
    '',
    'result = king - man + woman',
    'print(result)',
  ].join('\n')

  return (
    <Step
      n={5}
      kind="Apply"
      title="Words as points: king − man + woman"
      visual={
        <>
          <Plane label="Seven words as points in a made-up two-dimensional embedding space; king, man and woman can be dragged">
            {showMove && (
              <>
                <Arrow tail={input.man} tip={input.woman} color={COLOR.j} dashed opacity={0.8} weight={2} />
                <Arrow tail={input.king} tip={result} color={COLOR.j} dashed opacity={0.8} weight={2} />
              </>
            )}
            {/* Labels first, so the points' drag and hover targets sit on top of them. */}
            {Object.entries(points).map(([word, q]) => (
              <Text
                key={word}
                x={q[0]}
                y={q[1]}
                attach={isMovable(word) ? 'e' : 'w'}
                attachDistance={isMovable(word) ? 22 : 14}
                size={14}
                color={wordColor(word)}
              >
                {word}
              </Text>
            ))}
            <Text x={result[0]} y={result[1]} attach="e" attachDistance={12} size={13} color={COLOR.result}>
              ★ result
            </Text>
            <CoordPoint at={result} color={COLOR.result} />
            {Object.entries(points).map(([word, q]) =>
              isMovable(word) ? (
                <DraggablePoint
                  key={word}
                  value={q}
                  onChange={(next) => setInput({ ...input, [word]: cleanZero2(next) })}
                  color={wordColor(word)}
                />
              ) : (
                <CoordPoint key={word} at={q} color={wordColor(word)} />
              ),
            )}
          </Plane>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Toggle checked={showMove} onChange={setShowMove}>
              Show the man → woman move
            </Toggle>
            <Button variant="secondary" onClick={() => setInput(START)}>
              Reset the words
            </Button>
          </div>
          <Readout>
            <Tag color={COLOR.v}>king</Tag> {fmtVec(input.king)} − <Tag color={COLOR.v}>man</Tag>{' '}
            {fmtVec(input.man)} + <Tag color={COLOR.v}>woman</Tag> {fmtVec(input.woman)} ={' '}
            <Tag color={COLOR.result}>result {fmtVec(result)}</Tag>. The nearest other word is{' '}
            <strong>{best.word}</strong> at {fmtVec(points[best.word])}, a distance of{' '}
            {fmt(best.distance)} away.
          </Readout>
          <div className="mt-4">
            <NumpySnippet code={code} output={numpyPrint1d(result, integer)} />
          </div>
        </>
      }
    >
      <p>
        Language models turn every word (strictly, every <em>token</em>) into a vector called an{' '}
        <strong>embedding</strong>. Each word becomes a point, and the model learns to put words used
        in similar ways close together.
      </p>
      <p>
        Read the vectors both ways from step 1. Each word is a <strong>position</strong>. The
        difference between two words is a <strong>displacement</strong>: woman − man ={' '}
        {fmtVec(shift)} is &ldquo;the move from man to woman&rdquo;. Apply that same move starting
        from king instead:
      </p>
      <Tex block>{String.raw`\text{king} - \text{man} + \text{woman} = \text{king} + (\text{woman} - \text{man})`}</Tex>
      <p>
        The two dashed arrows are the same displacement drawn from two starting points. The result
        lands near <strong>queen</strong>, though not exactly on it. Real embeddings behave like
        this too: the arithmetic gets you close, and you take the nearest word. (The usual rule
        leaves out the three words you started from, so the answer cannot just be &ldquo;king&rdquo;.)
      </p>
      <p>
        Drag king, man or woman and watch the result move. Try dragging woman far away: the
        &ldquo;move&rdquo; changes, and the nearest word may stop being queen.
      </p>
      <p className="text-sm text-muted">
        Honesty about this picture: these seven points and their numbers are invented. Real
        embeddings have hundreds or thousands of entries, learned from text, and no single entry
        means &ldquo;royal&rdquo; or &ldquo;female&rdquo;. The analogy also works far less neatly in
        real models than this famous example suggests. But the arithmetic is exactly what you see:
        subtract, add, entry by entry.
      </p>
    </Step>
  )
}
