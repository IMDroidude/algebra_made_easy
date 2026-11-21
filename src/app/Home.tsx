import { Link } from 'react-router-dom'
import { CURRICULUM } from './curriculum'
import { isAvailable } from './lessonRegistry'

const cta =
  'inline-block rounded-lg border-2 px-4 py-2 font-semibold no-underline'

export function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <section className="py-14">
        <h1 className="m-0 max-w-[18ch] font-display text-5xl leading-[1.05] sm:text-6xl">
          See the algebra behind AI move.
        </h1>
        <p className="mt-5 max-w-[58ch] text-lg text-muted">
          Drag a vector. Edit a matrix. Watch the whole plane respond, with the equation and the
          NumPy code changing alongside. Built for engineers who can code but never got a feel for
          the math.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/lessons/dimensions-and-origin"
            className={`${cta} border-accent bg-accent text-accent-ink`}
          >
            Start from the beginning
          </Link>
          <Link to="/lessons/scalars-and-vectors" className={`${cta} border-line bg-surface text-ink`}>
            Skip to vectors
          </Link>
          <Link to="/playground" className={`${cta} border-line bg-surface text-ink`}>
            Open the playground
          </Link>
        </div>
      </section>

      {CURRICULUM.map((mod) => (
        <section key={mod.n} aria-labelledby={`module-${mod.n}`} className="border-t border-line py-8">
          <p className="m-0 text-xs font-semibold tracking-widest text-accent uppercase">
            Module {mod.n}
          </p>
          <h2 id={`module-${mod.n}`} className="mt-1 mb-0 font-display text-2xl">
            {mod.title}
          </h2>
          <p className="mt-1 mb-4 max-w-[70ch] text-muted">{mod.blurb}</p>
          {mod.goals && (
            <div className="mb-5 max-w-4xl rounded-xl border border-line bg-surface px-5 py-4">
              <p className="m-0 text-sm font-semibold">By the end you can confidently explain:</p>
              <ul className="mt-2 mb-0 grid list-disc gap-x-8 gap-y-1 pl-5 text-sm sm:grid-cols-2">
                {mod.goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
              {mod.notebook && (
                <p className="mt-3 mb-0 text-sm">
                  Prefer code?{' '}
                  <a
                    href={mod.notebook}
                    download
                    className="text-accent underline decoration-1 underline-offset-2"
                  >
                    Download the companion Jupyter notebook
                  </a>{' '}
                  (NumPy, Matplotlib and an interactive Plotly 3D view).
                </p>
              )}
            </div>
          )}
          <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {mod.lessons.map((lesson) => {
              const path = isAvailable(lesson.slug) ? `/lessons/${lesson.slug}` : undefined
              const body = (
                <>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs text-muted">{lesson.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${path ? 'bg-ok-bg text-ok' : 'bg-line text-muted'}`}
                    >
                      {path ? 'Available' : 'Coming soon'}
                    </span>
                  </span>
                  <span className="mt-1 block font-semibold text-ink">{lesson.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{lesson.summary}</span>
                </>
              )
              return (
                <li key={lesson.id}>
                  {path ? (
                    <Link
                      to={path}
                      className="block h-full rounded-xl border-2 border-accent bg-surface p-4 no-underline"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="h-full rounded-xl border border-line p-4 opacity-75">{body}</div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
