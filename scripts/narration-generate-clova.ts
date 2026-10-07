#!/usr/bin/env tsx
/**
 * `pnpm narration:generate:clova [--voice clova-ndain] [--out .narration-downloads/<voice>]`
 * `pnpm narration:generate:clova --sample "문장" --speakers ndain,ngaram,nhajun --speeds 0,2,4 --out ../voice-samples`
 *
 * One-time generation with NAVER Cloud CLOVA Voice (TTS Premium). Every phrase of
 * content-source/narration/inventory.json that the voice set has not recorded yet is synthesized
 * once and saved as `<out>/<clip id>.mp3`; afterwards run
 * `pnpm narration:import <out> --voice <voice>` to bundle the clips. The app never calls the API.
 *
 * Credentials come from `.env.local` (gitignored): NCP_CLOVA_CLIENT_ID and NCP_CLOVA_CLIENT_SECRET
 * (NAVER Cloud console → AI·NAVER API → Application, with CLOVA Voice enabled).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { narrationKey } from '../src/services/recordedNarration'
import { isNarrationVoiceId, NARRATION_VOICES } from '../src/services/narration/voices'

const ENDPOINT = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts'
const root = fileURLToPath(new URL('..', import.meta.url))

const args = process.argv.slice(2)
const option = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const voiceId = option('voice') ?? 'clova-ndain'
if (!isNarrationVoiceId(voiceId)) {
  console.error(
    `unknown voice set "${voiceId}"; known: ${Object.keys(NARRATION_VOICES).join(', ')}`,
  )
  process.exit(1)
}
const voice = NARRATION_VOICES[voiceId]
const sample = option('sample')
const out = resolve(root, option('out') ?? join('.narration-downloads', voiceId))
mkdirSync(out, { recursive: true })

const envPath = join(root, '.env.local')
if (existsSync(envPath)) process.loadEnvFile(envPath)
const clientId = process.env.NCP_CLOVA_CLIENT_ID
const clientSecret = process.env.NCP_CLOVA_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('Set NCP_CLOVA_CLIENT_ID and NCP_CLOVA_CLIENT_SECRET in maumlink/.env.local first.')
  process.exit(1)
}

interface Params {
  speaker: string
  text: string
  speed: number
  pitch: number
  volume: number
}
async function synthesize(params: Params): Promise<Buffer> {
  const body = new URLSearchParams({
    speaker: params.speaker,
    text: params.text,
    speed: String(params.speed),
    pitch: String(params.pitch),
    volume: String(params.volume),
    format: 'mp3',
  })
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId!,
        'X-NCP-APIGW-API-KEY': clientSecret!,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    const detail = (await res.text()).slice(0, 300)
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt))
      continue
    }
    throw new Error(`CLOVA Voice ${res.status} for "${params.text.slice(0, 30)}…": ${detail}`)
  }
}

const generation = { speed: 0, pitch: 0, volume: 0, ...voice.generation }

if (sample) {
  // Preview mode: the same sentence for several speakers and speeds, named for listening.
  const speakers = (option('speakers') ?? voice.voiceId).split(',')
  const speeds = (option('speeds') ?? String(generation.speed)).split(',').map(Number)
  for (const speaker of speakers)
    for (const speed of speeds) {
      const file = join(out, `clova-${speaker}_speed${speed}.mp3`)
      writeFileSync(file, await synthesize({ ...generation, speaker, text: sample, speed }))
      console.log(`wrote ${file}`)
    }
  process.exit(0)
}

interface Inventory {
  clips: Array<{ id: string; text: string; sources: string[] }>
}
const inventory = JSON.parse(
  readFileSync(join(root, 'content-source/narration/inventory.json'), 'utf8'),
) as Inventory
const recorded = new Set(voice.clips.map((clip) => narrationKey(clip.text)))
const all = args.includes('--all')
const todo = inventory.clips.filter(
  (phrase) =>
    all || (!recorded.has(narrationKey(phrase.text)) && !existsSync(join(out, `${phrase.id}.mp3`))),
)
console.log(
  `${voiceId} (speaker ${voice.voiceId}, speed ${generation.speed}): ${todo.length} of ${inventory.clips.length} phrases to generate → ${out}`,
)
let chars = 0
for (const [i, phrase] of todo.entries()) {
  const audio = await synthesize({ ...generation, speaker: voice.voiceId, text: phrase.text })
  writeFileSync(join(out, `${phrase.id}.mp3`), audio)
  chars += phrase.text.length
  console.log(`${String(i + 1).padStart(3)}/${todo.length} ${phrase.id} ${phrase.text}`)
  await new Promise((r) => setTimeout(r, 200))
}
console.log(`done: ${todo.length} clips, ${chars} characters billed.`)
if (todo.length) console.log(`next: pnpm narration:import ${out} --voice ${voiceId}`)
