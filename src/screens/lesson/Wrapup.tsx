import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getEmotion, nextScenarioInDomain } from '@/content/loader'
import type { Scenario } from '@/content/schema'
import { IconButton, PrimaryButton, SecondaryButton } from '@/design/Button'
import { VoiceToggle } from '@/design/VoiceToggle'
import { HeartFriends } from '@/design/HeartFriends'
import { Card } from '@/design/Card'
import { ArrowRightIcon, HomeIcon, LinkMark, SettingsIcon } from '@/design/icons'
import { chosenAction, type LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useLesson } from '@/engine/store'
import { SettingsSheet } from '../SettingsSheet'
import { sound } from '@/services/sound'
import { useAutoRead, useSpeak } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  onExit: () => void
}

/** S6 — linked-heart greeting, closing message, concrete choice recap, next/home. */
export function Wrapup({ scenario, state, onExit }: Props) {
  const { t, L, locale } = useT()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { speak } = useSpeak()
  const reset = useLesson((l) => l.reset)
  const closing = L(scenario.closing)
  useAutoRead(closing, `closing-${scenario.id}`, scenario.closing.audio?.[locale])

  useEffect(() => {
    sound.play('chime')
  }, [scenario.id])

  const action = chosenAction(state, scenario)
  const next = nextScenarioInDomain(scenario)
  const feelings = state.feelingIds.map(getEmotion)

  return (
    <div className="wrapup-screen">
      <header className="wrapup-header">
        <div className="brand-lockup">
          <LinkMark size={44} />
          <span className="brand-name">{t('app.name')}</span>
        </div>
        <div className="utility-controls">
          <VoiceToggle
            onEnable={() =>
              void speak(
                [
                  closing,
                  t('wrapup.path'),
                  ...feelings.map((f) => L(f.word)),
                  action ? `${t('feedback.myChoice')}. ${L(action.text)}` : '',
                ]
                  .filter(Boolean)
                  .join(' '),
              )
            }
          />
          <IconButton label={t('nav.settings')} onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </div>
      </header>
      <main className="wrapup-main">
        <HeartFriends className="wrapup-friends" />
        <h1 className="text-story font-bold text-ink">{t('wrapup.title')}</h1>
        <Card className="w-full" data-testid="closing-card" aria-live="polite">
          <p className="text-story font-bold text-ink">{closing}</p>
        </Card>

        <section className="journey-recap" aria-label={t('wrapup.path')}>
          <h2 className="text-caption font-bold text-ink-soft">{t('wrapup.path')}</h2>
          <div className="journey-feelings">
            {feelings.map((f) => (
              <span key={f.id} className="journey-feeling">
                <img src={`/icons/emotions/${f.icon}`} alt="" width={48} height={48} />
                <span>{L(f.word)}</span>
              </span>
            ))}
          </div>
          {action && (
            <div className="journey-action">
              <span className="text-caption font-bold text-ink-soft">{t('feedback.myChoice')}</span>
              <p className="text-body font-bold">{L(action.text)}</p>
            </div>
          )}
        </section>

        <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
          <SecondaryButton
            icon={<HomeIcon size={26} />}
            onClick={onExit}
            data-testid="wrapup-home"
            full
            className="md:w-auto"
          >
            {t('nav.home')}
          </SecondaryButton>
          <PrimaryButton
            data-testid="wrapup-next"
            iconRight={<ArrowRightIcon size={26} />}
            full
            className="md:w-auto"
            onClick={() => {
              if (next) {
                reset()
                navigate(`/lesson/${next.id}`)
              } else onExit()
            }}
          >
            {t('nav.practiceAnother')}
          </PrimaryButton>
        </div>
      </main>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
