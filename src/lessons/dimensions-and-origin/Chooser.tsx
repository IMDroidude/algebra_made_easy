/** A row of toggle buttons, one pressed at a time (local: the shared ui has no segmented control). */
export function Chooser<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly (readonly [T, string])[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg border border-line p-1">
      {options.map(([id, text]) => (
        <button
          key={String(id)}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold ${value === id ? 'bg-accent text-accent-ink' : 'text-ink'}`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
