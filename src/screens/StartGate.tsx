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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-bg px-6 pb-safe pt-safe text-center">
      <LinkMark size={160} className="text-ink motion-safe:animate-[fadeIn_600ms_ease-out]" />
      <div>
        <h1 className="text-[clamp(40px,6vw,56px)] font-bold leading-tight text-ink">
          {t('app.name')}
        </h1>
        <p className="mt-2 text-body text-ink-soft">{t('app.tagline')}</p>
      </div>
      <PrimaryButton
        className="h-20 min-w-[min(100%,320px)] px-12 text-[clamp(24px,3vw,30px)]"
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
