import { useSyncExternalStore } from 'react'
import { speech, type SpeechStatus } from './speech'

export function useSpeechStatus() {
  return useSyncExternalStore(speech.onStatusChange, speech.getStatus, speech.getStatus)
}

export function speechStatusKey(status: SpeechStatus): string {
  if (status.phase !== 'error') return `voice.status.${status.phase}`
  if (status.error === 'language-unavailable' || status.error === 'voice-unavailable')
    return 'voice.status.noVoice'
  if (status.error === 'audio-hardware' || status.error === 'audio-busy')
    return 'voice.status.output'
  return 'voice.status.error'
}
