/** Lesson store — wraps the pure reducer, persists every transition to sessionStorage. */
import { create } from 'zustand'
import type { Scenario } from '@/content/schema'
import { initialLessonState, reduce, type LessonEvent, type LessonState } from './lessonMachine'
import { clearSession, loadSession, saveSession } from './persistence'

interface LessonStore {
  scenario?: Scenario
  state?: LessonState
  /** Start a lesson, restoring the saved session for this scenario if one exists. */
  start: (scenario: Scenario) => void
  /** Forget any saved session (call before navigating into a lesson that must start at S1). */
  reset: () => void
  dispatch: (event: LessonEvent) => void
  end: () => void
}

export const useLesson = create<LessonStore>()((set, get) => ({
  reset: () => {
    clearSession()
    set({ scenario: undefined, state: undefined })
  },
  start: (scenario) => {
    const state = loadSession(scenario.id) ?? initialLessonState(scenario.id)
    saveSession(state)
    set({ scenario, state })
  },
  dispatch: (event) => {
    const { scenario, state } = get()
    if (!scenario || !state) return
    const next = reduce(state, event, scenario)
    if (next !== state) {
      saveSession(next)
      set({ state: next })
    }
  },
  end: () => {
    clearSession()
    set({ scenario: undefined, state: undefined })
  },
}))
