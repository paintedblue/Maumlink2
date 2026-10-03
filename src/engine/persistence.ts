/** Session persistence — PRD §5.2 / §11.4: a refresh restores the exact screen. */
import type { LessonState } from './lessonMachine'

const KEY = 'maumlink.session.v1'

export function saveSession(state: LessonState): void {
  try {
    const { announce: _drop, ...rest } = state
    void _drop
    window.sessionStorage.setItem(KEY, JSON.stringify(rest))
  } catch {
    /* private mode / quota — the app must never fail on storage */
  }
}

export function loadSession(scenarioId: string): LessonState | undefined {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as LessonState
    return parsed.scenarioId === scenarioId ? parsed : undefined
  } catch {
    return undefined
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
