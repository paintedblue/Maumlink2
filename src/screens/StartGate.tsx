import { BrandLogo } from '@/design/BrandLogo'
import { HeartFriends } from '@/design/HeartFriends'
import { PrimaryButton } from '@/design/Button'
import { ArrowRightIcon } from '@/design/icons'
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
        <HeartFriends />
      </div>
      <div className="start-copy">
        <h1 className="start-title">
          <BrandLogo className="start-wordmark" />
        </h1>
        <p className="start-description">{t('home.greeting')}</p>
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
