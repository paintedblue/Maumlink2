/**
 * i18n — PRD §11.3. `t(key, params)` resolves ui.json; `L(lstring)` resolves content.
 * Korean is the shipped locale; English falls back to Korean when missing (D17).
 */
import { useCallback } from 'react'
import { ui } from '@/content/loader'
import type { LString } from '@/content/schema'
import { useSettings, type Locale } from '@/services/settings'

export function resolveL(ls: LString | { ko: string; en?: string }, locale: Locale): string {
  return locale === 'en' && ls.en ? ls.en : ls.ko
}

export function resolveT(
  key: string,
  locale: Locale,
  params?: Record<string, string | number>,
): string {
  const entry = ui[key]
  if (!entry) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing ui key "${key}"`)
    return key
  }
  let s = resolveL(entry, locale)
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

export function useT() {
  const locale = useSettings((s) => s.locale)
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => resolveT(key, locale, params),
    [locale],
  )
  const L = useCallback((ls: LString) => resolveL(ls, locale), [locale])
  return { t, L, locale }
}
