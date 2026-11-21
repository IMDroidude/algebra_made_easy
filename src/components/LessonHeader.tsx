import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ALL_LESSONS } from '../app/curriculum'
import { PREREQUISITES } from '../app/prerequisites'

/**
 * The title block at the top of every lesson. Number, part, title and
 * prerequisites come from src/app, so they cannot drift from the home page.
 */
export function LessonHeader({ slug, children }: { slug: string; children: ReactNode }) {
  const entry = ALL_LESSONS.find((l) => l.slug === slug)
  if (!entry) throw new Error(`Lesson "${slug}" is not in src/app/curriculum.ts`)
  const skippable = entry.module <= 2
  return (
    <header className="py-10">
      <p className="m-0 text-sm font-medium text-muted">
        Module {entry.module} · {entry.moduleTitle} · Lesson {entry.id}
      </p>
      <h1 className="mt-1 mb-3 font-display text-4xl leading-tight sm:text-5xl">{entry.title}</h1>
      <div className="m-0 max-w-[62ch] text-lg text-muted">{children}</div>
      <p className="mt-4 mb-0 max-w-[62ch] border-l-4 border-accent pl-3 text-sm">
        <strong>Why an AI engineer needs this:</strong> {entry.ai}
      </p>
      <BeforeYouStart slug={slug} />
      {skippable && (
        <p className="mt-4 mb-0 text-sm">
          Already comfortable with this?{' '}
          <a href="#lesson-nav" onClick={skipToNav}>
            Skip to the next lesson
          </a>
          .
        </p>
      )}
    </header>
  )
}

/** "Before you start": earlier lessons to finish, and skills to check yourself against. */
function BeforeYouStart({ slug }: { slug: string }) {
  const pre = PREREQUISITES[slug]
  if (!pre) return null
  const lessons = pre.lessons
    .map((s) => ALL_LESSONS.find((l) => l.slug === s))
    .filter((l) => l !== undefined)
  return (
    <section
      aria-labelledby="before-you-start"
      className="mt-6 max-w-3xl rounded-xl border border-line bg-surface px-5 py-4"
    >
      <h2 id="before-you-start" className="m-0 text-sm font-semibold tracking-wide uppercase">
        Before you start
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="m-0 text-sm font-medium text-muted">Lessons to finish first</p>
          {lessons.length === 0 ? (
            <p className="mt-1 mb-0 text-sm">None. This is a starting point.</p>
          ) : (
            <ul className="mt-1 mb-0 list-none space-y-1 p-0 text-sm">
              {lessons.map((l) => (
                <li key={l.slug}>
                  <Link
                    to={`/lessons/${l.slug}`}
                    className="text-accent underline decoration-1 underline-offset-2 hover:decoration-2"
                  >
                    <span className="font-mono text-xs">{l.id}</span> {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="m-0 text-sm font-medium text-muted">You should be able to</p>
          <ul className="mt-1 mb-0 list-disc space-y-1 pl-5 text-sm">
            {pre.skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function skipToNav(e: React.MouseEvent) {
  // A plain #id link would be read as a route by the hash router.
  e.preventDefault()
  document.getElementById('lesson-nav')?.scrollIntoView({ behavior: 'smooth' })
}
