import { getEmotion } from '@/content/loader'
import type { BodyPart, Scenario } from '@/content/schema'
import { BodyOutline } from '@/design/BodyOutline'
import { Card } from '@/design/Card'
import { ChoiceCard } from '@/design/ChoiceCard'
import { cn } from '@/design/cn'
import type { LessonEvent, LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useAutoRead, useSpeak } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  dispatch: (e: LessonEvent) => void
  wiggle: number
}

/** S3 — reason / body-reaction / multiple-choice variants (FR-S3-01/02/03, FR-ENG-04). */
export function Step3({ scenario, state, dispatch, wiggle }: Props) {
  const { t, L, locale } = useT()
  const { speak } = useSpeak()
  const step3 = scenario.step3
  const feelings = state.feelingIds.map(getEmotion)
  const first = feelings[0]

  // Auto-read: the header + question + (for per-feeling variants) the first explanation.
  const intro = [
    first ? t('feeling.chose', { emotion: L(first.word) }) : '',
    L(step3.question),
    step3.type === 'reason' && first ? L(step3.byFeeling[first.id] ?? { ko: '' }) : '',
    step3.type === 'body-reaction' && first ? L(step3.byFeeling[first.id]?.text ?? { ko: '' }) : '',
  ]
    .filter(Boolean)
    .join(' ')
  useAutoRead(intro, `step3-${state.feelingIds.join(',')}`)
  useAutoRead(
    state.moreShown ? L(step3.more) : undefined,
    `more-${state.moreShown}`,
    step3.more.audio?.[locale],
  )

  return (
    <div className="flex flex-col gap-4">
      {first && (
        <div className="flex items-center gap-3" aria-live="polite">
          <span
            className="flex size-14 items-center justify-center rounded-full"
            style={{ backgroundColor: first.tint }}
          >
            <img
              src={`/icons/emotions/${first.icon}`}
              alt=""
              width={40}
              height={40}
              className="size-10"
            />
          </span>
          <span className="text-body font-bold text-ink">
            {t('feeling.chose', { emotion: feelings.map((f) => L(f.word)).join(', ') })}
          </span>
        </div>
      )}

      {step3.type === 'reason' && (
        <div className="flex flex-col gap-3">
          {feelings.map((f) => {
            const text = step3.byFeeling[f.id]
            if (!text) return null
            return (
              <Card key={f.id} label={L(step3.question)} tone="domain" domain={scenario.domain}>
                <p className="text-story font-bold text-ink">{L(text)}</p>
              </Card>
            )
          })}
        </div>
      )}

      {step3.type === 'body-reaction' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <BodyOutline
              parts={unionParts(feelings.map((f) => step3.byFeeling[f.id]?.parts ?? []))}
            />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-7">
            {feelings.map((f) => {
              const entry = step3.byFeeling[f.id]
              if (!entry) return null
              return (
                <Card key={f.id} label={L(step3.question)} tone="domain" domain={scenario.domain}>
                  <p className="text-story font-bold text-ink">{L(entry.text)}</p>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {step3.type === 'multiple-choice' && (
        <div className="flex flex-col gap-3">
          <h2 className="text-story font-bold text-ink">{L(step3.question)}</h2>
          <div
            key={wiggle}
            role="radiogroup"
            aria-label={L(step3.question)}
            className={cn(
              'grid grid-cols-1 gap-3 md:grid-cols-2',
              wiggle > 0 && 'motion-safe:animate-[wiggle_300ms_ease-in-out_1]',
            )}
          >
            {step3.options.map((o) => {
              const selected = state.step3OptionId === o.id
              return (
                <ChoiceCard
                  key={o.id}
                  id={o.id}
                  domain={scenario.domain}
                  text={L(o.text)}
                  selected={selected}
                  onSelect={(id) => {
                    void speak(o.text)
                    dispatch({ type: 'SELECT_STEP3_OPTION', id })
                  }}
                  onSpeak={() => void speak(o.text)}
                >
                  {selected ? L(o.ack) : undefined}
                </ChoiceCard>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-body text-ink-soft">{L(step3.principle)}</p>

      {state.moreShown && (
        <Card className="motion-safe:animate-[fadeIn_240ms_ease-out]" data-testid="step3-more">
          <p className="text-body text-ink">{L(step3.more)}</p>
        </Card>
      )}
    </div>
  )
}

function unionParts(lists: BodyPart[][]): BodyPart[] {
  return [...new Set(lists.flat())]
}
