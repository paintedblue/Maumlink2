import type { ReactNode } from 'react'
import { cn } from './cn'

export function SpeechBubble({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('speech-bubble', className)}>{children}</div>
}
