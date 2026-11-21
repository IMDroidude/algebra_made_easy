import { useEffect } from 'react'
import { HashRouter, Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Playground } from '../playground/Playground'
import { Home } from './Home'
import { LessonRoute } from './LessonRoute'
import { Reference } from './Reference'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Braces matter: newer browsers return a Promise from scrollTo, and an
    // effect must not return anything except a clean-up function.
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2.5 py-1 text-sm font-medium no-underline ${isActive ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-line'}`
  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          // A plain #main link would be read as a route by the hash router.
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="font-display text-xl font-semibold text-ink no-underline">
            Algebra Made Easy
          </Link>
          <nav aria-label="Main" className="flex gap-1">
            <NavLink to="/" end className={navClass}>
              Lessons
            </NavLink>
            <NavLink to="/playground" className={navClass}>
              Playground
            </NavLink>
            <NavLink to="/reference" className={navClass}>
              Reference
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p>
        <Link to="/">Back to the lessons</Link>
      </p>
    </div>
  )
}

export function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lessons/:slug" element={<LessonRoute />} />
          <Route path="playground" element={<Playground />} />
          <Route path="reference" element={<Reference />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
