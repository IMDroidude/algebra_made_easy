import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * Every folder src/lessons/<slug>/ with an index.ts(x) whose default export is
 * a component becomes the page at /lessons/<slug>. No central list to edit:
 * adding the folder is enough. Lessons are code-split, one chunk each.
 */
const modules = import.meta.glob<{ default: ComponentType }>('../lessons/*/index.{ts,tsx}')

export const LESSON_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {}

for (const [path, load] of Object.entries(modules)) {
  const slug = path.split('/')[2]
  LESSON_PAGES[slug] = lazy(load)
}

export function isAvailable(slug: string): boolean {
  return slug in LESSON_PAGES
}
