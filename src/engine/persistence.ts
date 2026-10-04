/** Validate storage as untrusted input; stale/corrupt sessions restart quietly. */
import { z } from 'zod'
import type { Scenario } from '@/content/schema'
import { initialLessonState, type LessonState } from './lessonMachine'

const KEY = 'maumlink.session.v1'
const option = z.enum(['A', 'B', 'C', 'D'])
const sessionSchema = z.object({
  scenarioId: z.string(),
  step: z.enum(['situation', 'feeling', 'step3', 'action', 'feedback', 'wrapup']),
  sentenceIndex: z.number().int().nonnegative(),
  feelingIds: z.array(z.string()),
  hintOpen: z.boolean(),
  hintAutoShown: z.boolean(),
  notSureCount: z.number().int().nonnegative(),
  step3OptionId: option.optional(),
  exploredFeelingId: z.string().optional(),
  exploredFeelingIds: z.array(z.string()).default([]),
  moreShown: z.boolean(),
  actionId: option.optional(),
  triedActionIds: z.array(option),
  completed: z.boolean(),
})

export function saveSession(state: LessonState): void {
  try {
    const { announce: _drop, ...rest } = state
    void _drop
    window.sessionStorage.setItem(KEY, JSON.stringify(rest))
  } catch {
    /* Storage is optional, including in private mode. */
  }
}

export function loadSession(scenario: Scenario): LessonState | undefined {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return undefined
    const result = sessionSchema.safeParse(JSON.parse(raw))
    if (!result.success) return undefined
    const s = result.data
    if (s.scenarioId !== scenario.id) return undefined
    const feelingsValid = s.feelingIds.every(
      (id) => id !== 'not-sure' && scenario.feeling.options.includes(id),
    )
    const explorable = scenario.step3.type === 'multiple-choice' ? {} : scenario.step3.byFeeling
    const exploredValid = [...s.exploredFeelingIds, s.exploredFeelingId ?? []]
      .flat()
      .every((id) => id in explorable)
    const needsFeeling = ['step3', 'action', 'feedback', 'wrapup'].includes(s.step)
    const needsAction = ['feedback', 'wrapup'].includes(s.step)
    if (
      !feelingsValid ||
      !exploredValid ||
      s.sentenceIndex > scenario.situation.story.length ||
      (!scenario.feeling.multiSelect && s.feelingIds.length > 1) ||
      (needsFeeling && !s.feelingIds.length) ||
      (needsAction && !s.actionId) ||
      s.completed !== (s.step === 'wrapup')
    )
      return undefined
    return {
      ...initialLessonState(scenario.id),
      ...s,
      hintOpen: s.step === 'feeling' && s.hintOpen,
    }
  } catch {
    return undefined
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* optional */
  }
}
