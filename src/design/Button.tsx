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

const common =
  'tap inline-flex items-center justify-center gap-3 whitespace-normal rounded-btn px-6 py-3 text-btn font-bold select-none transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100'

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
        'bg-go text-go-ink shadow-[0_2px_0_var(--color-line)] hoverable:hover:brightness-105',
        softDisabled && 'opacity-40',
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
      className={cn(
        common,
        'border-2 border-line bg-surface text-ink hoverable:hover:bg-bg',
        full && 'w-full',
        className,
      )}
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
      className={cn(
        'tap relative inline-flex items-center justify-center rounded-full border-2 border-line bg-surface text-ink transition-transform duration-150 active:scale-95 hoverable:hover:bg-bg motion-reduce:transition-none',
        className,
      )}
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
