/** UI icons — PRD §6.6: rounded line set, 2.5 px strokes, currentColor. */
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 28, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
  </Base>
)
export const SpeakerIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 10v4h3l5 4V6L7 10z" />
    <path d="M16 9.5a4 4 0 0 1 0 5" />
  </Base>
)
export const SpeakerMutedIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 10v4h3l5 4V6L7 10z" />
    <path d="M16 12h5" />
  </Base>
)
export const SettingsIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Base>
)
export const ArrowLeftIcon = (p: P) => (
  <Base {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Base>
)
export const ArrowRightIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Base>
)
export const HelpIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 5h16v11H11l-5 4v-4H4z" />
    <path d="M10 9.5q0-2 2-2t2 1.6q-.5 1-2 1.4v1" />
    <circle cx="12" cy="13.5" r=".9" fill="currentColor" stroke="none" />
  </Base>
)
export const ReplayIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 12a8 8 0 1 0 3-6.2" />
    <path d="M4 4v5h5" />
  </Base>
)
export const CheckIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 12l5 5L19 7" />
  </Base>
)
export const CloseIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)
export const ChevronRightIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
)
export const TextSizeIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 18l4-12 4 12M5.5 14h5" />
    <path d="M14 18l3-8 3 8M15 15.5h4" />
  </Base>
)

export const SceneIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8" cy="9" r="1.5" />
    <path d="M4 17l5-4 4 3 3-5 5 6" />
  </Base>
)
export const FeelingIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 9h.1M16 9h.1M8 14q4 5 8 0" />
  </Base>
)

/** Two hearts joined by one continuous line: the shared app and install identity. */
export function LinkMark({ size = 40, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M8 28c0-7 9-11 15-3 6-8 15-4 15 3 0 9-15 18-15 18S8 37 8 28Z"
        fill="var(--color-link)"
      />
      <path
        d="M26 21c0-7 9-11 15-3 6-8 15-4 15 3 0 9-15 18-15 18S26 30 26 21Z"
        fill="var(--color-brand-soft)"
      />
      <path
        d="M20 35c7 6 17-9 24-6"
        stroke="var(--color-brand)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
