#!/usr/bin/env tsx
/**
 * `pnpm narration:import <dir>` — registers narration clips downloaded from the ElevenLabs
 * web app (one-time generation; the app never calls ElevenLabs at runtime).
 *
 * Reads content-source/narration/inventory.json (see narration-inventory.ts), looks for
 * `<dir>/<clip id>.mp3` for every phrase, stores it as public/audio/ko/<clip id>.mp3 and
 * registers it in src/services/recorded-narration.json. Phrases already recorded are kept
 * unless a new file is present. With ffmpeg on PATH the download (44.1 kHz 128 kbps) is
 * re-encoded to 64 kbps mono, which halves the offline precache without audible loss for speech.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { narrationKey } from '../src/services/recordedNarration'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = process.argv[2]
if (!dir) {
  console.error('usage: pnpm narration:import <directory with <clip id>.mp3 files>')
  process.exit(1)
}
const source = resolve(dir)
const recordingPath = join(root, 'src/services/recorded-narration.json')
const inventoryPath = join(root, 'content-source/narration/inventory.json')
const outDir = join(root, 'public/audio/ko')
mkdirSync(outDir, { recursive: true })

interface Clip {
  text: string
  url: string
}
interface Recording {
  provider: string
  voiceId: string
  voiceName: string
  model: string
  locale: string
  clips: Clip[]
}
interface Inventory {
  voiceId: string
  clips: Array<{ id: string; text: string; sources: string[]; url?: string }>
}

const recording = JSON.parse(readFileSync(recordingPath, 'utf8')) as Recording
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')) as Inventory
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
  if (!reencode) return copyFileSync(file, target)
  execFileSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-i', file, '-ac', '1', '-ar', '44100', '-b:a', '64k', target],
    { stdio: 'inherit' },
  )
}

let added = 0
const missing: string[] = []
for (const phrase of inventory.clips) {
  const file = join(source, `${phrase.id}.mp3`)
  if (!existsSync(file)) {
    if (!recorded.has(narrationKey(phrase.text))) missing.push(`${phrase.id} ${phrase.text}`)
    continue
  }
  const url = `/audio/ko/${phrase.id}.mp3`
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
  `${added} clips imported${reencode ? ' (re-encoded to 64 kbps mono)' : ''}; ${recording.clips.length} recorded phrases total`,
)
if (missing.length) {
  console.log(`${missing.length} phrases still without a clip:`)
  for (const line of missing) console.log(`  ${line}`)
  process.exitCode = 2
}
