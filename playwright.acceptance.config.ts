import { defineConfig } from '@playwright/test'
import base from './playwright.config'

/** Run every functional/layout/a11y assertion and capture new visuals for human review.
 * This does not approve or overwrite the older visual-regression baselines.
 */
export default defineConfig({
  ...base,
  metadata: { captureReviewScreenshots: true },
})
