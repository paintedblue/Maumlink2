/**
 * Validator tests — every rule in PRD §10 has a failing fixture.
 * Fixtures are built in a temp dir so tests never touch real content.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { validateAll } from '../../scripts/validate-core'
import { validScenario, validEmotions, validUi } from '../fixtures/content'

let root: string

function write(rel: string, data: unknown) {
  const p = join(root, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data))
}

function setupValid() {
  write('content/emotions.json', validEmotions)
  write('content/ui.json', validUi)
  for (const icon of ['think', 'wait', 'talk', 'teacher'])
    write(`public/icons/outcome/${icon}.svg`, '<svg/>')
  for (const e of validEmotions.emotions) write(`public/icons/emotions/${e.icon}`, '<svg/>')
  write('public/img/test.png', 'x')
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'maumlink-'))
  setupValid()
})
afterEach(() => rmSync(root, { recursive: true, force: true }))

const scenarioErrors = (s: unknown, file = 'test-scenario.json') => {
  write(`content/scenarios/${file}`, s)
  return validateAll(root)
}

describe('validator — passing content', () => {
  it('accepts a valid scenario with no errors', () => {
    const r = scenarioErrors(validScenario())
    expect(r.errors).toEqual([])
    expect(r.scenarios).toHaveLength(1)
  })
  it('passes with zero scenarios (M0 state)', () => {
    const r = validateAll(root)
    expect(r.errors).toEqual([])
    expect(r.scenarios).toHaveLength(0)
  })
})

describe('validator — rule 1: schema', () => {
  it('rejects wrong schemaVersion', () => {
    const r = scenarioErrors({ ...validScenario(), schemaVersion: 2 })
    expect(r.errors.some((e) => e.path === 'schemaVersion')).toBe(true)
  })
  it('rejects missing ko text', () => {
    const s = validScenario()
    s.closing = { ko: '' }
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.path.startsWith('closing'))).toBe(true)
  })
})

describe('validator — rule 2: ids', () => {
  it('requires file name to equal id', () => {
    const r = scenarioErrors(validScenario(), 'wrong-name.json')
    expect(r.errors.some((e) => e.message.includes('file name must be'))).toBe(true)
  })
  it('rejects duplicate ids across files', () => {
    write('content/scenarios/test-scenario.json', validScenario())
    const dup = validScenario()
    write('content/scenarios/other.json', { ...dup, id: 'test-scenario' })
    const r = validateAll(root)
    expect(r.errors.some((e) => e.message.includes('duplicate scenario id'))).toBe(true)
  })
})

describe('validator — rule 3: emotions', () => {
  it('rejects unknown emotion ids', () => {
    const s = validScenario()
    s.feeling.options = ['angry', 'ghost', 'not-sure']
    s.step3 = {
      ...s.step3,
      byFeeling: { angry: { ko: 'a' }, ghost: { ko: 'g' } },
    } as typeof s.step3
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.message.includes('unknown emotion "ghost"'))).toBe(true)
  })
  it('requires not-sure to be last', () => {
    const s = validScenario()
    s.feeling.options = ['not-sure', 'angry', 'upset']
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.message.includes('must be the last option'))).toBe(true)
  })
  it('rejects not-sure in hint suggestions', () => {
    const s = validScenario()
    s.feeling.hint.suggest = ['angry', 'not-sure']
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.message.includes('cannot be a suggestion'))).toBe(true)
  })
})

describe('validator — rule 4: step3 coverage', () => {
  it('flags a feeling option without a byFeeling entry', () => {
    const s = validScenario()
    s.step3 = { ...s.step3, byFeeling: { angry: { ko: 'a' } } } as typeof s.step3
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.path === 'step3.byFeeling.upset')).toBe(true)
  })
  it('flags a byFeeling key that is not an option', () => {
    const s = validScenario()
    s.step3 = {
      ...s.step3,
      byFeeling: { angry: { ko: 'a' }, upset: { ko: 'u' }, worried: { ko: 'w' } },
    } as typeof s.step3
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.path === 'step3.byFeeling.worried')).toBe(true)
  })
})

describe('validator — rule 5: actions', () => {
  it('requires exactly four actions', () => {
    const s = validScenario()
    s.action.options = s.action.options.slice(0, 3)
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.path.startsWith('action.options'))).toBe(true)
  })
  it('requires outcome icon files to exist', () => {
    const s = validScenario()
    s.action.options[0]!.outcomeIcon = 'missing-icon'
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.message.includes('outcome/missing-icon.svg'))).toBe(true)
  })
})

describe('validator — rules 6–8: warnings and images', () => {
  it('warns (not errors) on missing English and lists drafts', () => {
    const s = validScenario()
    s.closing = { ko: '마무리', draft: true }
    const r = scenarioErrors(s)
    expect(r.errors).toEqual([])
    expect(r.warnings.some((w) => w.path === 'closing')).toBe(true)
    expect(r.drafts['content/scenarios/test-scenario.json']).toContain('closing')
  })
  it('warns on over-long story sentences', () => {
    const s = validScenario()
    s.situation.story = [{ ko: '가'.repeat(61), en: 'x' }]
    const r = scenarioErrors(s)
    expect(r.warnings.some((w) => w.message.includes('max 60'))).toBe(true)
  })
  it('errors when a referenced image is missing', () => {
    const s = validScenario()
    s.situation.image = '/img/nope.png'
    const r = scenarioErrors(s)
    expect(r.errors.some((e) => e.message.includes('img/nope.png'))).toBe(true)
  })
})

describe('PDF source omissions', () => {
  it('accepts emotions without not-sure and an explicitly documented source gap', () => {
    const s = validScenario()
    s.feeling.options = ['angry', 'upset']
    s.step3 = {
      type: 'reason',
      question: { ko: '왜?' },
      byFeeling: { angry: { ko: '원문 이유' } },
      sourceOmissions: ['upset'],
    }
    expect(scenarioErrors(s).errors).toEqual([])
  })
  it.each(['angry', 'unknown', 'not-sure'])('rejects invalid source omission %s', (id) => {
    const s = validScenario()
    if (s.step3.type !== 'multiple-choice') s.step3.sourceOmissions = [id]
    expect(scenarioErrors(s).errors.some((e) => e.path === 'step3.sourceOmissions')).toBe(true)
  })
})
