import { vi } from 'vitest'

type U = {
  text: string
  lang: string
  rate: number
  onstart?: () => void
  onend?: () => void
  onerror?: (event: { error: string }) => void
  voice?: unknown
  volume: number
  pitch: number
}

export function installSynth() {
  const spoken: U[] = []
  const events = new EventTarget()
  const synth = {
    speak: vi.fn((u: U) => spoken.push(u)),
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [
      { lang: 'en-US', name: 'Alex', localService: true },
      { lang: 'ko-KR', name: 'Yuna', localService: true },
      { lang: 'ko-KR', name: 'Google 한국의', localService: false },
    ]),
    addEventListener: vi.fn((type: string, listener: EventListener) =>
      events.addEventListener(type, listener),
    ),
    removeEventListener: vi.fn((type: string, listener: EventListener) =>
      events.removeEventListener(type, listener),
    ),
  }
  class Utterance {
    text: string
    lang = ''
    rate = 1
    pitch = 1
    volume = 1
    voice: unknown
    onend?: () => void
    onerror?: () => void
    constructor(text: string) {
      this.text = text
    }
  }
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: Utterance,
    configurable: true,
  })
  return { synth, spoken, voicesChanged: () => events.dispatchEvent(new Event('voiceschanged')) }
}
