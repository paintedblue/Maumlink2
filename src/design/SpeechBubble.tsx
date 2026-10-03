import type { ReactNode } from 'react'
import { cn } from './cn'

export function SpeechBubble({
  children,
  tail = 'left',
  className,
}: {
  children: ReactNode
  tail?: 'left' | 'right' | 'none'
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative rounded-card border-2 border-line bg-surface px-6 py-4 text-story font-bold text-ink',
        className,
      )}
    >
      {children}
      {tail !== 'none' && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-[14px] size-6 rotate-45 border-b-2 border-r-2 border-line bg-surface',
            tail === 'left' ? 'left-8' : 'right-8',
          )}
        />
      )}
    </div>
  )
}
