import type { ReactNode } from 'react'
import type { Scenario } from '@/content/schema'
import { useT } from '@/i18n/useT'

/** Keep the concrete situation in view while the child considers a new question. */
export function ScenePrompt({ scenario, children }: { scenario: Scenario; children: ReactNode }) {
  const { L, locale } = useT()
  const source = scenario.situation.imageByLocale?.[locale] ?? scenario.situation.image
  const base = source?.replace(/\.(png|webp|jpe?g)$/i, '')
  return (
    <div className="scene-prompt">
      {base && (
        <img
          className="scene-prompt-image"
          src={`${base}-800.webp`}
          width={160}
          height={100}
          alt={L(scenario.situation.imageBrief)}
        />
      )}
      <h1 className="text-story font-bold text-ink" aria-live="polite">
        {children}
      </h1>
    </div>
  )
}
