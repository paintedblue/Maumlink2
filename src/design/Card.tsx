import type { HTMLAttributes, ReactNode } from 'react'
import type { Domain } from '@/content/schema'
import { cn } from './cn'
import { domainSurface } from './domain'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  domain?: Domain
  tone?: 'surface' | 'domain'
}

/** Flat, paper-like card (PRD §6.5): 24 px radius, 2 px border, no drop shadow. */
export function Card({ label, domain, tone = 'surface', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border-2 px-5 py-4 md:px-6 md:py-5',
        tone === 'domain' && domain ? domainSurface[domain] : 'border-line bg-surface',
        'shadow-[0_2px_0_var(--color-line)]',
        className,
      )}
      {...rest}
    >
      {label && <div className="mb-2 text-caption font-bold text-ink">{label}</div>}
      {children}
    </div>
  )
}
