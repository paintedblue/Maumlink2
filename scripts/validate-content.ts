#!/usr/bin/env tsx
/** CLI: `pnpm validate` — exits non-zero on any content error (PRD §10). */
import { fileURLToPath, URL } from 'node:url'
import { formatReport, validateAll } from './validate-core'

const root = fileURLToPath(new URL('..', import.meta.url))
const report = validateAll(root)
console.log(formatReport(report))
process.exit(report.errors.length ? 1 : 0)
