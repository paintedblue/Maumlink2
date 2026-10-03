import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type U = {
  text: string
  lang: string
  rate: number
  onend?: () => void
  onerror?: () => void
  voice?: unknown
  volume: number
  pitch: number
}

function installSynth() {
  const spoken: U[] = []
  const synth = {
    speak: vi.fn((u: U) => spoken.push(u)),
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [
      { lang: 'en-US', name: 'Alex', localService: true },
      { lang: 'ko-KR', name: 'Yuna', localService: true },
      { lang: 'ko-KR', name: 'Google 한국의', localService: false },
    ]),
    addEventListener: vi.fn(),
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
  return { synth, spoken }
}

describe('speech service', () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => {
    // @ts-expect-error cleanup
    delete window.speechSynthesis
    // @ts-expect-error cleanup
    delete window.SpeechSynthesisUtterance
  })

  it('speaks Korean at rate 0.9 with a Korean voice and resolves on end (FR-AUD-01)', async () => {
    const { synth, spoken } = installSynth()
    const { speech } = await import('../../src/services/speech')
    const p = speech.speak({ text: '안녕', locale: 'ko' })
    expect(synth.speak).toHaveBeenCalledTimes(1)
    const u = spoken[0]!
    expect(u.lang).toBe('ko-KR')
    expect(u.rate).toBe(0.9)
    expect((u.voice as { lang: string }).lang).toBe('ko-KR')
    u.onend?.()
    await expect(p).resolves.toBeUndefined()
  })

  it('a new utterance cancels the previous one (single queue)', async () => {
    const { synth, spoken } = installSynth()
    const { speech } = await import('../../src/services/speech')
    const first = speech.speak({ text: '하나', locale: 'ko' })
    void speech.speak({ text: '둘', locale: 'ko' })
    expect(synth.cancel).toHaveBeenCalled()
    await expect(first).resolves.toBeUndefined()
    expect(spoken.map((u) => u.text)).toEqual(['하나', '둘'])
  })

  it('resolves immediately when TTS is unsupported (FR-AUD-03)', async () => {
    const { speech } = await import('../../src/services/speech')
    expect(speech.isSupported()).toBe(false)
    await expect(speech.speak({ text: 'x', locale: 'ko' })).resolves.toBeUndefined()
  })
})
