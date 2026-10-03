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
}

type Listener = (speaking: boolean) => void

const LANG: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US' }
const RATE = 0.9

class SpeechService {
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

  onChange(l: Listener): () => void {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
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

  cancel(): void {
    this.current?.cancel()
    this.current = undefined
  }

  speak(req: SpeakRequest): Promise<void> {
    this.cancel()
    if (!req.text.trim() && !req.audioUrl) return Promise.resolve()

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
      u.onerror = finish
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
