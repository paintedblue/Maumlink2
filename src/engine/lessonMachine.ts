/**
 * Lesson state machine — PRD §5.2 / FR-ENG-03. A pure reducer with no React or DOM.
 * The scenario is passed in so transitions can respect content rules
 * (multiSelect, step-3 type, action quality, story length).
 */
import { NOT_SURE, type OptionId, type Scenario } from '@/content/schema'

export type Step = 'situation' | 'feeling' | 'step3' | 'action' | 'feedback' | 'wrapup'
export const STEP_ORDER: readonly Step[] = ['situation', 'feeling', 'step3', 'action', 'feedback']

/** Transient one-shot cue the UI should speak/show, then clear. */
export type Announce = { kind: 'notSureTwice'; emotionId: string } | { kind: 'pickFirst' }

export interface LessonState {
  scenarioId: string
  step: Step
  /** 0..story.length; index === story.length shows the key sentence. */
  sentenceIndex: number
  /** Selected feelings in selection order. */
  feelingIds: string[]
  hintOpen: boolean
  /** The idle auto-hint fires at most once per visit to the feeling screen (FR-S2-04). */
  hintAutoShown: boolean
  notSureCount: number
  step3OptionId?: OptionId
  /** Body-reaction explore mode: the feeling whose reaction is shown, and every one pressed. */
  exploredFeelingId?: string
  exploredFeelingIds: string[]
  moreShown: boolean
  /** Selected on S4; becomes the chosen action on S5. */
  actionId?: OptionId
  triedActionIds: OptionId[]
  completed: boolean
  announce?: Announce
}

export type LessonEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SELECT_FEELING'; id: string }
  | { type: 'OPEN_HINT' }
  | { type: 'CLOSE_HINT' }
  | { type: 'SELECT_HINT_FEELING'; id: string }
  | { type: 'IDLE_TICK' }
  | { type: 'SELECT_STEP3_OPTION'; id: OptionId }
  | { type: 'EXPLORE_FEELING'; id: string }
  | { type: 'TELL_MORE' }
  | { type: 'GOT_IT' }
  | { type: 'SELECT_ACTION'; id: OptionId }
  | { type: 'CHOOSE' }
  | { type: 'TRY_ANOTHER' }
  | { type: 'CONTINUE' }
  | { type: 'CLEAR_ANNOUNCE' }
  | { type: 'RESTART' }

export function initialLessonState(scenarioId: string): LessonState {
  return {
    scenarioId,
    step: 'situation',
    sentenceIndex: 0,
    feelingIds: [],
    hintOpen: false,
    hintAutoShown: false,
    notSureCount: 0,
    exploredFeelingIds: [],
    moreShown: false,
    triedActionIds: [],
    completed: false,
  }
}

export function keySentenceVisible(state: LessonState, scenario: Scenario): boolean {
  return state.sentenceIndex >= scenario.situation.story.length
}

export function canProceed(state: LessonState, scenario: Scenario): boolean {
  switch (state.step) {
    case 'situation':
      return true
    case 'feeling':
      return state.feelingIds.length > 0
    case 'step3':
      return scenario.step3.type !== 'multiple-choice' || state.step3OptionId !== undefined
    case 'action':
      return state.actionId !== undefined
    case 'feedback':
      return true
    case 'wrapup':
      return false
  }
}

export function chosenAction(state: LessonState, scenario: Scenario) {
  return scenario.action.options.find((o) => o.id === state.actionId)
}

/** Feelings with a documented reaction/reason in explore mode, in feeling-screen order. */
export function explorableFeelings(scenario: Scenario): string[] {
  const s3 = scenario.step3
  if (s3.type === 'multiple-choice' || !s3.explore) return []
  return scenario.feeling.options.filter((id) => id in s3.byFeeling)
}

/** Actions the child has tried in explore mode (in order), ending with the current one. */
export function triedActions(state: LessonState, scenario: Scenario) {
  const ids = [...state.triedActionIds, ...(state.actionId ? [state.actionId] : [])]
  return [...new Set(ids)]
    .map((id) => scenario.action.options.find((o) => o.id === id))
    .filter((o) => o !== undefined)
}

export function canTryAnother(state: LessonState, scenario: Scenario): boolean {
  if (state.step !== 'feedback') return false
  const action = chosenAction(state, scenario)
  if (!action) return false
  if (scenario.action.explore)
    return triedActions(state, scenario).length < scenario.action.options.length
  return action.quality === 'reconsider'
}

/** Index 0..4 for the five progress dots (wrapup counts as all complete). */
export function progressIndex(step: Step): number {
  const i = STEP_ORDER.indexOf(step)
  return i === -1 ? STEP_ORDER.length : i
}

export function reduce(state: LessonState, event: LessonEvent, scenario: Scenario): LessonState {
  const s = state
  switch (event.type) {
    case 'CLEAR_ANNOUNCE':
      return s.announce ? { ...s, announce: undefined } : s
    case 'RESTART':
      return initialLessonState(scenario.id)
  }

  switch (s.step) {
    // ---------------------------------------------------------------- S1
    case 'situation': {
      if (event.type === 'NEXT') {
        if (!keySentenceVisible(s, scenario)) return { ...s, sentenceIndex: s.sentenceIndex + 1 }
        return { ...s, step: 'feeling', hintOpen: false, hintAutoShown: false }
      }
      // Story pages participate in Back navigation; leaving uses the explicit Home control.
      if (event.type === 'BACK' && s.sentenceIndex > 0)
        return { ...s, sentenceIndex: s.sentenceIndex - 1 }
      return s
    }

    // ---------------------------------------------------------------- S2
    case 'feeling': {
      switch (event.type) {
        case 'SELECT_FEELING': {
          if (!scenario.feeling.options.includes(event.id)) return s
          if (event.id === NOT_SURE) {
            const count = s.notSureCount + 1
            if (count >= 2) {
              // D11 / FR-S2-05: second "not sure" → auto-select the first suggestion, warmly.
              const pick = scenario.feeling.hint.suggest[0]
              return {
                ...s,
                notSureCount: count,
                hintOpen: false,
                feelingIds: [pick],
                announce: { kind: 'notSureTwice', emotionId: pick },
              }
            }
            return { ...s, notSureCount: count, hintOpen: true, hintAutoShown: true }
          }
          if (scenario.feeling.multiSelect) {
            const has = s.feelingIds.includes(event.id)
            return {
              ...s,
              feelingIds: has
                ? s.feelingIds.filter((x) => x !== event.id)
                : [...s.feelingIds, event.id],
            }
          }
          const same = s.feelingIds[0] === event.id
          return { ...s, feelingIds: same ? [] : [event.id] }
        }
        case 'OPEN_HINT':
          return { ...s, hintOpen: true, hintAutoShown: true }
        case 'CLOSE_HINT':
          return { ...s, hintOpen: false }
        case 'SELECT_HINT_FEELING': {
          if (!scenario.feeling.hint.suggest.includes(event.id)) return s
          const ids = scenario.feeling.multiSelect
            ? s.feelingIds.includes(event.id)
              ? s.feelingIds
              : [...s.feelingIds, event.id]
            : [event.id]
          return { ...s, feelingIds: ids, hintOpen: false }
        }
        case 'IDLE_TICK':
          if (s.hintAutoShown || s.hintOpen || s.feelingIds.length > 0) return s
          return { ...s, hintOpen: true, hintAutoShown: true }
        case 'NEXT':
          if (s.feelingIds.length === 0) return { ...s, announce: { kind: 'pickFirst' } }
          {
            // Explore mode opens on the child's own feeling when the source documents it.
            const own = s.feelingIds.find((id) => explorableFeelings(scenario).includes(id))
            return {
              ...s,
              step: 'step3',
              hintOpen: false,
              moreShown: false,
              step3OptionId: undefined,
              exploredFeelingId: own,
              exploredFeelingIds: own ? [own] : [],
            }
          }
        case 'BACK':
          return {
            ...s,
            step: 'situation',
            hintOpen: false,
            sentenceIndex: scenario.situation.story.length,
          }
      }
      return s
    }

    // ---------------------------------------------------------------- S3
    case 'step3': {
      switch (event.type) {
        case 'SELECT_STEP3_OPTION':
          return scenario.step3.type === 'multiple-choice' ? { ...s, step3OptionId: event.id } : s
        case 'EXPLORE_FEELING':
          if (!explorableFeelings(scenario).includes(event.id)) return s
          return {
            ...s,
            exploredFeelingId: event.id,
            exploredFeelingIds: s.exploredFeelingIds.includes(event.id)
              ? s.exploredFeelingIds
              : [...s.exploredFeelingIds, event.id],
          }
        case 'TELL_MORE':
          return scenario.step3.more ? { ...s, moreShown: true } : s
        case 'GOT_IT':
        case 'NEXT':
          if (!canProceed(s, scenario)) return { ...s, announce: { kind: 'pickFirst' } }
          return { ...s, step: 'action' }
        case 'BACK':
          return { ...s, step: 'feeling', hintOpen: false, hintAutoShown: false }
      }
      return s
    }

    // ---------------------------------------------------------------- S4
    case 'action': {
      switch (event.type) {
        case 'SELECT_ACTION':
          return { ...s, actionId: s.actionId === event.id ? undefined : event.id }
        case 'CHOOSE':
        case 'NEXT':
          if (s.actionId === undefined) return { ...s, announce: { kind: 'pickFirst' } }
          return { ...s, step: 'feedback' }
        case 'BACK':
          return { ...s, step: 'step3' }
      }
      return s
    }

    // ---------------------------------------------------------------- S5
    case 'feedback': {
      switch (event.type) {
        case 'TRY_ANOTHER': {
          if (!canTryAnother(s, scenario) || s.actionId === undefined) return s
          const tried = s.triedActionIds.includes(s.actionId)
            ? s.triedActionIds
            : [...s.triedActionIds, s.actionId]
          return { ...s, step: 'action', actionId: undefined, triedActionIds: tried }
        }
        case 'CONTINUE':
        case 'NEXT':
          return { ...s, step: 'wrapup', completed: true }
        case 'BACK':
          return { ...s, step: 'action' }
      }
      return s
    }

    // ---------------------------------------------------------------- S6
    case 'wrapup':
      return s
  }
}
