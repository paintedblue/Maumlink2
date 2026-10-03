import { describe, expect, it } from 'vitest'
import {
  canProceed,
  canTryAnother,
  initialLessonState,
  keySentenceVisible,
  progressIndex,
  reduce,
  type LessonEvent,
  type LessonState,
} from '../../src/engine/lessonMachine'
import { validScenario } from '../fixtures/content'

const scenario = validScenario() // 2 story sentences; options angry/upset/not-sure; A=reconsider
const run = (events: LessonEvent[], start = initialLessonState(scenario.id), sc = scenario) =>
  events.reduce((s, e) => reduce(s, e, sc), start)

const toFeeling: LessonEvent[] = [{ type: 'NEXT' }, { type: 'NEXT' }, { type: 'NEXT' }]
const toStep3: LessonEvent[] = [
  ...toFeeling,
  { type: 'SELECT_FEELING', id: 'angry' },
  { type: 'NEXT' },
]
const toAction: LessonEvent[] = [...toStep3, { type: 'GOT_IT' }]
const toFeedback = (id: 'A' | 'B' | 'C' | 'D'): LessonEvent[] => [
  ...toAction,
  { type: 'SELECT_ACTION', id },
  { type: 'CHOOSE' },
]

describe('S1 situation', () => {
  it('advances sentence by sentence, then key sentence, then feeling', () => {
    let s = initialLessonState(scenario.id)
    expect(s.step).toBe('situation')
    expect(keySentenceVisible(s, scenario)).toBe(false)
    s = reduce(s, { type: 'NEXT' }, scenario)
    expect(s.sentenceIndex).toBe(1)
    s = reduce(s, { type: 'NEXT' }, scenario)
    expect(keySentenceVisible(s, scenario)).toBe(true)
    s = reduce(s, { type: 'NEXT' }, scenario)
    expect(s.step).toBe('feeling')
  })
  it('BACK on situation is a no-op (UI shows Home confirm)', () => {
    const s = run([{ type: 'NEXT' }, { type: 'BACK' }])
    expect(s.step).toBe('situation')
    expect(s.sentenceIndex).toBe(1)
  })
})

describe('S2 feeling', () => {
  it('single-select toggles and switches', () => {
    let s = run([...toFeeling, { type: 'SELECT_FEELING', id: 'angry' }])
    expect(s.feelingIds).toEqual(['angry'])
    s = reduce(s, { type: 'SELECT_FEELING', id: 'upset' }, scenario)
    expect(s.feelingIds).toEqual(['upset'])
    s = reduce(s, { type: 'SELECT_FEELING', id: 'upset' }, scenario)
    expect(s.feelingIds).toEqual([])
  })
  it('multi-select accumulates', () => {
    const multi = { ...scenario, feeling: { ...scenario.feeling, multiSelect: true } }
    const s = run(
      [
        ...toFeeling,
        { type: 'SELECT_FEELING', id: 'angry' },
        { type: 'SELECT_FEELING', id: 'upset' },
      ],
      initialLessonState(scenario.id),
      multi,
    )
    expect(s.feelingIds).toEqual(['angry', 'upset'])
  })
  it('NEXT without a selection announces pickFirst and stays (FR-S2-02)', () => {
    const s = run([...toFeeling, { type: 'NEXT' }])
    expect(s.step).toBe('feeling')
    expect(s.announce).toEqual({ kind: 'pickFirst' })
    expect(canProceed(s, scenario)).toBe(false)
  })
  it('idle tick opens the hint once per visit (FR-S2-04)', () => {
    let s = run([...toFeeling, { type: 'IDLE_TICK' }])
    expect(s.hintOpen).toBe(true)
    s = reduce(s, { type: 'CLOSE_HINT' }, scenario)
    s = reduce(s, { type: 'IDLE_TICK' }, scenario)
    expect(s.hintOpen).toBe(false)
  })
  it('idle tick does nothing once a feeling is selected', () => {
    const s = run([...toFeeling, { type: 'SELECT_FEELING', id: 'angry' }, { type: 'IDLE_TICK' }])
    expect(s.hintOpen).toBe(false)
  })
  it('hint suggestion selects and closes the panel (FR-S2-03)', () => {
    const s = run([
      ...toFeeling,
      { type: 'OPEN_HINT' },
      { type: 'SELECT_HINT_FEELING', id: 'upset' },
    ])
    expect(s.feelingIds).toEqual(['upset'])
    expect(s.hintOpen).toBe(false)
  })
  it('not-sure: first opens hint, second auto-selects first suggestion (FR-S2-05)', () => {
    let s = run([...toFeeling, { type: 'SELECT_FEELING', id: 'not-sure' }])
    expect(s.hintOpen).toBe(true)
    expect(s.feelingIds).toEqual([])
    s = reduce(s, { type: 'CLOSE_HINT' }, scenario)
    s = reduce(s, { type: 'SELECT_FEELING', id: 'not-sure' }, scenario)
    expect(s.feelingIds).toEqual(['angry'])
    expect(s.announce).toEqual({ kind: 'notSureTwice', emotionId: 'angry' })
    expect(canProceed(s, scenario)).toBe(true)
  })
  it('BACK returns to the situation at the key sentence, keeping selection', () => {
    const s = run([...toFeeling, { type: 'SELECT_FEELING', id: 'angry' }, { type: 'BACK' }])
    expect(s.step).toBe('situation')
    expect(keySentenceVisible(s, scenario)).toBe(true)
    expect(s.feelingIds).toEqual(['angry'])
  })
})

describe('S3 step3', () => {
  it('reason variant proceeds on GOT_IT; TELL_MORE flags more', () => {
    let s = run(toStep3)
    expect(s.step).toBe('step3')
    s = reduce(s, { type: 'TELL_MORE' }, scenario)
    expect(s.moreShown).toBe(true)
    s = reduce(s, { type: 'GOT_IT' }, scenario)
    expect(s.step).toBe('action')
  })
  it('multiple-choice variant requires a selection', () => {
    const mc = {
      ...scenario,
      step3: {
        type: 'multiple-choice' as const,
        question: { ko: 'q' },
        principle: { ko: 'p' },
        more: { ko: 'm' },
        options: (['A', 'B', 'C', 'D'] as const).map((id) => ({
          id,
          text: { ko: id },
          ack: { ko: 'ok' },
        })),
      },
    }
    let s = run(toStep3, initialLessonState(scenario.id), mc)
    s = reduce(s, { type: 'GOT_IT' }, mc)
    expect(s.step).toBe('step3')
    expect(s.announce?.kind).toBe('pickFirst')
    s = reduce(s, { type: 'SELECT_STEP3_OPTION', id: 'B' }, mc)
    s = reduce(s, { type: 'GOT_IT' }, mc)
    expect(s.step).toBe('action')
  })
  it('BACK preserves the feeling selection', () => {
    const s = run([...toStep3, { type: 'BACK' }])
    expect(s.step).toBe('feeling')
    expect(s.feelingIds).toEqual(['angry'])
  })
})

describe('S4 action / S5 feedback', () => {
  it('CHOOSE needs a selection', () => {
    const s = run([...toAction, { type: 'CHOOSE' }])
    expect(s.step).toBe('action')
    expect(s.announce?.kind).toBe('pickFirst')
  })
  it('reaches feedback with the chosen action', () => {
    const s = run(toFeedback('C'))
    expect(s.step).toBe('feedback')
    expect(s.actionId).toBe('C')
    expect(canTryAnother(s, scenario)).toBe(false)
  })
  it('TRY_ANOTHER only for reconsider actions; returns to action with the tried id dimmed (FR-S5-02)', () => {
    let s = run(toFeedback('A'))
    expect(canTryAnother(s, scenario)).toBe(true)
    s = reduce(s, { type: 'TRY_ANOTHER' }, scenario)
    expect(s.step).toBe('action')
    expect(s.actionId).toBeUndefined()
    expect(s.triedActionIds).toEqual(['A'])
    const notAllowed = reduce(run(toFeedback('C')), { type: 'TRY_ANOTHER' }, scenario)
    expect(notAllowed.step).toBe('feedback')
  })
  it('BACK from feedback keeps the choice', () => {
    const s = run([...toFeedback('B'), { type: 'BACK' }])
    expect(s.step).toBe('action')
    expect(s.actionId).toBe('B')
  })
  it('CONTINUE completes and reaches wrapup (FR-S5-03)', () => {
    const s = run([...toFeedback('C'), { type: 'CONTINUE' }])
    expect(s.step).toBe('wrapup')
    expect(s.completed).toBe(true)
    expect(progressIndex(s.step)).toBe(5)
  })
})

describe('misc', () => {
  it('RESTART returns to the initial state', () => {
    const s = run([...toFeedback('C'), { type: 'CONTINUE' }, { type: 'RESTART' }])
    expect(s).toEqual(initialLessonState(scenario.id))
  })
  it('CLEAR_ANNOUNCE clears only the announce', () => {
    const s: LessonState = { ...run([...toFeeling, { type: 'NEXT' }]) }
    const cleared = reduce(s, { type: 'CLEAR_ANNOUNCE' }, scenario)
    expect(cleared.announce).toBeUndefined()
    expect(cleared.step).toBe('feeling')
  })
  it('returns the same reference for no-op events (no spurious persistence)', () => {
    const s = run(toStep3)
    expect(reduce(s, { type: 'SELECT_ACTION', id: 'A' }, scenario)).toBe(s)
  })
})
