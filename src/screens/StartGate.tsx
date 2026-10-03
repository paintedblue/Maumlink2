import { PrimaryButton } from '@/design/Button'
import { ArrowRightIcon, LinkMark } from '@/design/icons'
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
      <div className="start-art" aria-hidden="true">
        <svg className="start-thread" viewBox="0 0 560 360" fill="none">
          <path
            d="M-30 250C140 380 90 90 250 120S375 360 590 90"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="120" cy="82" r="8" fill="currentColor" />
          <circle cx="470" cy="270" r="5" fill="currentColor" />
        </svg>
        <div className="start-emblem" aria-hidden="true">
          <LinkMark size={160} className="text-ink" />
        </div>
      </div>
      <div className="start-copy">
        <h1 className="start-title">{t('app.name')}</h1>
        <p className="start-description">{t('app.tagline')}</p>
      </div>
      <PrimaryButton
        className="start-action"
        iconRight={<ArrowRightIcon />}
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
