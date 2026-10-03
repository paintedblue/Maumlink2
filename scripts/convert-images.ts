#!/usr/bin/env tsx
/**
 * `pnpm images` — converts client illustrations in content-source/images into
 * responsive web assets under public/img (PRD §6.2.1 / FR-RES-06 / §9 budgets):
 *   <name>-800.webp, <name>-1600.webp (never upscaled) and <name>.png fallback.
 */
import { mkdirSync, readdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const srcDir = join(root, 'content-source', 'images')
const outDir = join(root, 'public', 'img')
mkdirSync(outDir, { recursive: true })

const WIDTHS = [800, 1600] as const

for (const file of readdirSync(srcDir)) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue
  const name = basename(file, extname(file))
  const input = sharp(join(srcDir, file))
  const meta = await input.metadata()
  const w = meta.width ?? 0
  for (const width of WIDTHS) {
    await input
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(outDir, `${name}-${width}.webp`))
  }
  await input
    .clone()
    .resize({ width: 1600, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(outDir, `${name}.png`))
  console.log(`✔ ${file} (${w}px) → ${name}-800.webp, ${name}-1600.webp, ${name}.png`)
}
