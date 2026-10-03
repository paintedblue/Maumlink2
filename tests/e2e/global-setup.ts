import { execSync } from 'node:child_process'

/** Build once before the preview server starts, so e2e always tests the current source. */
export default function globalSetup() {
  execSync('pnpm build', { stdio: 'inherit' })
}
