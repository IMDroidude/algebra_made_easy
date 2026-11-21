import katex from 'katex'
import { useMemo } from 'react'

/** Renders LaTeX with KaTeX. `block` puts it on its own centred line. */
export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: block, throwOnError: false }),
    [children, block],
  )
  const Tag = block ? 'div' : 'span'
  return (
    <Tag
      className={block ? 'my-3 overflow-x-auto overflow-y-hidden py-1' : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
