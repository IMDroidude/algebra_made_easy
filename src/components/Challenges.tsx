import type { ReactNode } from 'react'

export type Challenge = {
  id: string
  title: string
  task: ReactNode
  /** Shown once the challenge has been solved. */
  insight: ReactNode
}

/** A list of goals; each is ticked once the live state has satisfied it. */
export function Challenges({ items, done }: { items: Challenge[]; done: ReadonlySet<string> }) {
  const count = items.filter((c) => done.has(c.id)).length
  return (
    <div>
      <p role="status" className="m-0 mb-3 text-sm font-medium text-muted">
        {count} of {items.length} solved
      </p>
      <ol className="m-0 grid list-none gap-3 p-0">
        {items.map((c) => {
          const solved = done.has(c.id)
          return (
            <li
              key={c.id}
              className={`rounded-xl border-2 p-4 ${solved ? 'border-ok bg-ok-bg' : 'border-line bg-surface'}`}
            >
              <p className="m-0 font-semibold">
                <span aria-hidden="true">{solved ? '✓ ' : '○ '}</span>
                {c.title}
                <span className="sr-only">{solved ? ' (solved)' : ' (not solved yet)'}</span>
              </p>
              <div className="mt-1">{c.task}</div>
              {solved && <div className="mt-2 text-sm">{c.insight}</div>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
