/**
 * Settings store — PRD §11.4. Persisted to localStorage; Korean-only shipped locale (D17):
 * `locale` is only ever changed by the dev `?lang=en` URL flag and is never persisted as 'en'.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TextSize = 'normal' | 'large'
export type Locale = 'ko' | 'en'

interface SettingsState {
  textSize: TextSize
  sound: boolean
  autoRead: boolean
  started: boolean
  locale: Locale
  setTextSize: (v: TextSize) => void
  setSound: (v: boolean) => void
  setAutoRead: (v: boolean) => void
  setStarted: () => void
  setLocale: (v: Locale) => void
}

function devLocaleFromUrl(): Locale {
  if (typeof window === 'undefined') return 'ko'
  return new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ko'
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      textSize: 'normal',
      sound: true,
      autoRead: true,
      started: false,
      locale: devLocaleFromUrl(),
      setTextSize: (textSize) => set({ textSize }),
      setSound: (sound) => set({ sound }),
      setAutoRead: (autoRead) => set({ autoRead }),
      setStarted: () => set({ started: true }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'maumlink.settings.v1',
      partialize: (s) => ({
        textSize: s.textSize,
        sound: s.sound,
        autoRead: s.autoRead,
        started: s.started,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsState>),
        locale: devLocaleFromUrl(),
      }),
    },
  ),
)
