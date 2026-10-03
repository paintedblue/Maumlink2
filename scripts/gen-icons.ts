#!/usr/bin/env tsx
/**
 * `pnpm icons` — generates the emotion faces, outcome icons and domain icons as SVG
 * files (PRD §6.6) from one shared geometry so the whole set reads as a single style:
 * 2.5 px soft strokes, round shapes, two dot eyes, at most one extra cue, no teeth.
 * Strokes use currentColor; faces sit on a transparent background (the tile supplies tint).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = (dir: string) => {
  const p = join(root, 'public', 'icons', dir)
  mkdirSync(p, { recursive: true })
  return p
}

const SW = 2.5
const wrap = (body: string, size = 64) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" color="#203B3A" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n${body}\n</svg>\n`

// ---------- emotion faces ----------
const head = `<circle cx="32" cy="32" r="26"/>`
const eyes = (dy = 0, dx = 0) =>
  `<circle cx="${23 + dx}" cy="${28 + dy}" r="2.2" fill="currentColor" stroke="none"/><circle cx="${41 - dx}" cy="${28 + dy}" r="2.2" fill="currentColor" stroke="none"/>`
const eyesClosedDown = `<path d="M19 29q4 3 8 0"/><path d="M37 29q4 3 8 0"/>`
const eyesWide = `<circle cx="23" cy="28" r="3.2"/><circle cx="41" cy="28" r="3.2"/>`
const browsAngry = `<path d="M18 21l9 4"/><path d="M46 21l-9 4"/>`
const browsWorried = `<path d="M18 24l9-3"/><path d="M46 24l-9-3"/>`
const browsFlat = `<path d="M18 22h9"/><path d="M37 22h9"/>`
const mouth = {
  flat: `<path d="M24 42h16"/>`,
  smallFrown: `<path d="M25 44q7-5 14 0"/>`,
  frown: `<path d="M23 45q9-8 18 0"/>`,
  smile: `<path d="M23 40q9 8 18 0"/>`,
  o: `<circle cx="32" cy="43" r="3.5"/>`,
  wavy: `<path d="M23 43q3-3 6 0t6 0 6 0"/>`,
  tight: `<path d="M26 43h12"/><path d="M29 43v2"/><path d="M35 43v2"/>`,
  pressed: `<path d="M25 42q7 3 14 0"/>`,
  small: `<path d="M28 43h8"/>`,
}
const tear = `<path d="M44 36q3 4 0 7q-3-3 0-7z" fill="currentColor" stroke="none" opacity=".7"/>`
const sweat = `<path d="M50 20q3 4 0 7q-3-3 0-7z" fill="currentColor" stroke="none" opacity=".55"/>`
const blush = `<circle cx="18" cy="37" r="3" fill="currentColor" stroke="none" opacity=".25"/><circle cx="46" cy="37" r="3" fill="currentColor" stroke="none" opacity=".25"/>`
const steam = `<path d="M50 14q2-3 0-6"/>`
const question = `<path d="M28 24q0-6 5-6t4 5q-1 3-4 4v3"/><circle cx="33" cy="36" r="1.6" fill="currentColor" stroke="none"/>`
const hands = `<path d="M14 40q3 4 7 2"/><path d="M50 40q-3 4-7 2"/>`

const faces: Record<string, string> = {
  angry: head + browsAngry + eyes(1) + mouth.frown + steam,
  annoyed: head + browsFlat + eyes() + mouth.wavy,
  upset: head + browsWorried + eyes() + mouth.frown + tear,
  hurt: head + browsWorried + eyesClosedDown + mouth.smallFrown,
  frustrated:
    head + browsFlat + eyes() + mouth.tight + `<path d="M26 17v4M32 16v5M38 17v4" opacity=".55"/>`,
  unfair:
    head +
    browsWorried +
    eyes() +
    mouth.frown +
    `<path d="M18 37q2 3 5 1" opacity=".7"/><path d="M46 37q-2 3-5 1" opacity=".7"/>`,
  worried: head + browsWorried + eyes() + mouth.smallFrown + sweat,
  nervous: head + browsWorried + eyesWide + mouth.wavy + sweat,
  embarrassed: head + browsWorried + eyesClosedDown + mouth.small + blush,
  flustered: head + eyesWide + mouth.o + sweat,
  shy: head + eyesClosedDown + mouth.smile + blush + hands,
  scared: head + browsWorried + eyesWide + mouth.o + `<path d="M22 50q10-4 20 0" opacity=".4"/>`,
  sorry:
    head + browsWorried + eyesClosedDown + mouth.smallFrown + `<path d="M32 10v4" opacity=".5"/>`,
  amused: head + eyesClosedDown.replaceAll('q4 3 8 0', 'q4-3 8 0') + mouth.smile,
  'not-sure': head + question,
}

// ---------- outcome icons (S5 outcome panel) ----------
const outcomes: Record<string, string> = {
  think: `<circle cx="30" cy="30" r="14"/><path d="M26 24q0-5 4-5t4 4q-1 3-4 4v3"/><circle cx="30" cy="35" r="1.4" fill="currentColor" stroke="none"/><circle cx="46" cy="46" r="3"/><circle cx="52" cy="54" r="1.8"/>`,
  wait: `<circle cx="32" cy="34" r="18"/><path d="M32 22v12l8 5"/><path d="M26 10h12"/>`,
  talk: `<path d="M12 18h28a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H26l-8 7v-7h-6a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z"/><path d="M50 30h4a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-2v6l-7-6"/>`,
  together: `<circle cx="22" cy="24" r="6"/><circle cx="42" cy="24" r="6"/><path d="M10 48q0-12 12-12t12 12"/><path d="M30 48q0-12 12-12t12 12"/>`,
  teacher: `<rect x="10" y="14" width="44" height="26" rx="3"/><path d="M18 30l8-8 6 6 8-10"/><path d="M32 40v12"/><path d="M22 54h20"/>`,
  handshake: `<path d="M8 30l10-10 8 4 8-4 10 10"/><path d="M8 30l12 12 6-4 6 4 6-4 6 4 12-12"/><path d="M26 38l6 6"/><path d="M32 34l6 6"/>`,
  walk: `<circle cx="36" cy="12" r="5"/><path d="M30 24l8 2 4 10 8 4"/><path d="M30 24l-4 12 8 6-2 12"/><path d="M26 36l-8 8"/><path d="M40 36l2 18"/>`,
  draw: `<path d="M14 50l4-14 24-24a4 4 0 0 1 6 6L24 42z"/><path d="M38 16l6 6"/><path d="M14 50l10-4"/>`,
  quiet: `<path d="M44 14a18 18 0 1 0 8 26 14 14 0 0 1-8-26z"/><path d="M12 54h40" opacity=".4"/>`,
  breathe: `<path d="M12 36q10-10 20 0t20 0"/><path d="M12 46q10-10 20 0t20 0" opacity=".55"/><path d="M12 26q10-10 20 0t20 0" opacity=".3"/>`,
}

// ---------- domain icons (Home cards) ----------
const domains: Record<string, string> = {
  self: `<rect x="15" y="6" width="34" height="40" rx="17"/><path d="M28 46v12h8V46"/><path d="M22 21q10-12 20 0"/><circle cx="26" cy="26" r="1.5" fill="currentColor" stroke="none"/><circle cx="38" cy="26" r="1.5" fill="currentColor" stroke="none"/><path d="M27 33q5 5 10 0"/>`,
  social: `<circle cx="20" cy="22" r="9"/><circle cx="45" cy="26" r="8"/><path d="M6 51v-4q0-12 14-12t14 12v4M35 39q15-7 23 9v4"/><path d="M17 25q3 3 6 0M42 29q3 3 6 0"/>`,
  relation: `<path d="M5 30l12-13 10 4 8-4 12 5 12 12-12 15-7 3-20-10z"/><path d="M27 21l-8 9q3 6 8 2l6-4 14 13M24 37l12 12M30 33l13 13"/><path d="M5 30l9 9M47 22l12 12"/>`,
  mind: `<path d="M32 54q-20-12-20-26a10 10 0 0 1 20-4 10 10 0 0 1 20 4q0 14-20 26z"/><path d="M32 54q-2-14 10-24"/>`,
  reserved: `<path d="M32 10l6 14 15 2-11 10 3 15-13-7-13 7 3-15L11 26l15-2z"/>`,
}

let n = 0
const eDir = out('emotions')
for (const [id, body] of Object.entries(faces)) {
  writeFileSync(join(eDir, `${id}.svg`), wrap(body))
  n++
}
const oDir = out('outcome')
for (const [id, body] of Object.entries(outcomes)) {
  writeFileSync(join(oDir, `${id}.svg`), wrap(body))
  n++
}
const dDir = out('domain')
for (const [id, body] of Object.entries(domains)) {
  writeFileSync(join(dDir, `${id}.svg`), wrap(body))
  n++
}
console.log(`✔ ${n} icons written to public/icons`)
