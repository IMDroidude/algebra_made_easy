/**
 * Key takeaways for each lesson: src/lessons/<slug>/takeaways.ts exporting
 * `takeaways` (3–5 short sentences). Shown at the end of the lesson. Loaded
 * eagerly because they are tiny.
 */
const modules = import.meta.glob<{ takeaways: string[] }>('../lessons/*/takeaways.ts', {
  eager: true,
})

export const TAKEAWAYS: Record<string, string[]> = {}

for (const [path, mod] of Object.entries(modules)) {
  TAKEAWAYS[path.split('/')[2]] = mod.takeaways
}
