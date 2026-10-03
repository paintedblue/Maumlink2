import { PrimaryButton } from '@/design/Button'
import { LinkMark } from '@/design/icons'
import { useT } from '@/i18n/useT'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'

/** First-visit full-screen Start (FR-HOME-01): the one tap that unlocks audio everywhere. */
export function StartGate() {
  const { t } = useT()
  const setStarted = useSettings((s) => s.setStarted)
  return (
    <main className="start-screen">
      <div className="start-emblem" aria-hidden="true">
        <LinkMark size={160} className="text-ink" />
      </div>
      <div>
        <h1 className="text-story font-bold leading-tight text-ink">{t('app.name')}</h1>
        <p className="mt-2 text-body text-ink-soft">{t('app.tagline')}</p>
      </div>
      <PrimaryButton
        className="min-w-[min(100%,320px)] px-8"
        onClick={() => {
          speech.unlock()
          sound.unlock()
          setStarted()
        }}
      >
        {t('home.start')}
      </PrimaryButton>
    </main>
  )
}
