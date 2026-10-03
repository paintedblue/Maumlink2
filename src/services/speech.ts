/**
 * Read-aloud service — PRD FR-AUD-01/02/03. One queue; a new utterance cancels the
 * previous one; navigation cancels everything. Plays a recorded clip when `audioUrl`
 * is given, otherwise browser TTS. Never throws: if nothing can speak, it resolves.
 */
import type { Locale } from './settings'

export interface SpeakRequest {
  text: string
  locale: Locale
  audioUrl?: string
  automatic?: boolean
}

type Listener = (speaking: boolean) => void

const LANG: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US' }
const RATE = 0.9

class SpeechService {
  private enabled = true
  private activationRequired = false
  private activationListeners = new Set<() => void>()
  private request?: SpeakRequest
  private textListeners = new Set<(text: string) => void>()
  private current?: { cancel: () => void }
  private listeners = new Set<Listener>()
  private voices: SpeechSynthesisVoice[] = []
  private audio?: HTMLAudioElement
  /** Set true after the first user gesture (StartGate) so autoplay policies are satisfied. */
  unlocked = false

  constructor() {
    if (this.isSupported()) {
      const load = () => {
        this.voices = window.speechSynthesis.getVoices()
      }
      load()
      window.speechSynthesis.addEventListener?.('voiceschanged', load)
    }
  }

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    )
  }

  /** Mute both browser speech and recorded narration, including the active request. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) this.cancel()
  }

  getActivationRequired = (): boolean => this.activationRequired

  onActivationChange = (listener: () => void): (() => void) => {
    this.activationListeners.add(listener)
    return () => this.activationListeners.delete(listener)
  }

  private setActivationRequired(required: boolean): void {
    if (this.activationRequired === required) return
    this.activationRequired = required
    for (const listener of this.activationListeners) listener()
  }

  /** Chrome may reject automatic speech until this document has a user gesture.
   * Keep only the current request; navigation, mute and auto-read cleanup can cancel it. */
  private waitForActivation(req: SpeakRequest): Promise<void> {
    return new Promise((resolve) => {
      const cleanup = () => {
        document.removeEventListener('click', retry)
        document.removeEventListener('keydown', retry)
        if (this.current?.cancel === cancel) this.current = undefined
        this.setActivationRequired(false)
      }
      const cancel = () => {
        cleanup()
        resolve()
      }
      const retry = (event: Event) => {
        if (
          event instanceof KeyboardEvent &&
          ['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)
        )
          return
        if (this.request !== req || !this.enabled) return cancel()
        cleanup()
        this.unlocked = true
        void this.speak(req).then(resolve)
      }
      this.current = { cancel }
      document.addEventListener('click', retry)
      document.addEventListener('keydown', retry)
      this.setActivationRequired(true)
    })
  }

  onChange(l: Listener): () => void {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  onText(listener: (text: string) => void): () => void {
    this.textListeners.add(listener)
    return () => {
      this.textListeners.delete(listener)
    }
  }

  private emit(speaking: boolean) {
    for (const l of this.listeners) l(speaking)
  }

  /** Prefer a natural local voice for the locale; fall back to any voice with the language. */
  private pickVoice(locale: Locale): SpeechSynthesisVoice | undefined {
    const prefix = locale
    const candidates = this.voices.filter((v) => v.lang.toLowerCase().startsWith(prefix))
    if (candidates.length === 0) return undefined
    const score = (v: SpeechSynthesisVoice) =>
      (/google|yuna|siri|natural|premium|enhanced/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0)
    return [...candidates].sort((a, b) => score(b) - score(a))[0]
  }

  /** Unlock audio output on a user gesture (needed on iOS/Safari and Chrome autoplay policy). */
  unlock(): void {
    if (this.unlocked) return
    this.unlocked = true
    if (this.isSupported()) {
      try {
        const u = new SpeechSynthesisUtterance(' ')
        u.volume = 0
        window.speechSynthesis.speak(u)
        window.speechSynthesis.cancel()
      } catch {
        /* ignore */
      }
    }
  }

  cancel(request?: SpeakRequest): void {
    if (request && request !== this.request) return
    this.current?.cancel()
    this.current = undefined
    this.request = undefined
  }

  speak(req: SpeakRequest): Promise<void> {
    this.cancel()
    this.request = req
    for (const listener of this.textListeners) listener(req.text)
    // Preserve screen-reader announcements while suppressing the app's own voice.
    if (!this.enabled) return Promise.resolve()
    if (!req.text.trim() && !req.audioUrl) return Promise.resolve()

    if (req.automatic && !this.unlocked && navigator.userActivation?.hasBeenActive === false) {
      return this.waitForActivation(req)
    }

    if (req.audioUrl) return this.playAudio(req.audioUrl)
    if (!this.isSupported()) return Promise.resolve()

    return new Promise<void>((resolve) => {
      const synth = window.speechSynthesis
      const u = new SpeechSynthesisUtterance(req.text)
      u.lang = LANG[req.locale]
      u.rate = RATE
      u.pitch = 1
      const voice = this.pickVoice(req.locale)
      if (voice) u.voice = voice
      let done = false
      const finish = () => {
        if (done) return
        done = true
        if (this.current?.cancel === cancel) this.current = undefined
        this.emit(false)
        resolve()
      }
      const cancel = () => {
        try {
          synth.cancel()
        } catch {
          /* ignore */
        }
        finish()
      }
      u.onend = finish
      u.onerror = (event) => {
        if (done) return
        finish()
        if (event.error === 'not-allowed' && this.request === req && this.enabled) {
          void this.waitForActivation(req)
        }
      }
      this.current = { cancel }
      this.emit(true)
      try {
        // Safari sometimes stays "paused" after a cancel; resume defensively.
        synth.resume()
        synth.speak(u)
      } catch {
        finish()
      }
    })
  }

  private playAudio(url: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const el = this.audio ?? (this.audio = new Audio())
      let done = false
      const finish = () => {
        if (done) return
        done = true
        el.onended = null
        el.onerror = null
        if (this.current?.cancel === cancel) this.current = undefined
        this.emit(false)
        resolve()
      }
      const cancel = () => {
        el.pause()
        finish()
      }
      el.onended = finish
      el.onerror = finish
      el.src = url
      this.current = { cancel }
      this.emit(true)
      el.play().catch(finish)
    })
  }
}

export const speech = new SpeechService()
