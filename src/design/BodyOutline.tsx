import type { BodyPart } from '@/content/schema'
import { cn } from './cn'

/**
 * Front-facing, gender-neutral child silhouette with soft highlight blobs on the
 * body parts a feeling affects (PRD §6.6, Step-3 body-reaction variant).
 */
export function BodyOutline({ parts, className }: { parts: BodyPart[]; className?: string }) {
  const on = (p: BodyPart) => parts.includes(p)
  const blob = 'fill-link transition-opacity duration-300 motion-reduce:transition-none'
  return (
    <svg
      viewBox="0 0 160 300"
      className={cn('mx-auto h-[220px] w-auto text-ink lg:h-[300px] short:h-[160px]', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* highlights (under the outline) */}
      <ellipse cx="80" cy="48" rx="34" ry="36" className={blob} opacity={on('head') ? 0.55 : 0} />
      <ellipse cx="66" cy="46" rx="8" ry="6" className={blob} opacity={on('eyes') ? 0.9 : 0} />
      <ellipse cx="94" cy="46" rx="8" ry="6" className={blob} opacity={on('eyes') ? 0.9 : 0} />
      <ellipse cx="80" cy="66" rx="12" ry="7" className={blob} opacity={on('mouth') ? 0.9 : 0} />
      <ellipse cx="80" cy="128" rx="30" ry="22" className={blob} opacity={on('chest') ? 0.6 : 0} />
      <ellipse
        cx="80"
        cy="172"
        rx="26"
        ry="18"
        className={blob}
        opacity={on('stomach') ? 0.6 : 0}
      />
      <ellipse cx="28" cy="190" rx="12" ry="12" className={blob} opacity={on('hands') ? 0.8 : 0} />
      <ellipse cx="132" cy="190" rx="12" ry="12" className={blob} opacity={on('hands') ? 0.8 : 0} />
      <rect
        x="40"
        y="96"
        width="80"
        height="150"
        rx="36"
        className={blob}
        opacity={on('body') ? 0.35 : 0}
      />
      {/* outline */}
      <circle cx="80" cy="48" r="32" />
      <path d="M66 46h.5M94 46h.5" strokeWidth={5} />
      <path d="M70 64q10 6 20 0" />
      <path d="M58 86q22 10 44 0" />
      <path d="M52 96q-14 2-16 20l-10 64q-2 10 6 10t8-8l10-48" />
      <path d="M108 96q14 2 16 20l10 64q2 10-6 10t-8-8l-10-48" />
      <path d="M52 96h56q6 60 4 110h-64q-2-50 4-110z" />
      <path d="M62 206l-6 70q-1 8 6 8h8l8-70" />
      <path d="M98 206l6 70q1 8-6 8h-8l-8-70" />
    </svg>
  )
}
