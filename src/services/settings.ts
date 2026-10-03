/**
 * Settings store — PRD §11.4. Persisted to localStorage; Korean-only shipped locale (D17):
 * `locale` is only ever changed by the dev `?lang=en` URL flag and is never persisted as 'en'.
 */
import { create } from 'zustand'
import { z } from 'zod'
import { persist } from 'zustand/middleware'
import { speech } from './speech'

export type TextSize = 'normal' | 'large'
export type Locale = 'ko' | 'en'

interface SettingsState {
  textSize: TextSize
  sound: boolean
  autoRead: boolean
  voiceEnabled: boolean
  started: boolean
  locale: Locale
  setTextSize: (v: TextSize) => void
  setSound: (v: boolean) => void
  setAutoRead: (v: boolean) => void
  setVoiceEnabled: (v: boolean) => void
  setStarted: () => void
  setLocale: (v: Locale) => void
}

function devLocaleFromUrl(): Locale {
  if (typeof window === 'undefined') return 'ko'
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ko'
}

export const StoredSettings = z
  .object({
    textSize: z.enum(['normal', 'large']).catch('normal'),
    sound: z.boolean().catch(true),
    autoRead: z.boolean().catch(true),
    voiceEnabled: z.boolean().catch(true),
    started: z.boolean().catch(false),
  })
  .catch({ textSize: 'normal', sound: true, autoRead: true, voiceEnabled: true, started: false })

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      textSize: 'normal',
      sound: true,
      autoRead: true,
      voiceEnabled: true,
      started: false,
      locale: devLocaleFromUrl(),
      setTextSize: (textSize) => set({ textSize }),
      setSound: (sound) => set({ sound }),
      setAutoRead: (autoRead) => set({ autoRead }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setStarted: () => set({ started: true }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'maumlink.settings.v1',
      partialize: (s) => ({
        textSize: s.textSize,
        sound: s.sound,
        autoRead: s.autoRead,
        voiceEnabled: s.voiceEnabled,
        started: s.started,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...StoredSettings.parse(persisted),
        locale: devLocaleFromUrl(),
      }),
    },
  ),
)

// Apply the restored preference before any screen can narrate; keep changes synchronous.
speech.setEnabled(useSettings.getState().voiceEnabled)
useSettings.subscribe((state, previous) => {
  if (state.voiceEnabled !== previous.voiceEnabled) speech.setEnabled(state.voiceEnabled)
})
