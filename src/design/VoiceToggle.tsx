import { useSettings } from '@/services/settings'
import { useSyncExternalStore } from 'react'
import { speech } from '@/services/speech'
import { useT } from '@/i18n/useT'
import { IconButton } from './Button'
import { SpeakerIcon, SpeakerMutedIcon } from './icons'

/** One persistent narration switch shared by Home, lessons and completion. */
export function VoiceToggle({
  onEnable,
  supported = speech.isSupported(),
}: {
  onEnable: () => void
  supported?: boolean
}) {
  const { t } = useT()
  const enabled = useSettings((s) => s.voiceEnabled)
  const activationRequired = useSyncExternalStore(
    speech.onActivationChange,
    speech.getActivationRequired,
    () => false,
  )
  const active = enabled && !activationRequired
  return (
    <IconButton
      label={t('voice.label')}
      title={supported ? t(active ? 'voice.turnOff' : 'voice.turnOn') : t('tts.unavailable')}
      aria-pressed={active}
      data-testid="voice-toggle"
      data-voice={active ? 'on' : 'off'}
      badge={!supported ? <span className="block size-3 rounded-full bg-ink-soft" /> : undefined}
      onClick={() => {
        const next = speech.getActivationRequired() || !useSettings.getState().voiceEnabled
        useSettings.getState().setVoiceEnabled(next)
        if (next) {
          speech.unlock()
          onEnable()
        }
      }}
    >
      {active ? <SpeakerIcon /> : <SpeakerMutedIcon />}
    </IconButton>
  )
}
