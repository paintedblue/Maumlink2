/** Derive installed-app icons from the same brand mark as the web app. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const mark = readFileSync(`${publicDir}favicon.svg`, 'utf8')
// Keep the mark inside the maskable icon's safe circle; use an opaque brand background.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 80 80"><rect width="80" height="80" fill="#123F3A"/><g transform="translate(8 8)">${mark.replace(/<svg[^>]*>|<\/svg>/g, '')}</g></svg>`
for (const [filename, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
] as const) {
  await sharp(Buffer.from(maskable)).resize(size, size).png().toFile(`${publicDir}${filename}`)
}
console.log('App icons generated from public/favicon.svg')
