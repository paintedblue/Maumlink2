import recording from './recorded-narration.json'
import type { Locale } from './settings'

export interface RecordedClip {
  text: string
  url: string
}

/** Ignore punctuation added between clips, never skip unrecorded words. */
export function narrationKey(text: string): string {
  return text.normalize('NFC').replace(/\p{P}/gu, '').replace(/\s+/g, ' ').trim()
}

export function resolveRecordedNarration(
  text: string,
  locale: Locale,
  clips: readonly RecordedClip[] = recording.clips,
): string[] | undefined {
  if (locale !== recording.locale) return undefined
  const candidates = clips
    .map((clip) => ({ ...clip, key: narrationKey(clip.text) }))
    .filter((clip) => clip.key.length > 0)
    .sort((a, b) => b.key.length - a.key.length)
  let remaining = narrationKey(text)
  const urls: string[] = []
  while (remaining) {
    const clip = candidates.find(({ key }) => remaining === key || remaining.startsWith(`${key} `))
    if (!clip) return undefined
    urls.push(clip.url)
    remaining = remaining.slice(clip.key.length).trimStart()
  }
  return urls.length ? urls : undefined
}
