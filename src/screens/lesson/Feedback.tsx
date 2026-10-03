import type { Scenario } from '@/content/schema'
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
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-4">
      <h1 className="sr-only">{t('step.feedback')}</h1>
      <Card
        label={t('feedback.myChoice')}
        tone="domain"
        domain={scenario.domain}
        data-testid="outcome-panel"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface text-btn font-bold text-ink">
            {action.id}
          </span>
          <p className="flex-1 text-body font-bold text-ink">{L(action.text)}</p>
          <img
            src={`/icons/outcome/${action.outcomeIcon}.svg`}
            alt=""
            width={64}
            height={64}
            className="size-14 shrink-0 md:size-16"
          />
        </div>
      </Card>
      <Card className="min-h-[160px]" data-testid="feedback-card" aria-live="polite">
        <p className="text-story font-bold text-ink">{text}</p>
      </Card>
    </div>
  )
}
