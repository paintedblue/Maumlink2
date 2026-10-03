/** Build app icons and portable PNG exports from the vector brand masters. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const exportDir = fileURLToPath(new URL('../docs/brand/', import.meta.url))
mkdirSync(exportDir, { recursive: true })
const reverse = readFileSync(`${publicDir}brand/symbol-reverse.svg`, 'utf8').replace(
  /<svg[^>]*>|<\/svg>|<title>.*?<\/title>/g,
  '',
)
const wrap = (size: number, content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">${content}</svg>`
const favicon = wrap(120, `<rect width="120" height="120" rx="28" fill="#FFF9F1"/>${reverse}`)
writeFileSync(`${publicDir}favicon.svg`, favicon)
// Opaque, full-bleed tile. The entire mark fits within the central 80% safe circle.
const appIcon = wrap(
  160,
  `<rect width="160" height="160" fill="#FFF9F1"/><g transform="translate(20 20)">${reverse}</g>`,
)
for (const [filename, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
] as const) {
  await sharp(Buffer.from(appIcon)).resize(size, size).png().toFile(`${publicDir}${filename}`)
}
for (const name of ['logo-ko', 'logo-en', 'logo-signature', 'symbol']) {
  await sharp(`${publicDir}brand/${name}.svg`)
    .resize({ width: name === 'symbol' ? 1024 : 2400 })
    .png()
    .toFile(`${exportDir}${name}.png`)
}
await sharp(`${exportDir}logo-presentation.svg`).png().toFile(`${exportDir}logo-presentation.png`)
console.log('Generated favicon, PWA icons, transparent logo PNGs and presentation sheet.')
