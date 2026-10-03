import type { Scenario } from '@/content/schema'
import { Illustration } from '@/design/Illustration'
import { HeartFriends } from '@/design/HeartFriends'
import { cn } from '@/design/cn'
import { keySentenceVisible, type LessonState } from '@/engine/lessonMachine'
import { useT } from '@/i18n/useT'
import { useAutoRead } from '@/services/useSpeak'

interface Props {
  scenario: Scenario
  state: LessonState
  onAdvance: () => void
}

function imageBase(scenario: Scenario, locale: 'ko' | 'en'): string | undefined {
  const img = scenario.situation.imageByLocale?.[locale] ?? scenario.situation.image
  return img ? img.replace(/\.(png|webp|jpe?g)$/i, '') : undefined
}

/** S1 — one sentence at a time, then the key sentence in a bubble (FR-S1-01/02/03). */
export function Situation({ scenario, state, onAdvance }: Props) {
  const { t, L, locale } = useT()
  const story = scenario.situation.story
  const keyVisible = keySentenceVisible(state, scenario)
  const current = keyVisible ? scenario.situation.keySentence : story[state.sentenceIndex]!
  const text = L(current)
  useAutoRead(text, `situation-${state.sentenceIndex}`, current.audio?.[locale])

  return (
    <div className="situation-layout" data-key-sentence={keyVisible}>
      <h1 className="story-heading">{L(scenario.situation.title)}</h1>
      <div className="situation-art">
        <Illustration
          src={imageBase(scenario, locale)}
          alt={L(scenario.situation.imageBrief)}
          brief={L(scenario.situation.imageBrief)}
          domain={scenario.domain}
        />
      </div>
      <div className="situation-copy">
        <HeartFriends className="story-friends" />
        <button
          type="button"
          data-testid="story-card"
          className="story-dialogue text-left"
          onClick={() => {
            if (!keyVisible) onAdvance()
          }}
          aria-live="polite"
        >
          <span
            key={state.sentenceIndex}
            className="story-sentence text-story font-bold text-ink motion-safe:animate-[fadeIn_240ms_ease-out]"
          >
            {text}
          </span>
        </button>
        <div
          role="img"
          className="story-position flex items-center gap-2"
          aria-label={t('a11y.sentenceDots', {
            i: Math.min(state.sentenceIndex + 1, story.length + 1),
            n: story.length + 1,
          })}
        >
          {Array.from({ length: story.length + 1 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                'block size-3 rounded-full transition-colors',
                i <= state.sentenceIndex ? 'bg-link' : 'bg-line',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
