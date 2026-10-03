/**
 * Content loader — imports every scenario JSON at build time (FR-ENG-01: adding a
 * file is enough), validates in dev, and exposes typed lookups.
 */
import emotionsRaw from '@content/emotions.json'
import uiRaw from '@content/ui.json'
import {
  DOMAINS,
  EmotionsFile,
  Scenario,
  UiFile,
  type Domain,
  type Emotion,
  type Scenario as ScenarioT,
} from './schema'

const rawScenarios = import.meta.glob('/content/scenarios/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

function parseOrThrow<T>(
  label: string,
  parse: () => { success: boolean; data?: T; error?: unknown },
): T {
  const r = parse()
  if (!r.success) {
    // In production the build-time validator has already guaranteed validity.
    if (import.meta.env.DEV) console.error(`[content] ${label} failed validation`, r.error)
    throw new Error(`Invalid content: ${label}`)
  }
  return r.data as T
}

export const emotionsFile: EmotionsFile = parseOrThrow('emotions.json', () =>
  EmotionsFile.safeParse(emotionsRaw),
)
export const ui: UiFile = parseOrThrow('ui.json', () => UiFile.safeParse(uiRaw))

export const scenarios: ScenarioT[] = Object.entries(rawScenarios)
  .map(([path, data]) => parseOrThrow(path, () => Scenario.safeParse(data)))
  .sort((a, b) => a.domain.localeCompare(b.domain) || a.order - b.order)

export const emotionsById: Record<string, Emotion> = Object.fromEntries(
  emotionsFile.emotions.map((e) => [e.id, e]),
)

export function getEmotion(id: string): Emotion {
  const e = emotionsById[id]
  if (!e) throw new Error(`Unknown emotion "${id}"`)
  return e
}

export const scenariosByDomain: Record<Domain, ScenarioT[]> = Object.fromEntries(
  DOMAINS.map((d) => [
    d,
    scenarios.filter((s) => s.domain === d).sort((a, b) => a.order - b.order),
  ]),
) as Record<Domain, ScenarioT[]>

export function getScenario(id: string): ScenarioT | undefined {
  return scenarios.find((s) => s.id === id)
}

/** Next scenario in the same domain by `order`, or undefined (FR-S6-02). */
export function nextScenarioInDomain(current: ScenarioT): ScenarioT | undefined {
  const list = scenariosByDomain[current.domain]
  const i = list.findIndex((s) => s.id === current.id)
  return i >= 0 ? list[i + 1] : undefined
}
