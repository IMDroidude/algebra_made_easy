import { describe, expect, it } from 'vitest'
import { ALL_LESSONS } from '../../src/app/curriculum'
import { PREREQUISITES } from '../../src/app/prerequisites'

const order = ALL_LESSONS.map((l) => l.slug)

describe('prerequisites', () => {
  it('every lesson has an entry, and there are no entries for unknown lessons', () => {
    expect(Object.keys(PREREQUISITES).sort()).toEqual([...order].sort())
  })

  it.each(order)('%s only depends on lessons that come earlier', (slug) => {
    for (const dep of PREREQUISITES[slug].lessons) {
      expect(order, `${slug} → ${dep}`).toContain(dep)
      expect(order.indexOf(dep), `${slug} → ${dep}`).toBeLessThan(order.indexOf(slug))
    }
  })

  it('every lesson lists at least one skill to check', () => {
    for (const slug of order) expect(PREREQUISITES[slug].skills.length).toBeGreaterThan(0)
  })
})
