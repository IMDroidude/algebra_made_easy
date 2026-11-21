import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const tone =
    variant === 'primary'
      ? 'bg-accent text-accent-ink border-accent'
      : 'bg-surface text-ink border-line hover:border-accent'
  return (
    <button
      type="button"
      {...props}
      className={`cursor-pointer rounded-lg border-2 px-3.5 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${tone} ${className}`}
    />
  )
}

/** A labelled on/off switch for an optional overlay. */
export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  )
}

/** Live text description of what a visual currently shows. */
export function Readout({ children }: { children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      className="mt-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm"
    >
      {children}
    </div>
  )
}

/** A name for a coloured object, shown in its colour and in bold so colour is not the only cue. */
export function Tag({ color, children }: { color: string; children: ReactNode }) {
  return (
    <strong style={{ color }} className="font-semibold">
      {children}
    </strong>
  )
}

/** One of the six steps of a lesson: explanation on one side, visual on the other. */
export function Step({
  n,
  kind,
  title,
  children,
  visual,
  layout = 'split',
}: {
  n: number
  kind: string
  title: string
  children: ReactNode
  visual?: ReactNode
  /**
   * `split` (default): text and visual side by side on wide screens.
   * `wide`: a narrow text column beside a visual that takes most of the width,
   * for steps where the plane itself is the lesson and should be big.
   */
  layout?: 'split' | 'wide'
}) {
  const grid =
    layout === 'wide'
      ? 'grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] [&>*]:min-w-0'
      : 'grid grid-cols-1 items-start gap-8 lg:grid-cols-2 [&>*]:min-w-0'
  return (
    <section aria-labelledby={`step-${n}`} className="border-t border-line py-10">
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">
        Step {n} · {kind}
      </p>
      <h2 id={`step-${n}`} className="mt-1 mb-5 font-display text-3xl leading-tight">
        {title}
      </h2>
      <div className={visual ? grid : ''}>
        <div className="prose-lesson max-w-[62ch]">{children}</div>
        {visual && <div>{visual}</div>}
      </div>
    </section>
  )
}
