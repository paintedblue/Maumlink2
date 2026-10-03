/** React bindings for the speech service: auto-read on screen entry + manual speak. */
import { useCallback, useEffect, useState } from 'react'
import type { LString } from '@/content/schema'
import { resolveL } from '@/i18n/useT'
import { useSettings } from './settings'
import { speech } from './speech'

export function useSpeak() {
  const locale = useSettings((s) => s.locale)
  const speakL = useCallback(
    (ls: LString | string) => {
      const text = typeof ls === 'string' ? ls : resolveL(ls, locale)
      const audioUrl = typeof ls === 'string' ? undefined : ls.audio?.[locale]
      return speech.speak({ text, locale, audioUrl })
    },
    [locale],
  )
  return { speak: speakL, cancel: () => speech.cancel(), supported: speech.isSupported() }
}

/**
 * Speaks `text` once when the component mounts (or when `key` changes) if the
 * auto-read setting is on. Cancels on unmount so navigation never overlaps voices.
 */
export function useAutoRead(text: string | undefined, key: string, audioUrl?: string): void {
  const autoRead = useSettings((s) => s.autoRead)
  const locale = useSettings((s) => s.locale)
  useEffect(() => {
    if (!autoRead || !text) return
    const request = { text, locale, audioUrl }
    void speech.speak(request)
    return () => speech.cancel(request)
  }, [autoRead, text, key, locale, audioUrl])
}

export function useSpeaking(): boolean {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => speech.onChange(setSpeaking), [])
  return speaking
}
