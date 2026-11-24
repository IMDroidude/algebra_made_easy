import type { ReactNode } from 'react'

/**
 * A second section of an existing step ("Step 5 · Apply, continued"), laid
 * out like the shared `Step`. The shared one numbers its heading id by step,
 * so two sections of the same step need this local variant.
 */
export function ContinuedStep({
  id,
  kicker,
  title,
  children,
  visual,
}: {
  /** Id of the heading; the section is labelled by it. */
  id: string
  kicker: string
  title: string
  children: ReactNode
  visual: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10">
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">{kicker}</p>
      <h2 id={id} className="mt-1 mb-5 font-display text-3xl leading-tight">
        {title}
      </h2>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="prose-lesson max-w-[62ch]">{children}</div>
        <div>{visual}</div>
      </div>
    </section>
  )
}
