import { useState } from 'react'

/**
 * Read-only NumPy code that mirrors the current state of a visual, with the
 * output it would print shown underneath.
 */
export function NumpySnippet({ code, output }: { code: string; output?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be refused; the code is still selectable by hand.
    }
  }

  return (
    <figure className="m-0 overflow-hidden rounded-xl bg-code-bg text-code-ink">
      <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs">
        <span className="opacity-70">NumPy · updates as you change the values</span>
        <button
          type="button"
          onClick={copy}
          className="rounded border border-white/20 px-2 py-0.5 hover:bg-white/10"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="m-0 overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
      {output !== undefined && (
        <pre
          aria-label="Output"
          className="m-0 overflow-x-auto border-t border-white/10 px-4 py-2 font-mono text-sm leading-relaxed opacity-80"
        >
          {output}
        </pre>
      )}
    </figure>
  )
}
