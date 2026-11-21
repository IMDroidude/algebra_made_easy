import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_LESSONS } from '../../app/curriculum'
import { Button } from '../../components/ui'
import { RECAP } from './positions'

/**
 * Module 1 recap: one card per module goal. The learner answers in their head,
 * then reveals a short answer and can jump to the lesson that teaches it.
 */
export function Recap() {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set())
  const toggle = (k: number) => {
    const next = new Set(open)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    setOpen(next)
  }
  return (
    <section aria-labelledby="module-recap" className="border-t border-line py-10">
      <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">Module 1 recap</p>
      <h2 id="module-recap" className="mt-1 mb-3 font-display text-3xl leading-tight">
        Can you explain…?
      </h2>
      <p className="mt-0 mb-5 max-w-[62ch]">
        This lesson closes Module 1. Try to answer each question out loud, in a sentence or two,
        before you reveal the short answer. Any you are unsure of? Follow the link back to the
        lesson.
      </p>
      <p role="status" className="m-0 mb-3 text-sm font-medium text-muted">
        {open.size} of {RECAP.length} answers revealed
      </p>
      <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
        {RECAP.map((item, k) => {
          const lesson = ALL_LESSONS.find((l) => l.slug === item.slug)
          const shown = open.has(k)
          const id = `recap-answer-${k}`
          return (
            <li key={item.q} className="rounded-xl border-2 border-line bg-surface p-4">
              <p className="m-0 font-semibold">
                {k + 1}. {item.q}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Button variant="secondary" aria-expanded={shown} aria-controls={id} onClick={() => toggle(k)}>
                  {shown ? 'Hide answer' : 'Show answer'}
                </Button>
                <Link
                  to={`/lessons/${item.slug}`}
                  className="text-sm font-medium text-accent underline underline-offset-2"
                >
                  {item.slug === 'real-world-positions' ? 'This lesson' : 'Lesson'} {lesson?.id}{' '}
                  {lesson?.title}
                </Link>
              </div>
              <div id={id} hidden={!shown} className="mt-2">
                <p className="m-0">{item.a}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
