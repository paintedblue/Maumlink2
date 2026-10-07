/**
 * Recorded narration voice sets. Every set maps the same Korean phrases (same clip ids, see
 * scripts/narration-inventory.ts) to MP3s under its own `audioDir`, so switching the shipped
 * voice is a one-line change here or `VITE_NARRATION_VOICE=<id>` at build time. Inactive sets
 * stay in the repo but are left out of the offline precache (vite.config.ts).
 */
import clovaNdain from './clova-ndain.json'
import kyung from './kyung.json'
import luluLolipop from './lulu-lolipop.json'
import sophieLane from './sophie-lane.json'

export interface RecordedClip {
  text: string
  url: string
}
export interface NarrationVoice {
  id: string
  label: string
  provider: string
  voiceId: string
  voiceName: string
  model: string
  locale: string
  audioDir: string
  /** Playback speed for the clips (pitch preserved); < 1 slows a set that was generated fast. */
  playbackRate: number
  /** Provider request parameters used by scripts/narration-generate-clova.ts (one-time generation). */
  generation?: { speed?: number; pitch?: number; volume?: number }
  clips: RecordedClip[]
}

export const NARRATION_VOICES = {
  kyung: kyung as NarrationVoice,
  'sophie-lane': sophieLane as NarrationVoice,
  'clova-ndain': clovaNdain as NarrationVoice,
  'lulu-lolipop': luluLolipop as NarrationVoice,
} satisfies Record<string, NarrationVoice>
export type NarrationVoiceId = keyof typeof NARRATION_VOICES

/** The voice the app ships with unless `VITE_NARRATION_VOICE` overrides it. */
export const DEFAULT_NARRATION_VOICE: NarrationVoiceId = 'lulu-lolipop'

export function isNarrationVoiceId(value: unknown): value is NarrationVoiceId {
  return typeof value === 'string' && value in NARRATION_VOICES
}

export function resolveNarrationVoice(override?: string): NarrationVoice {
  return NARRATION_VOICES[isNarrationVoiceId(override) ? override : DEFAULT_NARRATION_VOICE]
}

// `import.meta.env` is typed only in the app build; scripts and vite.config import this file too.
const env = (import.meta as { env?: Record<string, string | undefined> }).env
export const activeNarrationVoice: NarrationVoice = resolveNarrationVoice(env?.VITE_NARRATION_VOICE)
