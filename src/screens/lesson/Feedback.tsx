import type { Scenario } from '@/content/schema'
import { HeartFriends } from '@/design/HeartFriends'
import { Card } from '@/design/Card'
import { chosenAction, type LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useAutoRead } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
}

/** S5 — outcome panel (the flowchart's "view result", D7) + explanatory feedback (FR-S5-01). */
export function Feedback({ scenario, state }: Props) {
  const { t, L, locale } = useT()
  const action = chosenAction(state, scenario)
  const text = action ? L(action.feedback) : ''
  useAutoRead(text, `feedback-${action?.id ?? ''}`, action?.feedback.audio?.[locale])
  if (!action) return null
  return (
    <div className="feedback-layout">
      <h1 className="sr-only">
        {scenario.stepTitles?.feedback ? L(scenario.stepTitles.feedback) : t('step.feedback')}
      </h1>
      <Card
        label={t('feedback.myChoice')}
        tone="domain"
        domain={scenario.domain}
        className="outcome-panel"
        data-testid="outcome-panel"
      >
        {/* Phones move the outcome icon up beside the label so the chosen text keeps the width. */}
        <div className="outcome-row">
          <span className="outcome-badge">{action.id}</span>
          <p className="outcome-text text-body font-bold text-ink">{L(action.text)}</p>
          <img
            src={`/icons/outcome/${action.outcomeIcon}.svg`}
            alt=""
            width={64}
            height={64}
            className="outcome-icon"
          />
        </div>
      </Card>
      <div className="feedback-dialogue">
        <HeartFriends />
        <Card data-testid="feedback-card" aria-live="polite">
          <p className="text-story font-bold text-ink">{text}</p>
        </Card>
      </div>
    </div>
  )
}
