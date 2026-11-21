import { useEffect, useRef, useState } from 'react'

type Item = { id: string; label: string }

/**
 * Short name for a section: "Step 3 · Predict" becomes "3 Predict"; the
 * running example and the takeaways get fixed names; anything else uses its
 * heading.
 */
function labelFor(heading: HTMLElement): string {
  if (heading.id === 'running-example') return 'Houses'
  if (heading.id === 'key-takeaways') return 'Takeaways'
  const kicker = heading.previousElementSibling?.textContent?.trim() ?? ''
  const step = kicker.match(/^Step (\d+) · ([^,]+)(, continued)?/i)
  if (step) return step[3] ? `${step[1]}+ ${step[2]}` : `${step[1]} ${step[2]}`
  const text = heading.textContent?.trim() ?? ''
  return text.length > 22 ? `${text.slice(0, 20)}…` : text
}

function collect(): Item[] {
  const headings = document.querySelectorAll<HTMLElement>(
    'main article section > h2[id], main section[aria-labelledby="running-example"] h2[id], main section[aria-labelledby="key-takeaways"] h2[id]',
  )
  const seen = new Set<string>()
  const items: Item[] = []
  headings.forEach((h) => {
    if (seen.has(h.id) || h.id === 'before-you-start') return
    seen.add(h.id)
    items.push({ id: h.id, label: labelFor(h) })
  })
  return items
}

/**
 * A sticky row of buttons that jump to each part of the lesson and show
 * which part is on screen. Built from the page itself after it renders, so
 * lessons do not have to declare their sections.
 */
export function LessonSectionNav({ slug }: { slug: string }) {
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<string | null>(null)
  const bar = useRef<HTMLOListElement>(null)

  // On narrow screens the bar scrolls sideways: keep the current button in view.
  useEffect(() => {
    if (!active || !bar.current) return
    const btn = bar.current.querySelector<HTMLElement>(`[data-target="${active}"]`)
    if (!btn) return
    const box = bar.current
    const left = btn.offsetLeft - box.offsetLeft
    if (left < box.scrollLeft || left + btn.offsetWidth > box.scrollLeft + box.clientWidth) {
      box.scrollTo({ left: left - 16, behavior: 'smooth' })
    }
  }, [active])

  // Lessons load lazily and can add sections later (toggles), so watch the page.
  useEffect(() => {
    const update = () =>
      setItems((prev) => {
        const next = collect()
        const same = prev.length === next.length && prev.every((p, i) => p.id === next[i].id && p.label === next[i].label)
        return same ? prev : next
      })
    update()
    const main = document.querySelector('main')
    if (!main) return
    const observer = new MutationObserver(update)
    observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [slug])

  // Highlight the section nearest the top of the screen.
  useEffect(() => {
    if (items.length === 0) return
    const onScroll = () => {
      let current: string | null = null
      for (const it of items) {
        const el = document.getElementById(it.id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = it.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  if (items.length < 3) return null

  return (
    <nav
      aria-label="Lesson sections"
      className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80"
    >
      <ol ref={bar} className="mx-auto m-0 flex max-w-7xl list-none gap-1.5 overflow-x-auto px-4 py-2">
        {items.map((it) => {
          const on = it.id === active
          return (
            <li key={it.id} className="shrink-0">
              <button
                type="button"
                data-target={it.id}
                aria-current={on ? 'location' : undefined}
                onClick={() => {
                  // Buttons, not #links: the hash router would read #id as a route.
                  const el = document.getElementById(it.id)
                  el?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                  on ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink hover:border-accent'
                }`}
              >
                {it.label}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
