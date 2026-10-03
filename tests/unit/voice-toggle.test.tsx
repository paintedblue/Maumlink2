import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { VoiceToggle } from '@/design/VoiceToggle'
import { useSettings } from '@/services/settings'
import { speech } from '@/services/speech'
import { useAutoRead } from '@/services/useSpeak'

beforeEach(() => useSettings.setState({ voiceEnabled: true, autoRead: true, locale: 'ko' }))
afterEach(() => {
  speech.cancel()
  Reflect.deleteProperty(navigator, 'userActivation')
  vi.restoreAllMocks()
  useSettings.setState({ voiceEnabled: true })
})

it('a click on an activation-blocked icon starts voice rather than muting it', async () => {
  Object.defineProperty(navigator, 'userActivation', {
    configurable: true,
    value: { hasBeenActive: false },
  })
  void speech.speak({ text: '현재 화면', locale: 'ko', automatic: true })
  const read = vi.fn(() => void speech.speak({ text: '현재 화면', locale: 'ko' }))
  render(<VoiceToggle supported onEnable={read} />)
  const control = screen.getByRole('button', { name: '음성' })
  expect(control).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(control)
  expect(read).toHaveBeenCalledOnce()
  expect(useSettings.getState().voiceEnabled).toBe(true)
  expect(speech.getActivationRequired()).toBe(false)
  expect(control).toHaveAttribute('aria-pressed', 'true')
})

it('stops narration, updates the icon state, persists mute and reads once on enable', async () => {
  const speak = vi.spyOn(speech, 'speak').mockResolvedValue(undefined)
  const cancel = vi.spyOn(speech, 'cancel')
  vi.spyOn(speech, 'unlock').mockImplementation(() => {})
  function Screen() {
    useAutoRead('현재 화면', 'current')
    return (
      <VoiceToggle
        supported
        onEnable={() => void speech.speak({ text: '현재 화면', locale: 'ko' })}
      />
    )
  }
  render(<Screen />)
  const control = screen.getByRole('button', { name: '음성' })
  expect(control).toHaveAttribute('aria-pressed', 'true')
  expect(speak).toHaveBeenCalledTimes(1)
  await userEvent.click(control)
  expect(cancel).toHaveBeenCalled()
  expect(control).toHaveAttribute('data-voice', 'off')
  expect(control).toHaveAttribute('aria-pressed', 'false')
  expect(control).toHaveAttribute('title', '음성 켜기')
  expect(JSON.parse(localStorage.getItem('maumlink.settings.v1')!).state.voiceEnabled).toBe(false)
  await userEvent.click(control)
  expect(control).toHaveAttribute('data-voice', 'on')
  expect(control).toHaveAttribute('aria-pressed', 'true')
  expect(control).toHaveAttribute('title', '음성 끄기')
  expect(speak).toHaveBeenCalledTimes(2)
})

it('restores muted state from saved settings before the next narration', async () => {
  const enabled = vi.spyOn(speech, 'setEnabled')
  localStorage.setItem(
    'maumlink.settings.v1',
    JSON.stringify({ state: { voiceEnabled: false }, version: 0 }),
  )
  await act(() => useSettings.persist.rehydrate())
  expect(useSettings.getState().voiceEnabled).toBe(false)
  expect(enabled).toHaveBeenCalledWith(false)
  render(<VoiceToggle supported onEnable={() => {}} />)
  expect(screen.getByRole('button', { name: '음성' })).toHaveAttribute('data-voice', 'off')
})
