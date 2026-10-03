import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getEmotion, nextScenarioInDomain } from '@/content/loader'
import type { Scenario } from '@/content/schema'
import { IconButton, PrimaryButton, SecondaryButton } from '@/design/Button'
import { Card } from '@/design/Card'
import { ArrowRightIcon, HelpIcon, HomeIcon, SettingsIcon, SpeakerIcon } from '@/design/icons'
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

/** S6 — link animation + chime, closing message, path recap, next/home (FR-S6-01/02). */
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
      <header className="wrapup-header flex justify-end gap-4">
        <IconButton label={t('nav.replay')} onClick={() => void speak(scenario.closing)}>
          <SpeakerIcon />
        </IconButton>
        <IconButton label={t('nav.settings')} onClick={() => setSettingsOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </header>
      <main className="mx-auto flex w-full max-w-[880px] flex-col items-center justify-center gap-6 bg-bg px-4 pb-safe pt-safe text-center md:px-8">
        <LinkAnimation />
        <h1 className="text-story font-bold text-ink">{t('wrapup.title')}</h1>
        <Card className="w-full" data-testid="closing-card" aria-live="polite">
          <p className="text-story font-bold text-ink">{closing}</p>
        </Card>

        <div
          className="flex flex-wrap items-center justify-center gap-3"
          aria-label={t('wrapup.path')}
        >
          <span className="text-caption font-bold text-ink-soft">{t('wrapup.path')}</span>
          {feelings.map((f) => (
            <span
              key={f.id}
              className="flex size-12 items-center justify-center rounded-full"
              style={{ backgroundColor: f.tint }}
              title={L(f.word)}
            >
              <img
                src={`/icons/emotions/${f.icon}`}
                alt={L(f.word)}
                width={36}
                height={36}
                className="size-9"
              />
            </span>
          ))}
          <ArrowRightIcon size={22} className="text-ink-soft" />
          <span
            className="flex size-12 items-center justify-center rounded-full bg-domain-reserved text-ink"
            aria-hidden="true"
          >
            <HelpIcon size={26} />
          </span>
          <ArrowRightIcon size={22} className="text-ink-soft" />
          {action && (
            <span className="flex size-12 items-center justify-center rounded-full bg-surface border-2 border-line text-btn font-bold text-ink">
              {action.id}
            </span>
          )}
        </div>

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

/** Two hearts, one line — the line draws itself over 1.2 s, then a soft sparkle (PRD §6.10). */
function LinkAnimation() {
  return (
    <svg
      viewBox="0 0 240 120"
      className="h-[90px] w-[180px] text-ink md:h-[120px] md:w-[240px]"
      aria-hidden="true"
    >
      <path
        d="M30 50c0-10 8-18 18-18 7 0 12 4 15 9 3-5 8-9 15-9 10 0 18 8 18 18 0 16-22 28-33 34-11-6-33-18-33-34z"
        fill="var(--color-link)"
      />
      <path
        d="M144 50c0-10 8-18 18-18 7 0 12 4 15 9 3-5 8-9 15-9 10 0 18 8 18 18 0 16-22 28-33 34-11-6-33-18-33-34z"
        fill="var(--color-go)"
      />
      <path
        d="M96 70 C 115 40, 125 40, 144 70"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
        className="motion-safe:animate-[drawLine_1200ms_ease-out_forwards] motion-reduce:[stroke-dashoffset:0]"
      />
      <g
        className="origin-center opacity-0 motion-safe:animate-[sparkle_600ms_ease-out_1300ms_forwards] motion-reduce:opacity-90"
        fill="var(--color-domain-self-edge)"
      >
        <circle cx="120" cy="30" r="4" />
        <circle cx="104" cy="22" r="2.5" />
        <circle cx="136" cy="22" r="2.5" />
      </g>
    </svg>
  )
}
