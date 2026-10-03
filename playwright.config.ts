import { defineConfig, devices } from '@playwright/test'

/**
 * E2E runs against the production build (`vite preview`) so the service worker
 * and precache behave as they will for children in classrooms.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    locale: 'ko-KR',
    // Animations are visual polish only; disable them so layout assertions are deterministic.
    reducedMotion: 'reduce',
  },
  globalSetup: './tests/e2e/global-setup.ts',
  webServer: {
    // A single process (no shell chain) so Playwright can always kill it; never reuse a
    // stray server — that silently tests a stale build.
    command: 'node node_modules/vite/bin/vite.js preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
