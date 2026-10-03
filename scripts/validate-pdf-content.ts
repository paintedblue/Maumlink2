/** Compare shipped Korean lesson copy against the reviewed PDF transcription ledger. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Scenario } from '../src/content/schema'

interface Transcription {
  pdf: string
  sha256: string
  strings: Record<string, { page: number; ko: string }>
  feelingOptions: string[]
  sourceOmissions: string[]
}

function koreanStrings(value: unknown, path = '', result: Record<string, string> = {}) {
  if (!value || typeof value !== 'object') return result
  if ('ko' in value && typeof value.ko === 'string') result[path] = value.ko
  else
    for (const [key, child] of Object.entries(value))
      koreanStrings(child, path ? `${path}.${key}` : key, result)
  return result
}

export function validatePdfContent(root: string, scenarios: Scenario[]): string[] {
  const ledger = JSON.parse(
    readFileSync(join(root, 'content-source/pdf-transcriptions.json'), 'utf8'),
  ) as { scenarios: Record<string, Transcription> }
  const errors: string[] = []
  for (const scenario of scenarios) {
    const source = ledger.scenarios[scenario.id]
    if (!source) {
      errors.push(`${scenario.id}: missing PDF transcription`)
      continue
    }
    const actual = koreanStrings(scenario)
    for (const [path, expected] of Object.entries(source.strings))
      if (actual[path] !== expected.ko)
        errors.push(`${scenario.id}.${path}: differs from ${source.pdf}, page ${expected.page}`)
    for (const path of Object.keys(actual))
      if (!(path in source.strings)) errors.push(`${scenario.id}.${path}: no PDF source`)
    if (JSON.stringify(scenario.feeling.options) !== JSON.stringify(source.feelingOptions))
      errors.push(`${scenario.id}: emotion options differ from PDF`)
    const omissions =
      scenario.step3.type === 'multiple-choice' ? [] : (scenario.step3.sourceOmissions ?? [])
    if (JSON.stringify(omissions) !== JSON.stringify(source.sourceOmissions))
      errors.push(`${scenario.id}: source omissions differ from PDF ledger`)
  }
  for (const id of Object.keys(ledger.scenarios))
    if (!scenarios.some((s) => s.id === id)) errors.push(`${id}: missing source lesson`)
  return errors
}
