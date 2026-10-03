import type { ReactNode } from 'react'
import type { Domain, OptionId } from '@/content/schema'
import { useT } from '@/i18n/useT'
import { sound } from '@/services/sound'
import { cn } from './cn'
import { CheckIcon, SpeakerIcon } from './icons'

const badgeTint: Record<Domain, string> = {
  self: 'bg-domain-self text-ink',
  social: 'bg-domain-social text-ink',
  relation: 'bg-domain-relation text-ink',
  mind: 'bg-domain-mind text-ink',
  reserved: 'bg-domain-reserved text-ink',
}

interface Props {
  id: OptionId
  domain: Domain
  text: string
  selected: boolean
  dimmed?: boolean
  onSelect: (id: OptionId) => void
  onSpeak: () => void
  children?: ReactNode
}

/** Action / multiple-choice card (PRD §6.7): letter badge, text, speaker; min 96 px tall. */
export function ChoiceCard({
  id,
  domain,
  text,
  selected,
  dimmed,
  onSelect,
  onSpeak,
  children,
}: Props) {
  const { t } = useT()
  return (
    <div
      className={cn(
        'relative flex min-h-[96px] flex-wrap items-stretch rounded-card border-2 bg-surface transition-[border-color,transform] duration-150 motion-reduce:transition-none lg:min-h-[120px]',
        selected ? 'border-select ring-2 ring-select' : 'border-line',
        dimmed && !selected && 'bg-bg',
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        data-option={id}
        className="tap min-w-0 flex flex-1 items-center gap-3 px-4 py-4 text-left md:px-5"
        onKeyDown={(event) => {
          if (
            !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)
          )
            return
          const options = Array.from(
            event.currentTarget
              .closest('[role="radiogroup"]')
              ?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
          )
          if (!options.length) return
          event.preventDefault()
          const i = options.indexOf(event.currentTarget)
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? options.length - 1
                : (i +
                    (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) +
                    options.length) %
                  options.length
          options[next]?.focus()
          options[next]?.click()
        }}
        onClick={() => {
          sound.play('tick')
          onSelect(id)
        }}
      >
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-full text-btn font-bold',
            badgeTint[domain],
          )}
          aria-hidden="true"
        >
          {id}
        </span>
        <span className="flex-1 text-body text-ink">{text}</span>
      </button>
      <button
        type="button"
        aria-label={t('a11y.speak')}
        title={text}
        className="tap flex shrink-0 items-center justify-center self-center pr-3 text-ink-soft"
        onClick={onSpeak}
      >
        <SpeakerIcon size={26} />
      </button>
      {selected && (
        <span
          className="pointer-events-none absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-select text-white"
          aria-hidden="true"
        >
          <CheckIcon size={22} />
        </span>
      )}
      {children && <div className="basis-full px-5 pb-4 text-body text-ink-soft">{children}</div>}
    </div>
  )
}
