import type { ReactNode } from 'react'
import { FEATURE_LABEL, HOUSES } from '../data/houses'
import type { House } from '../data/houses'

/**
 * The "Running example" box: the same house dataset, seen through the tool
 * this lesson teaches. Visually distinct from the six steps so learners
 * recognise it from lesson to lesson.
 */
export function RunningExample({
  title,
  children,
}: {
  /** What this lesson does to the houses, e.g. "A renovation is a vector". */
  title: string
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby="running-example"
      className="my-10 rounded-2xl border-2 border-dashed border-accent bg-surface px-3 py-6 sm:px-7"
    >
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">
        Running example · the house dataset
      </p>
      <h2 id="running-example" className="mt-1 mb-4 font-display text-2xl leading-tight">
        {title}
      </h2>
      <div className="prose-lesson">{children}</div>
    </section>
  )
}

type Column = keyof Pick<House, 'sqft' | 'bedrooms' | 'distanceKm' | 'priceK'>

/** Headers short enough for a phone; the full label stays available to screen readers. */
const SHORT_LABEL: Record<Column, string> = {
  sqft: 'sqft',
  bedrooms: 'beds',
  distanceKm: 'km',
  priceK: '$k',
}

/** The houses as a table. Optional extra columns let a lesson show its own result per house. */
export function HouseTable({
  houses = HOUSES,
  columns = ['sqft', 'bedrooms', 'distanceKm', 'priceK'],
  highlight,
  extra,
  caption,
}: {
  houses?: readonly House[]
  columns?: Column[]
  /** Ids of rows to emphasise. */
  highlight?: readonly string[]
  /** Extra computed columns: heading plus a function giving the cell text for a house. */
  extra?: { heading: string; cell: (h: House) => ReactNode }[]
  caption?: string
}) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-xs sm:text-sm">
        {caption && <caption className="mb-2 text-left text-muted">{caption}</caption>}
        <thead>
          <tr className="border-b-2 border-line text-left">
            <th className="py-1.5 pr-1.5 align-bottom font-semibold sm:pr-3">House</th>
            {columns.map((c) => (
              <th key={c} className="py-1.5 pr-1.5 text-right align-bottom leading-tight font-semibold sm:pr-3">
                <span aria-hidden="true" className="sm:hidden">
                  {SHORT_LABEL[c]}
                </span>
                <span className="sr-only sm:not-sr-only">{FEATURE_LABEL[c]}</span>
              </th>
            ))}
            {extra?.map((e) => (
              <th key={e.heading} className="py-1.5 pr-1.5 text-right align-bottom leading-tight font-semibold text-accent sm:pr-3">
                {e.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {houses.map((h) => {
            const on = highlight?.includes(h.id)
            return (
              <tr key={h.id} className={`border-b border-line ${on ? 'bg-ok-bg font-semibold' : ''}`}>
                <td className="py-1.5 pr-1.5 sm:pr-3">
                  <span className="font-mono">{h.id}</span>{' '}
                  {/* On phones only the letter fits; the name returns on wider screens. */}
                  <span className="hidden sm:inline">{h.name}</span>
                  {on && <span className="sr-only"> (highlighted)</span>}
                </td>
                {columns.map((c) => (
                  <td key={c} className="py-1.5 pr-1.5 text-right font-mono sm:pr-3">
                    {h[c]}
                  </td>
                ))}
                {extra?.map((e) => (
                  <td key={e.heading} className="py-1.5 pr-1.5 text-right font-mono sm:pr-3">
                    {e.cell(h)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
