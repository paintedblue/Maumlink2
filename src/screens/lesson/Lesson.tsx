import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { getEmotion, getScenario } from '@/content/loader'
import { PrimaryButton, SecondaryButton } from '@/design/Button'
import { Sheet } from '@/design/Sheet'
import { HelpIcon, ReplayIcon } from '@/design/icons'
import { canProceed, canTryAnother, progressIndex, type LessonEvent } from '@/engine/lessonMachine'
import { useLesson } from '@/engine/store'
import { useT } from '@/i18n/useT'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { speech } from '@/services/speech'
import { useSpeak } from '@/services/useSpeak'
import { SettingsSheet } from '../SettingsSheet'
import { Action } from './Action'
import { Feedback } from './Feedback'
import { Feeling } from './Feeling'
import { LessonShell, type BottomBar } from './LessonShell'
import { Situation } from './Situation'
import { Step3 } from './Step3'
import { Wrapup } from './Wrapup'

/** Lesson orchestrator — binds the engine store to the six screens and the shell (FR-ENG-03). */
export function Lesson() {
  const { scenarioId = '' } = useParams()
  const scenario = getScenario(scenarioId)
  const navigate = useNavigate()
  const { t, L } = useT()
  const { speak, supported } = useSpeak()
  const started = useSettings((s) => s.started)
  const soundOn = useSettings((s) => s.sound)
  const { state, start, dispatch, end } = useLesson()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmHome, setConfirmHome] = useState(false)
  const [wiggle, setWiggle] = useState(0)
  const [replayText, setReplayText] = useState('')

  useEffect(() => sound.setEnabled(soundOn), [soundOn])

  useEffect(() => {
    if (scenario) start(scenario)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario?.id])

  // Cancel speech whenever the screen changes so voices never overlap (FR-AUD-01).
  const step = state?.step
  useEffect(() => {
    speech.cancel()
  }, [step])

  // One-shot announcements from the reducer (pickFirst / notSureTwice).
  const announce = state?.announce
  useEffect(() => {
    if (!announce) return
    if (announce.kind === 'pickFirst') {
      void speak(t('feeling.pickFirst'))
      setWiggle((w) => w + 1)
    } else {
      void speak(t('feeling.notSureTwice', { emotion: L(getEmotion(announce.emotionId).word) }))
    }
    dispatch({ type: 'CLEAR_ANNOUNCE' })
  }, [announce, dispatch, speak, t, L])

  const exit = useCallback(() => {
    speech.cancel()
    end()
    navigate('/', { replace: true })
  }, [end, navigate])

  if (!scenario) return <Navigate to="/" replace />
  if (!started) return <Navigate to="/" replace />
  if (!state || state.scenarioId !== scenario.id) return null

  const d = (e: LessonEvent) => dispatch(e)

  if (state.step === 'wrapup') return <Wrapup scenario={scenario} state={state} onExit={exit} />

  // Build what the shell needs for this step.
  let bottom: BottomBar
  let body: React.ReactNode
  const backTo = (label = t('nav.back')) => ({ label, onClick: () => d({ type: 'BACK' }) })

  switch (state.step) {
    case 'situation':
      body = (
        <Situation
          scenario={scenario}
          state={state}
          onAdvance={() => {
            sound.play('turn')
            d({ type: 'NEXT' })
          }}
        />
      )
      bottom = {
        back: { label: t('nav.back'), onClick: () => setConfirmHome(true) },
        primary: {
          label: t('nav.next'),
          onClick: () => {
            sound.play('turn')
            d({ type: 'NEXT' })
          },
        },
      }
      break
    case 'feeling':
      body = <Feeling scenario={scenario} state={state} dispatch={d} wiggle={wiggle} />
      bottom = {
        back: backTo(),
        primary: {
          label: t('nav.next'),
          onClick: () => d({ type: 'NEXT' }),
          softDisabled: !canProceed(state, scenario),
        },
        extra: (
          <SecondaryButton
            icon={<HelpIcon size={26} />}
            onClick={() => d({ type: 'OPEN_HINT' })}
            data-testid="nav-help"
          >
            {t('nav.help')}
          </SecondaryButton>
        ),
      }
      break
    case 'step3':
      body = <Step3 scenario={scenario} state={state} dispatch={d} wiggle={wiggle} />
      bottom = {
        back: backTo(),
        primary: {
          label: t('nav.gotIt'),
          onClick: () => d({ type: 'GOT_IT' }),
          softDisabled: !canProceed(state, scenario),
        },
        extra: !state.moreShown ? (
          <SecondaryButton onClick={() => d({ type: 'TELL_MORE' })} data-testid="nav-more">
            {t('nav.tellMore')}
          </SecondaryButton>
        ) : undefined,
      }
      break
    case 'action':
      body = <Action scenario={scenario} state={state} dispatch={d} wiggle={wiggle} />
      bottom = {
        back: backTo(),
        primary: {
          label: t('nav.chooseThis'),
          onClick: () => d({ type: 'CHOOSE' }),
          softDisabled: !canProceed(state, scenario),
        },
      }
      break
    case 'feedback':
      body = <Feedback scenario={scenario} state={state} />
      bottom = {
        back: backTo(),
        primary: { label: t('nav.continue'), onClick: () => d({ type: 'CONTINUE' }) },
        extra: canTryAnother(state, scenario) ? (
          <SecondaryButton
            icon={<ReplayIcon size={24} />}
            onClick={() => d({ type: 'TRY_ANOTHER' })}
            data-testid="nav-try-another"
          >
            {t('nav.tryAnother')}
          </SecondaryButton>
        ) : undefined,
      }
      break
  }

  // Replay reads the most relevant text for the current screen.
  const replay = () => {
    const text = currentText()
    setReplayText(text)
    void speak(text)
  }
  function currentText(): string {
    switch (state!.step) {
      case 'situation': {
        const i = state!.sentenceIndex
        const s = scenario!.situation
        return i >= s.story.length ? L(s.keySentence) : L(s.story[i]!)
      }
      case 'feeling':
        return L(scenario!.feeling.question)
      case 'step3': {
        const f = state!.feelingIds[0]
        const s3 = scenario!.step3
        if (s3.type === 'reason' && f)
          return `${L(s3.question)} ${L(s3.byFeeling[f] ?? { ko: '' })}`
        if (s3.type === 'body-reaction' && f)
          return `${L(s3.question)} ${L(s3.byFeeling[f]?.text ?? { ko: '' })}`
        return L(s3.question)
      }
      case 'action':
        return L(scenario!.action.question)
      case 'feedback': {
        const a = scenario!.action.options.find((o) => o.id === state!.actionId)
        return a ? L(a.feedback) : ''
      }
      default:
        return ''
    }
  }
  void replayText

  return (
    <>
      <LessonShell
        screenKey={state.step}
        progressIndex={progressIndex(state.step)}
        onHome={() => setConfirmHome(true)}
        onSettings={() => setSettingsOpen(true)}
        onReplay={replay}
        ttsSupported={supported}
        bottom={bottom}
      >
        {body}
      </LessonShell>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Sheet
        open={confirmHome}
        onClose={() => setConfirmHome(false)}
        title={t('confirm.home')}
        modal
      >
        <div className="flex gap-3 pt-2">
          <SecondaryButton full onClick={() => setConfirmHome(false)} data-testid="confirm-no">
            {t('confirm.no')}
          </SecondaryButton>
          <PrimaryButton full onClick={exit} data-testid="confirm-yes">
            {t('confirm.yes')}
          </PrimaryButton>
        </div>
      </Sheet>
    </>
  )
}
