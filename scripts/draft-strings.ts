#!/usr/bin/env tsx
/**
 * `pnpm draft-strings` — writes docs/DRAFT_STRINGS.md: every content string marked
 * `draft: true`, grouped by scenario, for client sign-off (PRD §14.6 / M4).
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { validateAll } from './validate-core'

const root = fileURLToPath(new URL('..', import.meta.url))
const report = validateAll(root)

function get(obj: unknown, path: string): { ko?: string; en?: string } | undefined {
  const parts = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur as { ko?: string; en?: string } | undefined
}

const lines: string[] = [
  '# Draft strings awaiting client sign-off',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} by \`pnpm draft-strings\`. These sentences were written by the development team to fill gaps in the content design documents (hints, "더 알려줘요" examples, missing reasons, body reactions for added feelings, split story sentences). Each one is marked \`"draft": true\` in its JSON file; remove the flag once approved, or replace the text.`,
  '',
  '| # | Scenario | Field | Korean (shipped) | English (dev only) |',
  '|---|---|---|---|---|',
]
let n = 0
for (const s of report.scenarios) {
  const file = `content/scenarios/${s.id}.json`
  for (const path of report.drafts[file] ?? []) {
    const v = get(s, path)
    if (!v) continue
    n++
    lines.push(`| ${n} | \`${s.id}\` | \`${path}\` | ${v.ko ?? ''} | ${v.en ?? ''} |`)
  }
}
lines.push(
  '',
  `**Total: ${n} draft strings across ${Object.keys(report.drafts).length} scenario files.**`,
  '',
)
const out = join(root, 'docs', 'DRAFT_STRINGS.md')
writeFileSync(out, lines.join('\n'))
console.log(`✔ docs/DRAFT_STRINGS.md — ${n} draft strings`)
