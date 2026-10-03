import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, type Plugin } from 'vite'
import { formatReport, validateAll } from './scripts/validate-core'

const root = fileURLToPath(new URL('.', import.meta.url))

/** FR-ENG-02: invalid content fails the build with a plain-language message. */
function contentValidation(): Plugin {
  return {
    name: 'maumlink:validate-content',
    buildStart() {
      const report = validateAll(root)
      if (report.errors.length > 0) {
        throw new Error(`\n${formatReport(report)}`)
      }
      if (report.warnings.length > 0) {
        this.warn(formatReport(report))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    contentValidation(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '마음잇다',
        short_name: '마음잇다',
        description: '느린학습자를 위한 사회정서교육 앱',
        lang: 'ko',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        background_color: '#FBF8F3',
        theme_color: '#FBF8F3',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // FR-PWA-02: everything the app needs offline is precached.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,mp3,json,webmanifest}'],
        // fontsource emits .woff twins of every .woff2 subset; every supported browser (§9) uses woff2.
        globIgnores: ['**/*.woff'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
  },
})
