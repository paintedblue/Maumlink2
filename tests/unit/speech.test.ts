import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type U = {
  text: string
  lang: string
  rate: number
  onend?: () => void
  onerror?: (event: { error: string }) => void
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
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'userActivation')
    // @ts-expect-error cleanup
    delete window.speechSynthesis
    // @ts-expect-error cleanup
    delete window.SpeechSynthesisUtterance
  })

  it('defers automatic narration until the first interaction on a fresh document', async () => {
    const { synth, spoken } = installSynth()
    const activation = { hasBeenActive: false }
    Object.defineProperty(navigator, 'userActivation', { configurable: true, value: activation })
    const { speech } = await import('../../src/services/speech')
    const pending = speech.speak({ text: '자동 읽기', locale: 'ko', automatic: true })
    expect(synth.speak).not.toHaveBeenCalled()
    expect(speech.getActivationRequired()).toBe(true)
    activation.hasBeenActive = true
    document.dispatchEvent(new MouseEvent('click'))
    expect(spoken.map((u) => u.text)).toEqual(['자동 읽기'])
    expect(speech.getActivationRequired()).toBe(false)
    spoken[0]!.onend?.()
    await expect(pending).resolves.toBeUndefined()
  })

  it('replaces deferred text on navigation and discards it when muted', async () => {
    const { synth, spoken } = installSynth()
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: { hasBeenActive: false },
    })
    const { speech } = await import('../../src/services/speech')
    const old = { text: '이전 화면', locale: 'ko' as const, automatic: true }
    void speech.speak(old)
    void speech.speak({ text: '현재 화면', locale: 'ko', automatic: true })
    speech.cancel(old)
    document.dispatchEvent(new MouseEvent('click'))
    expect(spoken.map((u) => u.text)).toEqual(['현재 화면'])
    speech.setEnabled(false)
    document.dispatchEvent(new MouseEvent('click'))
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(speech.getActivationRequired()).toBe(false)
  })

  it('cancels deferred narration without waiting for a click', async () => {
    const { synth } = installSynth()
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: { hasBeenActive: false },
    })
    const { speech } = await import('../../src/services/speech')
    const pending = speech.speak({ text: '자동 읽기', locale: 'ko', automatic: true })
    speech.setEnabled(false)
    await expect(pending).resolves.toBeUndefined()
    document.dispatchEvent(new MouseEvent('click'))
    expect(synth.speak).not.toHaveBeenCalled()
    expect(speech.getActivationRequired()).toBe(false)
  })

  it('retries a browser not-allowed error on interaction instead of silently dropping speech', async () => {
    const { spoken } = installSynth()
    const { speech } = await import('../../src/services/speech')
    void speech.speak({ text: '현재 문장', locale: 'ko', automatic: true })
    spoken[0]!.onerror?.({ error: 'not-allowed' })
    expect(speech.getActivationRequired()).toBe(true)
    document.dispatchEvent(new MouseEvent('click'))
    expect(spoken.map((u) => u.text)).toEqual(['현재 문장', '현재 문장'])
    speech.cancel()
  })

  it('muting stops active speech and blocks later requests until enabled', async () => {
    const { synth } = installSynth()
    const { speech } = await import('../../src/services/speech')
    const current = speech.speak({ text: '지금 읽어요', locale: 'ko' })
    speech.setEnabled(false)
    await expect(current).resolves.toBeUndefined()
    expect(synth.cancel).toHaveBeenCalledTimes(1)
    await speech.speak({ text: '다음 화면', locale: 'ko' })
    expect(synth.speak).toHaveBeenCalledTimes(1)
    speech.setEnabled(true)
    void speech.speak({ text: '다시 읽어요', locale: 'ko' })
    expect(synth.speak).toHaveBeenCalledTimes(2)
    speech.cancel()
  })

  it('muting also stops recorded narration and blocks new clips', async () => {
    const play = vi.fn().mockResolvedValue(undefined)
    const pause = vi.fn()
    vi.stubGlobal(
      'Audio',
      class {
        play = play
        pause = pause
      },
    )
    const { speech } = await import('../../src/services/speech')
    const current = speech.speak({ text: '녹음', locale: 'ko', audioUrl: '/voice.mp3' })
    speech.setEnabled(false)
    await expect(current).resolves.toBeUndefined()
    expect(pause).toHaveBeenCalledOnce()
    await speech.speak({ text: '녹음', locale: 'ko', audioUrl: '/voice.mp3' })
    expect(play).toHaveBeenCalledOnce()
  })

  it('an old screen cleanup cannot cancel a newer manual request', async () => {
    const { synth } = installSynth()
    const { speech } = await import('../../src/services/speech')
    const oldRequest = { text: '힌트', locale: 'ko' as const }
    void speech.speak(oldRequest)
    void speech.speak({ text: '속상해요', locale: 'ko' })
    const calls = synth.cancel.mock.calls.length
    speech.cancel(oldRequest)
    expect(synth.cancel).toHaveBeenCalledTimes(calls)
    speech.cancel()
    expect(synth.cancel).toHaveBeenCalledTimes(calls + 1)
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
