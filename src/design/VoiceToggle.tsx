import { useSettings } from '@/services/settings'
import { speechStatusKey, useSpeechStatus } from '@/services/useSpeechStatus'
import { speech } from '@/services/speech'
import { useT } from '@/i18n/useT'
import { IconButton } from './Button'
import { SpeakerIcon, SpeakerMutedIcon, SpeakerReadyIcon } from './icons'

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
  const status = useSpeechStatus()
  const needsRetry = status.phase === 'blocked' || status.phase === 'error'
  const active = enabled && !needsRetry
  return (
    <div className="voice-control">
      <IconButton
        label={t('voice.label')}
        title={supported ? t(active ? 'voice.turnOff' : 'voice.turnOn') : t('tts.unavailable')}
        aria-pressed={active}
        data-testid="voice-toggle"
        data-voice={active ? 'on' : 'off'}
        data-playback={status.phase}
        badge={!supported ? <span className="block size-3 rounded-full bg-ink-soft" /> : undefined}
        onClick={() => {
          const next = needsRetry || !useSettings.getState().voiceEnabled
          useSettings.getState().setVoiceEnabled(next)
          if (next) {
            speech.unlock()
            onEnable()
          }
        }}
      >
        {!active ? (
          <SpeakerMutedIcon />
        ) : status.phase === 'speaking' ? (
          <SpeakerIcon />
        ) : (
          <SpeakerReadyIcon />
        )}
      </IconButton>
      {enabled && needsRetry && (
        <span className="voice-notice" role="status">
          {t(speechStatusKey(status))}
        </span>
      )}
    </div>
  )
}
