#!/usr/bin/env tsx
/**
 * `pnpm narration:import <dir> [--voice <id>]` — registers narration clips generated once in a
 * TTS web app (ElevenLabs, KidVoice, …); the app never calls a TTS service at runtime.
 *
 * Reads content-source/narration/inventory.json (see narration-inventory.ts), looks for
 * `<dir>/<clip id>.mp3` or `.wav` for every phrase, stores it as `<voice audioDir>/<clip id>.mp3`
 * under public/ and registers it in src/services/narration/<voice>.json. Phrases already
 * recorded are kept unless a new file is present. With ffmpeg on PATH the download is
 * re-encoded to 64 kbps mono MP3, which keeps the offline precache small without audible loss
 * for speech (required for .wav input). `--voice` defaults to the shipped voice.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { narrationKey } from '../src/services/recordedNarration'
import {
  DEFAULT_NARRATION_VOICE,
  isNarrationVoiceId,
  NARRATION_VOICES,
  type NarrationVoice,
} from '../src/services/narration/voices'

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const voiceFlag = args.indexOf('--voice')
const voiceId = voiceFlag >= 0 ? args[voiceFlag + 1] : DEFAULT_NARRATION_VOICE
const dir = args.filter((_, i) => i !== voiceFlag && i !== voiceFlag + 1)[0]
if (!dir || !isNarrationVoiceId(voiceId)) {
  console.error(
    `usage: pnpm narration:import <directory with <clip id>.mp3|.wav files> [--voice ${Object.keys(NARRATION_VOICES).join('|')}]`,
  )
  process.exit(1)
}
const source = resolve(dir)
const recordingPath = join(root, `src/services/narration/${voiceId}.json`)
const inventoryPath = join(root, 'content-source/narration/inventory.json')

type Recording = NarrationVoice
interface Inventory {
  voices: string[]
  clips: Array<{ id: string; text: string; sources: string[] }>
}

const recording = JSON.parse(readFileSync(recordingPath, 'utf8')) as Recording
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')) as Inventory
const outDir = join(root, 'public', recording.audioDir)
mkdirSync(outDir, { recursive: true })
const recorded = new Map(recording.clips.map((clip) => [narrationKey(clip.text), clip]))

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
const reencode = hasFfmpeg()
function store(file: string, target: string): void {
  if (!reencode) {
    if (!file.endsWith('.mp3')) throw new Error(`ffmpeg is required to convert ${file} to MP3`)
    return copyFileSync(file, target)
  }
  execFileSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-i', file, '-ac', '1', '-ar', '44100', '-b:a', '64k', target],
    { stdio: 'inherit' },
  )
}

let added = 0
const missing: string[] = []
for (const phrase of inventory.clips) {
  const file = ['mp3', 'wav']
    .map((ext) => join(source, `${phrase.id}.${ext}`))
    .find((candidate) => existsSync(candidate))
  if (!file) {
    if (!recorded.has(narrationKey(phrase.text))) missing.push(`${phrase.id} ${phrase.text}`)
    continue
  }
  const url = `${recording.audioDir}/${phrase.id}.mp3`
  store(file, join(outDir, `${phrase.id}.mp3`))
  recorded.set(narrationKey(phrase.text), { text: phrase.text, url })
  added++
}

// Keep the inventory order so the JSON diff follows the lesson content.
const order = new Map(inventory.clips.map((clip, i) => [narrationKey(clip.text), i]))
recording.clips = [...recorded.values()].sort(
  (a, b) => (order.get(narrationKey(a.text)) ?? 1e9) - (order.get(narrationKey(b.text)) ?? 1e9),
)
writeFileSync(recordingPath, `${JSON.stringify(recording, null, 2)}\n`)
console.log(
  `${voiceId}: ${added} clips imported${reencode ? ' (re-encoded to 64 kbps mono)' : ''}; ${recording.clips.length} recorded phrases total`,
)
if (missing.length) {
  console.log(`${missing.length} phrases still without a clip:`)
  for (const line of missing) console.log(`  ${line}`)
  process.exitCode = 2
}
