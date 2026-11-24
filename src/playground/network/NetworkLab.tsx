import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Slider } from '../../components/Slider'
import { Tex } from '../../components/Tex'
import { Button, Tag, Toggle } from '../../components/ui'
import { fmt } from '../../lib/format'
import { cloneNetwork, countCorrect, createNetwork, meanLoss, mulberry32, predict, trainEpoch } from '../../linalg/neuralNet'
import type { Activation, Network, Sample } from '../../linalg/neuralNet'
import { EXPERIMENTS } from './experiments'
import type { Setup } from './experiments'
import { DATASET_IDS, DATASET_INFO, KINDS, makeDataset, toInput, toSamples } from './datasets'
import type { Animal, Dataset, DatasetId } from './datasets'
import { GRID, NEGATIVE, POSITIVE, fieldValues, linkWidth, rgb, shade } from './field'

const MAX_LAYERS = 2
const MAX_NEURONS = 6
const HISTORY = 200
const RATES = [0.003, 0.01, 0.03, 0.1, 0.3]
const ACTIVATIONS: { id: Activation; label: string }[] = [
  { id: 'tanh', label: 'Tanh' },
  { id: 'relu', label: 'ReLU' },
  { id: 'linear', label: 'Linear (none)' },
]

type Run = {
  net: Network
  epoch: number
  trainLoss: number
  testLoss: number
  correct: number
  /** [training loss, test loss] since epoch 0, one entry every `stride` epochs. */
  history: [number, number][]
  stride: number
}

const inputNames = (id: DatasetId): [string, string] => (id === 'ring' ? ['x₁', 'x₂'] : ['size', 'stripes'])

const signed = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}`

/** Everything that defines one training run. Replaced, never changed in place. */
type Lab = { setup: Setup; seed: number; run: Run }

const datasets = new Map<DatasetId, { data: Dataset; train: Sample[]; test: Sample[] }>()
function load(id: DatasetId) {
  let entry = datasets.get(id)
  if (!entry) {
    const data = makeDataset(id)
    entry = { data, train: toSamples(data.train), test: toSamples(data.test) }
    datasets.set(id, entry)
  }
  return entry
}

function start(setup: Setup, seed: number): Lab {
  const { train, test } = load(setup.dataset)
  const net = createNetwork([2, ...setup.hidden, 1], setup.activation, mulberry32(seed))
  const trainLoss = meanLoss(net, train)
  const testLoss = meanLoss(net, test)
  const run = { net, epoch: 0, trainLoss, testLoss, correct: countCorrect(net, train), history: [[trainLoss, testLoss]], stride: 1 }
  return { setup, seed, run: run as Run }
}

function advance(lab: Lab, rate: number): Lab {
  const { train, test } = load(lab.setup.dataset)
  const net = cloneNetwork(lab.run.net)
  trainEpoch(net, train, rate)
  const trainLoss = meanLoss(net, train)
  const testLoss = meanLoss(net, test)
  const epoch = lab.run.epoch + 1
  let { history, stride } = lab.run
  if (epoch % stride === 0) history = [...history, [trainLoss, testLoss]]
  if (history.length > 2 * HISTORY) {
    // keep the whole curve but at half the detail, so a long run stays cheap to draw
    history = history.filter((_, i) => i % 2 === 0)
    stride *= 2
  }
  return { ...lab, run: { net, epoch, trainLoss, testLoss, correct: countCorrect(net, train), history, stride } }
}

export function NetworkLab() {
  const [lab, setLab] = useState<Lab>(() => start({ dataset: 'cat-tiger', hidden: [4, 2], activation: 'tanh' }, 1))
  const [rate, setRate] = useState(0.03)
  const [playing, setPlaying] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [probe, setProbe] = useState<[number, number]>([5, 5])

  const { setup, run } = lab
  const { dataset: datasetId, hidden, activation } = setup
  const hiddenKey = hidden.join(',')
  const { data, train } = load(datasetId)

  const step = useCallback(() => setLab((l) => advance(l, rate)), [rate])

  useEffect(() => {
    if (!playing) return
    // At most 60 epochs a second, whatever the screen's refresh rate.
    let last = 0
    let id = requestAnimationFrame(function frame(now) {
      if (now - last > 15) {
        last = now
        step()
      }
      id = requestAnimationFrame(frame)
    })
    return () => cancelAnimationFrame(id)
  }, [playing, step])

  const change = (next: Partial<Setup>) => {
    setPlaying(false)
    setLab((l) => start({ ...l.setup, ...next }, l.seed))
  }
  const restart = () => {
    setPlaying(false)
    setLab((l) => start(l.setup, l.seed + 1))
  }
  const loadExperiment = (e: Setup) => {
    setPlaying(false)
    setRate(0.03)
    setLab(start({ dataset: e.dataset, hidden: e.hidden, activation: e.activation }, 1))
  }
  const setNeurons = (layer: number, n: number) =>
    change({ hidden: hidden.map((h, i) => (i === layer ? Math.min(MAX_NEURONS, Math.max(1, n)) : h)) })

  // ---- drawing -------------------------------------------------------------
  const heatRef = useRef<HTMLCanvasElement>(null)
  const diagramRef = useRef<HTMLCanvasElement>(null)
  const { net, epoch } = run
  useEffect(() => {
    const fields = fieldValues(net)
    const heat = heatRef.current?.getContext('2d')
    if (!heat) return // no canvas support (for example in unit tests)
    const image = heat.createImageData(GRID, GRID)
    const paint = (field: Float32Array) => {
      for (let i = 0; i < field.length; i++) {
        const [r, g, b] = shade(field[i])
        image.data[i * 4] = r
        image.data[i * 4 + 1] = g
        image.data[i * 4 + 2] = b
        image.data[i * 4 + 3] = 255
      }
      heat.putImageData(image, 0, 0)
    }
    const diagram = diagramRef.current
    const ctx = diagram?.getContext('2d')
    if (diagram && ctx) drawDiagram(diagram, ctx, net, fields, paint, heatRef.current!, data)
    paint(fields[fields.length - 1])
  }, [net, epoch, data])

  // ---- derived text --------------------------------------------------------
  const probeOut = predict(net, toInput(probe[0], probe[1]))
  const verdict = probeOut > 0 ? data.positive : data.negative
  const allCorrect = run.correct === train.length
  const oneLine = hidden.length === 0 || activation === 'linear'
  const isRing = datasetId === 'ring'
  const names = inputNames(datasetId)
  const active = EXPERIMENTS.find(
    (e) => e.dataset === datasetId && e.activation === activation && e.hidden.join(',') === hiddenKey,
  )

  let status: string
  if (allCorrect) {
    status = `Every training example is on the correct side. Loss keeps falling as the network grows more confident.`
  } else if (epoch < 150) {
    status = epoch === 0 ? 'Untrained: the weights are random. Press Play.' : 'Training…'
  } else if (oneLine) {
    status =
      hidden.length === 0
        ? 'Not solved, and it will not be: with no hidden layer the boundary is one straight line. Add a hidden layer.'
        : 'Not solved, and it will not be: with the Linear activation the layers collapse into one matrix, so the boundary is one straight line. Switch to Tanh or ReLU.'
  } else {
    status =
      'Not solved yet. Some starting weights get stuck or learn slowly: keep training, press “New starting weights”, or add neurons.'
  }

  const pointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0) return
    const box = e.currentTarget.getBoundingClientRect()
    const clamp = (v: number) => Math.round(Math.min(10, Math.max(0, v)) * 4) / 4
    setProbe([clamp(((e.clientX - box.left) / box.width) * 10), clamp((1 - (e.clientY - box.top) / box.height) * 10)])
  }

  return (
    <div>
      <p className="mt-0 max-w-[70ch]">
        A small neural network learning in your browser, in the style of{' '}
        <a href="https://playground.tensorflow.org" target="_blank" rel="noopener noreferrer">
          TensorFlow Playground
        </a>
        . Every animal is a point: two measurements, <strong>body size</strong> and{' '}
        <strong>stripes</strong>. The network colours the whole plane with its answer,{' '}
        <Tag color={rgb(POSITIVE)}>teal for {data.positive}</Tag> and{' '}
        <Tag color={rgb(NEGATIVE)}>orange for {data.negative}</Tag>, and training moves that colouring until it
        matches the animals. The measurements are made up.
      </p>

      <div role="group" aria-label="Dataset" className="mt-4 flex flex-wrap gap-2">
        {DATASET_IDS.map((id) => (
          <Button
            key={id}
            variant={id === datasetId ? 'primary' : 'secondary'}
            aria-pressed={id === datasetId}
            onClick={() => change({ dataset: id })}
          >
            {DATASET_INFO[id].label}
          </Button>
        ))}
      </div>
      <p className="mt-2 mb-0 max-w-[70ch] text-sm text-muted">{data.note}</p>

      {/* ---- transport and settings ---- */}
      <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-3 rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPlaying((p) => !p)} aria-pressed={playing} className="min-w-20">
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button variant="secondary" onClick={step} disabled={playing}>
            Step one epoch
          </Button>
          <Button variant="secondary" onClick={restart}>
            New starting weights
          </Button>
        </div>
        <div className="text-sm">
          <span className="block text-xs text-muted">Epoch</span>
          <span className="font-mono text-lg" data-testid="epoch">
            {epoch}
          </span>
        </div>
        <label className="text-sm">
          <span className="block text-xs text-muted">Activation</span>
          <select
            value={activation}
            onChange={(e) => change({ activation: e.target.value as Activation })}
            className="rounded-md border border-line bg-surface px-2 py-1 text-ink"
          >
            {ACTIVATIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-muted">Learning rate</span>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="rounded-md border border-line bg-surface px-2 py-1 text-ink"
          >
            {RATES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] [&>*]:min-w-0">
        {/* ---- the network ---- */}
        <section aria-label="The network">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Stepper
              label="Hidden layers"
              value={hidden.length}
              min={0}
              max={MAX_LAYERS}
              onChange={(n) => change({ hidden: n > hidden.length ? [...hidden, 2] : hidden.slice(0, n) })}
            />
            {hidden.map((h, i) => (
              <Stepper
                key={i}
                label={`Neurons in layer ${i + 1}`}
                value={h}
                min={1}
                max={MAX_NEURONS}
                onChange={(n) => setNeurons(i, n)}
              />
            ))}
          </div>
          <canvas
            ref={diagramRef}
            role="img"
            aria-label={`Network diagram: 2 inputs (${names[0]} and ${names[1]}), ${
              hidden.length === 0 ? 'no hidden layers' : `hidden layers of ${hidden.join(' and ')} neurons`
            }, 1 output. Each neuron is drawn as a small picture of what it outputs across the plane.`}
            className="mt-3 block w-full rounded-xl border border-line bg-surface text-ink"
            style={{ aspectRatio: `${DIAGRAM_W} / ${DIAGRAM_H}` }}
          />
          <p className="mt-2 mb-0 max-w-[66ch] text-sm text-muted">
            Each square is one neuron, showing its output across the whole plane. A line is a weight:{' '}
            <Tag color={rgb(POSITIVE)}>teal is positive</Tag>, <Tag color={rgb(NEGATIVE)}>orange is negative</Tag>,
            thicker is further from 0. A first-layer neuron can only draw a straight edge; later neurons mix
            those edges into curves.
          </p>

          <details className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
            <summary className="cursor-pointer font-semibold">The matrices inside this network</summary>
            <p className="mt-3 mb-1 max-w-[62ch]">
              Each layer is one matrix <Tex>W</Tex> and one bias vector <Tex>{String.raw`\mathbf{b}`}</Tex>. The
              layer computes <Tex>{String.raw`f(W\mathbf{x} + \mathbf{b})`}</Tex>: a matrix times a vector, as
              in <Link to="/lessons/matrix-multiplication">lesson 4.2</Link>, then the activation on every
              entry. Training only ever changes these numbers.
            </p>
            {net.layers.map((layer, l) => (
              <div key={l} className="mt-3">
                <div className="text-xs text-muted">
                  {l === net.layers.length - 1 ? 'Output layer' : `Hidden layer ${l + 1}`}: W is {layer.w.length}×
                  {layer.w[0].length} (rows = neurons, columns = inputs to the layer)
                </div>
                <pre className="m-0 overflow-x-auto font-mono text-xs leading-5" aria-label={`Layer ${l + 1} weights`}>
                  {layer.w.map((row, i) => `[${row.map(signed).join('  ')}]   b = ${signed(layer.b[i])}`).join('\n')}
                </pre>
              </div>
            ))}
          </details>
        </section>

        {/* ---- the output ---- */}
        <section aria-label="Output">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="text-sm">
              <div>
                Training loss <span className="font-mono" data-testid="train-loss">{run.trainLoss.toFixed(3)}</span>
              </div>
              <div className="text-muted">
                Test loss <span className="font-mono" data-testid="test-loss">{run.testLoss.toFixed(3)}</span>
              </div>
            </div>
            <LossChart history={run.history} />
          </div>

          <div className="mt-1 text-xs text-muted">↑ {data.axes[1]}</div>
          <div
            className="relative aspect-square w-full cursor-crosshair touch-none overflow-hidden rounded-xl border border-line select-none"
            onPointerDown={pointer}
            onPointerMove={pointer}
          >
            <canvas ref={heatRef} width={GRID} height={GRID} className="absolute inset-0 h-full w-full" />
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label={`The plane coloured by the network's answer, with ${data.train.length} training examples${
                showTest ? ` and ${data.test.length} test examples` : ''
              }. ${run.correct} of ${train.length} training examples are on the correct side.`}
            >
              {[0, 5, 10].map((t) => (
                <g key={t} fill="#3d3b37" fontSize="2.8">
                  <text x={t === 0 ? 1.2 : t === 10 ? 98.8 : 50} y={98.2} textAnchor={t === 0 ? 'start' : t === 10 ? 'end' : 'middle'}>
                    {t}
                  </text>
                  {t > 0 && (
                    <text x={1.2} y={t === 10 ? 3.6 : 51}>
                      {t}
                    </text>
                  )}
                </g>
              ))}
              {showTest && data.test.map((a, i) => <Mark key={`t${i}`} animal={a} faded />)}
              {data.train.map((a, i) => (
                <Mark key={i} animal={a} />
              ))}
              <g transform={`translate(${probe[0] * 10} ${(10 - probe[1]) * 10})`} pointerEvents="none">
                <circle r="3.4" fill="none" stroke="#fff" strokeWidth="1.6" />
                <circle r="3.4" fill="none" stroke="#1d1c1a" strokeWidth="0.7" />
                <path d="M-5.2 0H-1.6M1.6 0H5.2M0 -5.2V-1.6M0 1.6V5.2" stroke="#1d1c1a" strokeWidth="0.7" />
              </g>
            </svg>
          </div>
          <div className="mt-1 flex flex-wrap justify-between gap-x-4 text-xs text-muted">
            <span>
              {[...new Set(data.train.map((a) => a.kind))].map((k) => `${KINDS[k].mark} ${KINDS[k].name}`).join(' · ')}
              {' · ⌖ your new '}
              {isRing ? 'point' : 'animal'}
            </span>
            <span>{data.axes[0]} →</span>
          </div>

          <div className="mt-2">
            <Toggle checked={showTest} onChange={setShowTest}>
              Show the held-back test examples (faded)
            </Toggle>
          </div>

          <div className="mt-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm" data-testid="status">
            <strong>
              {run.correct} of {train.length}
            </strong>{' '}
            training examples correct. {status}
          </div>
        </section>
      </div>

      {/* ---- ask the network ---- */}
      <section aria-label="Ask the network" className="mt-8 rounded-xl border border-line bg-surface px-4 py-4">
        <h2 className="m-0 font-display text-2xl">Ask the network about a new {isRing ? 'point' : 'animal'}</h2>
        <p className="mt-1 mb-3 max-w-[70ch] text-sm text-muted">
          Move the crosshair with the sliders, or click or drag on the coloured plane.
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Slider name={names[0]} value={probe[0]} onChange={(v) => setProbe([v, probe[1]])} min={0} max={10} step={0.25} />
          <Slider name={names[1]} value={probe[1]} onChange={(v) => setProbe([probe[0], v])} min={0} max={10} step={0.25} />
        </div>
        <p className="mt-3 mb-0 text-sm" data-testid="verdict">
          {names[0]} {fmt(probe[0])}, {names[1]} {fmt(probe[1])} → output{' '}
          <span className="font-mono">{signed(probeOut)}</span>, so the network says{' '}
          <Tag color={rgb(probeOut > 0 ? POSITIVE : NEGATIVE)}>{verdict}</Tag>
          {Math.abs(probeOut) < 0.3 ? ' (but it is close to 0: not sure)' : ''}. Above 0 means {data.positive},
          below 0 means {data.negative}.
        </p>
      </section>

      {/* ---- experiments ---- */}
      <section aria-label="Things to try" className="mt-8">
        <h2 className="m-0 font-display text-2xl">Things to try</h2>
        <p className="mt-1 mb-3 max-w-[70ch] text-sm text-muted">
          Each button sets up the network; press Play and watch. Guess what will happen first.
        </p>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {EXPERIMENTS.map((e) => (
            <li key={e.id} className="rounded-lg border border-line bg-surface px-4 py-3">
              <Button
                variant={active?.id === e.id ? 'primary' : 'secondary'}
                aria-pressed={active?.id === e.id}
                onClick={() => loadExperiment(e)}
              >
                {e.title}
              </Button>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-muted">What happens, and why</summary>
                <p className="mt-1 mb-0">{e.expect}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (next: number) => void
}) {
  const button = 'h-7 w-7 cursor-pointer rounded-full border-2 border-line bg-surface font-semibold text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="inline-flex items-center gap-1.5">
      <button type="button" className={button} aria-label={`Fewer: ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <button type="button" className={button} aria-label={`More: ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
      <span>
        {label}: <strong className="font-mono">{value}</strong>
      </span>
    </div>
  )
}

/** One example on the plane. Shape or picture tells the classes apart, not colour alone. */
function Mark({ animal, faded = false }: { animal: Animal; faded?: boolean }) {
  const x = animal.size * 10
  const y = (10 - animal.stripes) * 10
  const opacity = faded ? 0.45 : 1
  if (animal.kind === 'inner') {
    return <circle cx={x} cy={y} r="1.5" fill={rgb(POSITIVE)} stroke="#fff" strokeWidth="0.5" opacity={opacity} />
  }
  if (animal.kind === 'outer') {
    return (
      <path
        d={`M${x} ${y - 1.9}L${x + 1.8} ${y + 1.3}H${x - 1.8}Z`}
        fill={rgb(NEGATIVE)}
        stroke="#fff"
        strokeWidth="0.5"
        opacity={opacity}
      />
    )
  }
  return (
    <text x={x} y={y} fontSize="4.6" textAnchor="middle" dominantBaseline="central" opacity={opacity}>
      {KINDS[animal.kind].mark}
    </text>
  )
}

function LossChart({ history }: { history: [number, number][] }) {
  const w = 180
  const h = 48
  const top = Math.max(0.55, ...history.map((p) => Math.max(p[0], p[1])))
  const line = (k: 0 | 1) =>
    history
      .map((p, i) => `${((i / Math.max(1, history.length - 1)) * w).toFixed(1)},${(h - (p[k] / top) * h).toFixed(1)}`)
      .join(' ')
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label="Loss since the start of training: solid line training, dashed line test"
      className="max-w-full text-ink"
    >
      <line x1="0" y1={h - 0.5} x2={w} y2={h - 0.5} stroke="currentColor" strokeOpacity="0.25" />
      <polyline points={line(1)} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 3" />
      <polyline points={line(0)} fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

// ---- network diagram (canvas) ----------------------------------------------

const DIAGRAM_W = 560
const DIAGRAM_H = 300
const NODE = 36

function drawDiagram(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  net: Network,
  fields: Float32Array[],
  paint: (field: Float32Array) => void,
  thumb: HTMLCanvasElement,
  data: Dataset,
) {
  const dpr = window.devicePixelRatio || 1
  if (canvas.width !== DIAGRAM_W * dpr) {
    canvas.width = DIAGRAM_W * dpr
    canvas.height = DIAGRAM_H * dpr
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, DIAGRAM_W, DIAGRAM_H)
  const ink = getComputedStyle(canvas).color

  const sizes = [net.layers[0].w[0].length, ...net.layers.map((l) => l.w.length)]
  const left = 62
  const right = 16
  const colX = (c: number) => left + (c * (DIAGRAM_W - left - right - NODE)) / (sizes.length - 1)
  const rowY = (c: number, i: number) => 162 + (i - (sizes[c] - 1) / 2) * (NODE + 10) - NODE / 2

  // weights first, so the neurons sit on top of the lines
  ctx.lineCap = 'round'
  net.layers.forEach((layer, l) => {
    layer.w.forEach((row, i) => {
      row.forEach((weight, j) => {
        const x0 = colX(l) + NODE
        const y0 = rowY(l, j) + NODE / 2
        const x1 = colX(l + 1)
        const y1 = rowY(l + 1, i) + NODE / 2
        const mid = (x0 + x1) / 2
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.bezierCurveTo(mid, y0, mid, y1, x1, y1)
        ctx.strokeStyle = rgb(weight >= 0 ? POSITIVE : NEGATIVE, 0.8)
        ctx.lineWidth = linkWidth(weight)
        ctx.stroke()
      })
    })
  })

  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.5
  ctx.font = '12px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  let k = 0
  sizes.forEach((n, c) => {
    const caption = c === 0 ? 'inputs' : c === sizes.length - 1 ? `output: ${data.positive}?` : `hidden ${c}`
    ctx.textAlign = c === 0 ? 'left' : c === sizes.length - 1 ? 'right' : 'center'
    ctx.fillText(caption, c === 0 ? 8 : c === sizes.length - 1 ? DIAGRAM_W - 8 : colX(c) + NODE / 2, 14)
    for (let i = 0; i < n; i++) {
      const x = colX(c)
      const y = rowY(c, i)
      paint(fields[k++])
      ctx.drawImage(thumb, x, y, NODE, NODE)
      ctx.strokeRect(x, y, NODE, NODE)
      if (c === 0) {
        ctx.textAlign = 'right'
        ctx.fillText(inputNames(data.id)[i], x - 6, y + NODE / 2)
      }
    }
  })
}
