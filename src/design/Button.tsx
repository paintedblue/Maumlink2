import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { sound } from '@/services/sound'

type Base = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  iconRight?: ReactNode
  /** When "soft-disabled", the button stays focusable/tappable and lets the parent respond (FR-S2-02). */
  softDisabled?: boolean
  full?: boolean
  quiet?: boolean
}

const common = 'app-button tap'

/** The one green "go" button — always the same color, always the same place (PRD §6.2). */
export function PrimaryButton({
  icon,
  iconRight,
  softDisabled,
  full,
  quiet,
  className,
  onClick,
  children,
  ...rest
}: Base) {
  return (
    <button
      type="button"
      data-variant="primary"
      aria-disabled={softDisabled || undefined}
      className={cn(
        common,
        'app-button--primary',
        softDisabled && 'app-button--pending',
        full && 'w-full',
        className,
      )}
      onClick={(e) => {
        if (!quiet && !softDisabled) sound.play('tick')
        onClick?.(e)
      }}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  )
}

export function SecondaryButton({
  icon,
  iconRight,
  full,
  quiet,
  className,
  onClick,
  children,
  ...rest
}: Base) {
  return (
    <button
      type="button"
      data-variant="secondary"
      className={cn(common, 'app-button--secondary', full && 'w-full', className)}
      onClick={(e) => {
        if (!quiet) sound.play('tick')
        onClick?.(e)
      }}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  badge?: ReactNode
}

/** 64 × 64 round icon button with a required accessible label (teacher tooltip = title). */
export function IconButton({
  label,
  badge,
  className,
  onClick,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('icon-button tap', className)}
      onClick={(e) => {
        sound.play('tick')
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
      {badge && <span className="absolute -right-1 -top-1">{badge}</span>}
    </button>
  )
}
