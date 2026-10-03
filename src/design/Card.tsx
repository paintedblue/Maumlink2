import type { HTMLAttributes, ReactNode } from 'react'
import type { Domain } from '@/content/schema'
import { cn } from './cn'
import { domainSurface } from './domain'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  domain?: Domain
  tone?: 'surface' | 'domain'
}

/** Quiet informational surface; shared theme tokens separate it from selectable choices. */
export function Card({ label, domain, tone = 'surface', className, children, ...rest }: CardProps) {
  return (
    <div
      data-domain-tone={tone === 'domain' ? domain : undefined}
      className={cn(
        'content-panel',
        tone === 'domain' && domain ? `content-panel--domain ${domainSurface[domain]}` : '',
        className,
      )}
      {...rest}
    >
      {label && <div className="mb-2 text-caption font-bold text-ink">{label}</div>}
      {children}
    </div>
  )
}
