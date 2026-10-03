import { useT } from '@/i18n/useT'
import { cn } from './cn'

const STEPS = 5

/**
 * Five dots joined by a line that fills as the child progresses — the "link" motif
 * (PRD §6.1/§6.7). Current dot is larger with a soft pulse (off under reduced motion).
 */
export function ProgressLink({ index }: { index: number }) {
  const { t } = useT()
  const done = Math.min(index, STEPS)
  const pct = (Math.min(index, STEPS - 1) / (STEPS - 1)) * 100
  return (
    <div
      className="relative flex w-full max-w-[260px] items-center justify-between"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STEPS}
      aria-valuenow={Math.min(index + 1, STEPS)}
      aria-label={t('progress.label', { i: Math.min(index + 1, STEPS), n: STEPS })}
    >
      <span
        className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line"
        aria-hidden="true"
      />
      <span
        className="absolute left-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-link transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `calc((100% - 16px) * ${pct / 100})` }}
        aria-hidden="true"
      />
      {Array.from({ length: STEPS }, (_, i) => {
        const isDone = i < done
        const isCurrent = i === index
        return (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              'relative z-10 block rounded-full border-2 transition-all duration-300 motion-reduce:transition-none',
              isCurrent
                ? 'size-5 border-link bg-link motion-safe:animate-[pulse_2s_ease-in-out_infinite]'
                : isDone
                  ? 'size-4 border-link bg-link'
                  : 'size-4 border-line bg-surface',
            )}
          />
        )
      })}
    </div>
  )
}
