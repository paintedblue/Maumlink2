/**
 * Content validator core — PRD §10. Pure Node (no Vite), so it runs from the CLI,
 * from the Vite build plugin and from unit tests.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import {
  EmotionsFile,
  NOT_SURE,
  Scenario,
  UiFile,
  type LString,
  type Scenario as ScenarioT,
} from '../src/content/schema.ts'

export interface Issue {
  file: string
  path: string
  message: string
}
export interface Report {
  errors: Issue[]
  warnings: Issue[]
  drafts: Record<string, string[]>
  scenarios: ScenarioT[]
}

const STORY_MAX_KO = 60
const KEY_MAX_KO = 30

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'))
}

/** Walk any object and collect every LString-shaped node with its JSON path. */
function collectLStrings(node: unknown, path: string, out: { path: string; value: LString }[]) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectLStrings(v, `${path}[${i}]`, out))
    return
  }
  const obj = node as Record<string, unknown>
  if (typeof obj.ko === 'string') {
    out.push({ path, value: obj as LString })
    return
  }
  for (const [k, v] of Object.entries(obj)) collectLStrings(v, path ? `${path}.${k}` : k, out)
}

export function validateAll(root: string): Report {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  const drafts: Record<string, string[]> = {}
  const scenarios: ScenarioT[] = []
  const contentDir = join(root, 'content')
  const publicDir = join(root, 'public')

  // --- emotions.json
  const emotionsPath = join(contentDir, 'emotions.json')
  const emotionIds = new Set<string>()
  if (!existsSync(emotionsPath)) {
    errors.push({ file: 'content/emotions.json', path: '', message: 'file is missing' })
  } else {
    const parsed = EmotionsFile.safeParse(readJson(emotionsPath))
    if (!parsed.success) {
      for (const i of parsed.error.issues)
        errors.push({ file: 'content/emotions.json', path: i.path.join('.'), message: i.message })
    } else {
      for (const e of parsed.data.emotions) {
        if (emotionIds.has(e.id))
          errors.push({
            file: 'content/emotions.json',
            path: e.id,
            message: 'duplicate emotion id',
          })
        emotionIds.add(e.id)
        if (!existsSync(join(publicDir, 'icons', 'emotions', e.icon)))
          warnings.push({
            file: 'content/emotions.json',
            path: e.id,
            message: `icon file public/icons/emotions/${e.icon} does not exist yet`,
          })
      }
      if (!emotionIds.has(NOT_SURE))
        errors.push({
          file: 'content/emotions.json',
          path: '',
          message: `emotion "${NOT_SURE}" must exist`,
        })
    }
  }

  // --- ui.json
  const uiPath = join(contentDir, 'ui.json')
  if (!existsSync(uiPath)) {
    errors.push({ file: 'content/ui.json', path: '', message: 'file is missing' })
  } else {
    const parsed = UiFile.safeParse(readJson(uiPath))
    if (!parsed.success)
      for (const i of parsed.error.issues)
        errors.push({ file: 'content/ui.json', path: i.path.join('.'), message: i.message })
  }

  // --- scenarios/*.json
  const scenDir = join(contentDir, 'scenarios')
  const files = existsSync(scenDir) ? readdirSync(scenDir).filter((f) => f.endsWith('.json')) : []
  const seenIds = new Set<string>()
  for (const f of files.sort()) {
    const rel = `content/scenarios/${f}`
    const parsed = Scenario.safeParse(readJson(join(scenDir, f)))
    if (!parsed.success) {
      for (const i of parsed.error.issues)
        errors.push({ file: rel, path: i.path.join('.'), message: i.message })
      continue
    }
    const s = parsed.data
    const err = (path: string, message: string) => errors.push({ file: rel, path, message })
    const warn = (path: string, message: string) => warnings.push({ file: rel, path, message })

    // 2. id unique; file name equals id
    if (seenIds.has(s.id)) err('id', `duplicate scenario id "${s.id}"`)
    seenIds.add(s.id)
    if (basename(f, '.json') !== s.id) err('id', `file name must be "${s.id}.json"`)

    // 3. emotion ids exist; not-sure last in options, never in suggest
    for (const id of s.feeling.options)
      if (!emotionIds.has(id))
        err('feeling.options', `unknown emotion "${id}" (add it to emotions.json)`)
    if (s.feeling.options.includes(NOT_SURE) && s.feeling.options.at(-1) !== NOT_SURE)
      err('feeling.options', `"${NOT_SURE}" must be the last option`)
    if (
      s.feeling.options.includes(NOT_SURE) &&
      s.feeling.options.indexOf(NOT_SURE) !== s.feeling.options.length - 1
    )
      err('feeling.options', `"${NOT_SURE}" may appear only once, at the end`)
    for (const id of s.feeling.hint.suggest) {
      if (!emotionIds.has(id)) err('feeling.hint.suggest', `unknown emotion "${id}"`)
      if (id === NOT_SURE) err('feeling.hint.suggest', `"${NOT_SURE}" cannot be a suggestion`)
      if (!s.feeling.options.includes(id))
        err('feeling.hint.suggest', `suggested emotion "${id}" is not one of feeling.options`)
    }

    // 4. byFeeling covers every option except not-sure, no extras
    if (s.step3.type === 'reason' || s.step3.type === 'body-reaction') {
      const keys = new Set(Object.keys(s.step3.byFeeling))
      // Source gaps are explicit; an accidental missing entry still fails validation.
      const omissions = new Set(s.step3.sourceOmissions ?? [])
      if (omissions.size !== (s.step3.sourceOmissions?.length ?? 0))
        err('step3.sourceOmissions', 'duplicate source omission')
      for (const id of omissions) {
        if (id === NOT_SURE || !s.feeling.options.includes(id) || keys.has(id))
          err('step3.sourceOmissions', `invalid source omission "${id}"`)
      }
      for (const id of s.feeling.options) {
        if (id === NOT_SURE) continue
        if (!keys.has(id) && !omissions.has(id))
          err(
            `step3.byFeeling.${id}`,
            `missing explanation for feeling "${id}" (the child can pick it)`,
          )
      }
      for (const k of keys)
        if (!s.feeling.options.includes(k))
          err(
            `step3.byFeeling.${k}`,
            `"${k}" is not one of feeling.options (remove it or add the option)`,
          )
    } else {
      const ids = s.step3.options.map((o) => o.id).join('')
      if (ids !== 'ABCD') err('step3.options', 'options must be exactly A, B, C, D in order')
    }

    // 5. actions A–D in order, feedback present, outcome icon exists
    const actionIds = s.action.options.map((o) => o.id).join('')
    if (actionIds !== 'ABCD') err('action.options', 'options must be exactly A, B, C, D in order')
    for (const o of s.action.options) {
      if (!existsSync(join(publicDir, 'icons', 'outcome', `${o.outcomeIcon}.svg`)))
        err(
          `action.options.${o.id}.outcomeIcon`,
          `public/icons/outcome/${o.outcomeIcon}.svg does not exist`,
        )
    }

    // 6. ko required (schema), en optional → warn; collect drafts
    const ls: { path: string; value: LString }[] = []
    collectLStrings(s, '', ls)
    const draftPaths: string[] = []
    for (const { path, value } of ls) {
      if (!value.en)
        warn(path, 'no English text (fine for shipping; dev/demo locale will fall back to Korean)')
      if (value.draft) draftPaths.push(path)
    }
    if (draftPaths.length) drafts[rel] = draftPaths

    // 7. sentence length limits (Korean)
    s.situation.story.forEach((sentence, i) => {
      if (sentence.ko.length > STORY_MAX_KO)
        warn(
          `situation.story[${i}]`,
          `story sentence is ${sentence.ko.length} chars (max ${STORY_MAX_KO}); split it`,
        )
    })
    if (s.situation.keySentence.ko.length > KEY_MAX_KO)
      warn(
        'situation.keySentence',
        `key sentence is ${s.situation.keySentence.ko.length} chars (max ${KEY_MAX_KO})`,
      )

    // 8. referenced images exist
    const imgs = [
      s.situation.image,
      s.situation.imageByLocale?.ko,
      s.situation.imageByLocale?.en,
    ].filter((x): x is string => Boolean(x))
    for (const img of imgs) {
      const p = img.replace(/^\//, '')
      if (!existsSync(join(publicDir, p)))
        err('situation.image', `public/${p} does not exist (run "pnpm images")`)
    }

    // 9. emphasised words must occur in the story or key sentence they decorate
    const storyKo = [...s.situation.story, s.situation.keySentence].map((x) => x.ko)
    s.situation.emphasis?.forEach((word, i) => {
      if (!storyKo.some((line) => line.includes(word.ko)))
        err(`situation.emphasis.${i}`, `"${word.ko}" does not occur in the story`)
    })

    // 10. explore mode needs at least two documented reactions/reasons to compare
    if (
      s.step3.type !== 'multiple-choice' &&
      s.step3.explore &&
      Object.keys(s.step3.byFeeling).length < 2
    )
      err('step3.explore', 'explore needs at least two documented feelings to compare')

    scenarios.push(s)
  }

  return { errors, warnings, drafts, scenarios }
}

export function formatReport(r: Report): string {
  const lines: string[] = []
  if (r.errors.length) {
    lines.push(`✖ ${r.errors.length} content error(s):`)
    for (const e of r.errors) lines.push(`  ${e.file}  ${e.path ? `[${e.path}] ` : ''}${e.message}`)
  }
  if (r.warnings.length) {
    lines.push(`⚠ ${r.warnings.length} warning(s):`)
    for (const w of r.warnings)
      lines.push(`  ${w.file}  ${w.path ? `[${w.path}] ` : ''}${w.message}`)
  }
  const draftFiles = Object.keys(r.drafts)
  if (draftFiles.length) {
    lines.push(`✎ draft strings awaiting client sign-off:`)
    for (const f of draftFiles)
      lines.push(`  ${f}: ${r.drafts[f]!.length} (${r.drafts[f]!.join(', ')})`)
  }
  if (!r.errors.length) lines.push(`✔ ${r.scenarios.length} scenario(s) valid`)
  return lines.join('\n')
}
