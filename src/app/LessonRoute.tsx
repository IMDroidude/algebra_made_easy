import { Component, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ALL_LESSONS } from './curriculum'
import { LESSON_PAGES, isAvailable } from './lessonRegistry'
import { TAKEAWAYS } from './takeawaysRegistry'

class LessonErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-3xl">This lesson failed to load</h1>
          <p className="text-muted">{this.state.error.message}</p>
          <Link to="/">Back to the lessons</Link>
        </div>
      )
    }
    return this.props.children
  }
}

/** "Key takeaways": the few sentences to remember, at the end of every lesson that has them. */
function KeyTakeaways({ slug }: { slug: string }) {
  const items = TAKEAWAYS[slug]
  if (!items?.length) return null
  return (
    <section
      aria-labelledby="key-takeaways"
      className="mx-auto mb-10 max-w-6xl px-4"
    >
      <div className="rounded-xl border-2 border-accent bg-surface px-5 py-5 sm:px-7">
        <h2 id="key-takeaways" className="m-0 font-display text-2xl">
          Key takeaways
        </h2>
        <ol className="mt-3 mb-0 grid gap-3 pl-5 sm:grid-cols-2 sm:gap-x-10">
          {items.map((t) => (
            <li key={t} className="pl-1">
              {t}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Previous / next links at the bottom of a lesson, skipping lessons not built yet. */
function LessonNav({ slug }: { slug: string }) {
  const built = ALL_LESSONS.filter((l) => isAvailable(l.slug))
  const i = built.findIndex((l) => l.slug === slug)
  const prev = built[i - 1]
  const next = built[i + 1]
  const card = 'block rounded-xl border-2 border-line bg-surface p-4 no-underline hover:border-accent'
  return (
    <nav
      id="lesson-nav"
      aria-label="Lesson navigation"
      className="mx-auto grid max-w-6xl gap-3 px-4 pb-16 sm:grid-cols-2"
    >
      {prev ? (
        <Link to={`/lessons/${prev.slug}`} className={card}>
          <span className="block text-xs text-muted">← Previous · {prev.id}</span>
          <span className="font-semibold text-ink">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={`/lessons/${next.slug}`} className={`${card} sm:text-right`}>
          <span className="block text-xs text-muted">Next · {next.id} →</span>
          <span className="font-semibold text-ink">{next.title}</span>
        </Link>
      )}
    </nav>
  )
}

export function LessonRoute() {
  const { slug = '' } = useParams()
  const Page = LESSON_PAGES[slug]
  if (!Page) {
    const entry = ALL_LESSONS.find((l) => l.slug === slug)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-3xl">{entry ? `${entry.title}: coming soon` : 'Lesson not found'}</h1>
        <Link to="/">Back to the lessons</Link>
      </div>
    )
  }
  return (
    <LessonErrorBoundary key={slug}>
      <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-16 text-muted">Loading lesson…</p>}>
        <Page />
      </Suspense>
      <KeyTakeaways slug={slug} />
      <LessonNav slug={slug} />
    </LessonErrorBoundary>
  )
}
