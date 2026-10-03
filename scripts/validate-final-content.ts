import { fileURLToPath } from 'node:url'
import { formatReport, validateAll } from './validate-core'
import { validatePdfContent } from './validate-pdf-content'

const root = fileURLToPath(new URL('..', import.meta.url))
const report = validateAll(root)
console.log(formatReport(report))
const sourceErrors = validatePdfContent(root, report.scenarios)
for (const error of sourceErrors) console.error(error)
const drafts = Object.values(report.drafts).reduce((sum, paths) => sum + paths.length, 0)
if (report.errors.length || sourceErrors.length || drafts) {
  console.error(
    `Final-content check failed: ${report.errors.length + sourceErrors.length} errors, ${drafts} draft entries.`,
  )
  process.exitCode = 1
} else {
  console.log(
    'Final-content check passed: Korean copy matches all four PDF transcriptions; no content errors or draft entries. Source omissions remain documented.',
  )
}
