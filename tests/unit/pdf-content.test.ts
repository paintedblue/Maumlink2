import { describe, expect, it } from 'vitest'
import { scenarios } from '@/content/loader'
import { validatePdfContent } from '../../scripts/validate-pdf-content'

const root = process.cwd()
describe('original PDF Korean content', () => {
  it('matches every source field, emotion order and documented omission', () => {
    expect(validatePdfContent(root, scenarios)).toEqual([])
  })
  it('rejects a paraphrase, an added explanation and a removed lesson', () => {
    const modified = structuredClone(scenarios)
    modified[0]!.situation.story[0]!.ko = '새로 쓴 이야기'
    modified[0]!.step3.more = { ko: '원문에 없는 추가 설명' }
    modified.pop()
    const errors = validatePdfContent(root, modified)
    expect(errors.some((e) => e.includes('situation.story.0'))).toBe(true)
    expect(errors.some((e) => e.includes('step3.more: no PDF source'))).toBe(true)
    expect(errors.some((e) => e.includes('missing source lesson'))).toBe(true)
  })
})
