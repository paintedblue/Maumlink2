import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { installSynth } from '../fixtures/speech'

describe('speech service', () => {
  beforeEach(() => vi.resetModules())
  afterEach(async () => {
    const { speech } = await import('../../src/services/speech')
    speech.cancel()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'userActivation')
    // @ts-expect-error cleanup
    delete window.speechSynthesis
    // @ts-expect-error cleanup
    delete window.SpeechSynthesisUtterance
  })

  it('waits for late Korean voices and selects a local voice ahead of a remote one', async () => {
    vi.useFakeTimers()
    const { synth, spoken, voicesChanged } = installSynth()
    synth.getVoices.mockReturnValue([])
    const { speech } = await import('../../src/services/speech')
    void speech.speak({ text: '안녕하세요', locale: 'ko' })
    expect(synth.speak).not.toHaveBeenCalled()
    expect(speech.getStatus().phase).toBe('loading')
    synth.getVoices.mockReturnValue([
      { lang: 'ko-KR', name: 'Google 한국어', localService: false },
      { lang: 'ko_KR', name: 'Korean system', localService: true },
    ])
    voicesChanged()
    expect(spoken).toHaveLength(1)
    expect(spoken[0]!.voice).toMatchObject({ name: 'Korean system' })
    expect(spoken[0]!.volume).toBe(1)
    expect(speech.getStatus().phase).toBe('loading')
    spoken[0]!.onstart?.()
    expect(speech.getStatus().phase).toBe('speaking')
  })

  it('does not call the enabled voice playing before the browser start event', async () => {
    const { spoken } = installSynth()
    const { speech } = await import('../../src/services/speech')
    const playing = vi.fn()
    speech.onChange(playing)
    void speech.speak({ text: '읽어줘요', locale: 'ko' })
    expect(playing).not.toHaveBeenCalledWith(true)
    spoken[0]!.onstart?.()
    expect(playing).toHaveBeenLastCalledWith(true)
    spoken[0]!.onend?.()
    expect(playing).toHaveBeenLastCalledWith(false)
  })

  it('retries a failed voice without losing the Korean language or text', async () => {
    vi.useFakeTimers()
    const { spoken } = installSynth()
    const { speech } = await import('../../src/services/speech')
    void speech.speak({ text: '다시 읽어요', locale: 'ko' })
    const lateError = spoken[0]!.onerror!
    lateError({ error: 'voice-unavailable' })
    await vi.advanceTimersByTimeAsync(0)
    expect(spoken).toHaveLength(2)
    expect(spoken[1]).toMatchObject({ lang: 'ko-KR', text: '다시 읽어요' })
    expect(spoken[1]!.voice).toMatchObject({ name: 'Google 한국의' })
    spoken[1]!.onstart?.()
    lateError({ error: 'voice-unavailable' })
    expect(speech.getStatus().phase).toBe('speaking')
    expect(spoken).toHaveLength(2)
  })

  it('reports a stalled engine after bounded retries instead of staying in playing state', async () => {
    vi.useFakeTimers()
    const { spoken } = installSynth()
    const { speech } = await import('../../src/services/speech')
    const pending = speech.speak({ text: '읽어줘요', locale: 'ko' })
    await vi.runAllTimersAsync()
    await pending
    expect(spoken).toHaveLength(3)
    expect(speech.getStatus()).toMatchObject({ phase: 'error', error: 'start-timeout' })
  })

  it('cancels voice discovery and never starts late speech after navigating away', async () => {
    vi.useFakeTimers()
    const { synth, voicesChanged } = installSynth()
    synth.getVoices.mockReturnValue([])
    const { speech } = await import('../../src/services/speech')
    const request = { text: '이전 화면', locale: 'ko' as const }
    const pending = speech.speak(request)
    speech.cancel(request)
    voicesChanged()
    await vi.runAllTimersAsync()
    await pending
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('tries the Korean default when enumeration stays empty and reports language errors', async () => {
    vi.useFakeTimers()
    const { synth, spoken } = installSynth()
    synth.getVoices.mockReturnValue([{ lang: 'en-US', name: 'Alex', localService: true }])
    const { speech } = await import('../../src/services/speech')
    const pending = speech.speak({ text: '한국어', locale: 'ko' })
    await vi.advanceTimersByTimeAsync(1500)
    expect(spoken[0]).toMatchObject({ lang: 'ko-KR' })
    expect(spoken[0]!.voice).toBeUndefined()
    spoken[0]!.onerror?.({ error: 'language-unavailable' })
    await pending
    expect(speech.getStatus()).toMatchObject({ phase: 'error', error: 'language-unavailable' })
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
