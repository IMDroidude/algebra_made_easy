import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui'
import { MatrixLab } from './MatrixLab'
import { VectorLab } from './VectorLab'
import { NetworkLab } from './network/NetworkLab'

const TABS = [
  { id: 'vectors', label: 'Vectors: add and scale' },
  { id: 'matrix', label: 'Matrix: transform the plane' },
  { id: 'network', label: 'Neural network: cat or tiger?' },
] as const

type TabId = (typeof TABS)[number]['id']

export function Playground() {
  // The lab is in the URL (/#/playground?lab=network) so a lesson can link straight to one.
  const [params, setParams] = useSearchParams()
  const tab: TabId = TABS.find((t) => t.id === params.get('lab'))?.id ?? 'vectors'
  const setTab = (id: TabId) => setParams(id === 'vectors' ? {} : { lab: id }, { replace: true })
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <header className="py-10">
        <h1 className="m-0 font-display text-4xl leading-tight sm:text-5xl">Playground</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-muted">
          No lesson, no goals. Drag things and see what happens. Click a handle and use the arrow
          keys if you prefer the keyboard.
        </p>
        <div role="group" aria-label="Choose a lab" className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? 'primary' : 'secondary'}
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </header>
      {tab === 'vectors' ? <VectorLab /> : tab === 'matrix' ? <MatrixLab /> : <NetworkLab />}
    </div>
  )
}
