import type { Emotion } from '@/content/schema'
import { useT } from '@/i18n/useT'
import { sound } from '@/services/sound'
import { cn } from './cn'
import { CheckIcon } from './icons'

interface Props {
  emotion: Emotion
  selected: boolean
  dimmed?: boolean
  onSelect: (id: string) => void
  size?: 'normal' | 'compact'
}

/**
 * Face icon + word (PRD §6.7). Tapping speaks the word (parent handles) and toggles.
 * Selected = 4 px select border + check badge + 2% scale — never color alone.
 */
export function EmotionTile({ emotion, selected, dimmed, onSelect, size = 'normal' }: Props) {
  const { L, t } = useT()
  const word = L(emotion.word)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={word}
      data-emotion={emotion.id}
      className={cn(
        'tap relative flex flex-col items-center justify-center gap-2 rounded-tile border-2 bg-surface p-3 text-ink transition-[transform,border-color] duration-150 motion-reduce:transition-none',
        size === 'normal' ? 'min-h-[144px] w-full short:min-h-[112px]' : 'min-h-[120px] w-full',
        selected
          ? 'border-select ring-2 ring-select'
          : 'border-line hoverable:hover:border-ink-soft hoverable:hover:-translate-y-1',
        dimmed && !selected && 'opacity-60',
      )}
      onClick={() => {
        sound.play('tick')
        onSelect(emotion.id)
      }}
    >
      <span
        className="flex size-[88px] items-center justify-center rounded-full short:size-[64px]"
        style={{ backgroundColor: emotion.tint }}
      >
        <img
          src={`/icons/emotions/${emotion.icon}`}
          alt=""
          width={64}
          height={64}
          className="size-[64px] short:size-[48px]"
        />
      </span>
      <span className="text-emotion font-bold leading-tight">{word}</span>
      {selected && (
        <span
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-select text-white"
          aria-hidden="true"
        >
          <CheckIcon size={20} />
          <span className="sr-only">{t('feeling.selected')}</span>
        </span>
      )}
    </button>
  )
}
