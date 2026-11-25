import fs from 'node:fs'
import path from 'node:path'
const root = process.argv[2]
const { CURRICULUM, ALL_LESSONS } = await import(path.join(root, 'src/app/curriculum.ts'))
const { PREREQUISITES } = await import(path.join(root, 'src/app/prerequisites.ts'))
const SITE = 'https://imdroidude.github.io/algebra_made_easy/#'
const bySlug = Object.fromEntries(ALL_LESSONS.map((l) => [l.slug, l]))
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const fileOf = (m) => `module-${m.n}-${slugify(m.title)}.md`
const decode = (s) => s.replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/\{'(.)'\}/g, '$1')

/** Section headings of a lesson, in page order, read from its source files. */
function outline(slug) {
  const dir = path.join(root, 'src/lessons', slug)
  const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8')
  const found = []
  const scan = (file, seen = new Set()) => {
    if (seen.has(file) || !fs.existsSync(path.join(dir, file))) return
    seen.add(file)
    const src = read(file)
    const locals = Object.fromEntries([...src.matchAll(/import \{([^}]+)\} from '\.\/([A-Za-z0-9]+)'/g)].flatMap((m) => m[1].split(',').map((n) => [n.trim(), m[2] + '.tsx'])))
    const re = /<Step\b[^>]*?\bn=\{(\d+)\}[^>]*?\bkind="([^"]+)"[^>]*?\btitle=(?:"([^"]+)"|\{'([^']+)'\}|\{"([^"]+)"\})|<(?:Section|ContinuedStep)\b[^>]*?\btitle="([^"]+)"|<RunningExample\b[^>]*?\btitle="([^"]+)"|<([A-Z][A-Za-z0-9]+)\b/gs
    for (const m of src.matchAll(re)) {
      if (m[1]) found.push(`Step ${m[1]} · ${m[2]}: ${decode(m[3] ?? m[4] ?? m[5])}`)
      else if (m[6]) found.push(`Going further: ${decode(m[6])}`)
      else if (m[7]) found.push(`Running example (houses): ${decode(m[7])}`)
      else if (m[8] && locals[m[8]]) scan(locals[m[8]], seen)
    }
  }
  scan('Lesson.tsx')
  return [...new Set(found)]
}
async function takeaways(slug) {
  const f = path.join(root, 'src/lessons', slug, 'takeaways.ts')
  return fs.existsSync(f) ? (await import(f)).takeaways : []
}

const outDir = path.join(root, 'docs/modules')
fs.mkdirSync(outDir, { recursive: true })
const index = ['# Course modules', '', '_One file per module. Generated from `src/app/curriculum.ts`, `src/app/prerequisites.ts` and each lesson\'s `takeaways.ts` on 2026-11-25; regenerate after changing the curriculum with `node --experimental-strip-types scripts/gen-module-docs.mjs "$PWD"`._', '', `Live course: ${SITE.slice(0, -1)}`, '', '| Module | Lessons | File |', '|---|---|---|']
const report = []
for (const m of CURRICULUM) {
  const L = [`# Module ${m.n}: ${m.title}`, '', m.blurb, '']
  if (m.goals?.length) L.push('## After this module you can answer', '', ...m.goals.map((g) => `- ${g}`), '')
  if (m.notebook) L.push(`Companion Jupyter notebook: \`public/${m.notebook}\``, '')
  L.push('## Lessons at a glance', '', '| # | Lesson | In one line | Why an AI engineer needs it |', '|---|---|---|---|')
  for (const l of m.lessons) L.push(`| ${l.id} | [${l.title}](${SITE}/lessons/${l.slug}) | ${l.summary} | ${l.ai} |`)
  L.push('')
  for (const l of m.lessons) {
    const built = fs.existsSync(path.join(root, 'src/lessons', l.slug, 'index.ts'))
    L.push(`## ${l.id} ${l.title}`, '', `${l.summary} ${l.ai}`, '', `- Open the lesson: ${SITE}/lessons/${l.slug}`, `- Source: \`src/lessons/${l.slug}/\`${built ? '' : ' (not built yet)'}`, '')
    const pre = PREREQUISITES[l.slug]
    if (pre) {
      L.push('**Before you start**', '')
      if (pre.lessons.length) L.push(`- Earlier lessons: ${pre.lessons.map((s) => `${bySlug[s]?.id ?? '?'} ${bySlug[s]?.title ?? s}`).join('; ')}`)
      L.push(...pre.skills.map((s) => `- ${s}`), '')
    }
    const o = built ? outline(l.slug) : []
    if (o.length) L.push('**What the lesson covers**', '', ...o.map((x, i) => `${i + 1}. ${x}`), '')
    const t = built ? await takeaways(l.slug) : []
    if (t.length) L.push('**Key takeaways**', '', ...t.map((x) => `- ${x}`), '')
    report.push(`${l.id} ${l.slug}: outline ${o.length}, takeaways ${t.length}, prereq ${pre ? 'yes' : 'NO'}, built ${built}`)
  }
  fs.writeFileSync(path.join(outDir, fileOf(m)), L.join('\n').trimEnd() + '\n')
  index.push(`| ${m.n}. ${m.title} | ${m.lessons.map((l) => l.id).join(', ')} | [${fileOf(m)}](${fileOf(m)}) |`)
}
fs.writeFileSync(path.join(outDir, 'README.md'), index.join('\n') + '\n')
console.log(report.join('\n'))
