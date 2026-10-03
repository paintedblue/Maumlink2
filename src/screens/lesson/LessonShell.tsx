import type { ReactNode } from 'react'
import { IconButton, PrimaryButton, SecondaryButton } from '@/design/Button'
import { ProgressLink } from '@/design/ProgressLink'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  SettingsIcon,
  SpeakerIcon,
  SpeakerMutedIcon,
} from '@/design/icons'
import { useT } from '@/i18n/useT'
import { cn } from '@/design/cn'

export interface BottomBar {
  back?: { label: string; onClick: () => void }
  primary: { label: string; onClick: () => void; softDisabled?: boolean; icon?: ReactNode }
  /** Optional third control (Help / Tell me more / Try another way). */
  extra?: ReactNode
}

interface Props {
  progressIndex: number
  onHome: () => void
  onSettings: () => void
  onReplay: () => void
  ttsSupported: boolean
  bottom: BottomBar
  children: ReactNode
  /** Key that changes per screen to replay the slide-in transition. */
  screenKey: string
}

/**
 * Fixed chrome for every lesson screen (PRD §6.2): top bar (Home · progress · speaker/settings),
 * scrollable content zone, sticky bottom bar within 100dvh + safe-area insets (FR-RES-03/07).
 */
export function LessonShell({
  progressIndex,
  onHome,
  onSettings,
  onReplay,
  ttsSupported,
  bottom,
  children,
  screenKey,
}: Props) {
  const { t } = useT()
  return (
    <div className="flex h-dvh flex-col bg-bg text-ink">
      <header
        className="flex shrink-0 items-center justify-between gap-3 px-3 pt-safe px-safe md:px-6"
        style={{ minHeight: 'calc(var(--h-topbar) + var(--safe-top))' }}
      >
        <IconButton label={t('nav.home')} onClick={onHome}>
          <HomeIcon />
        </IconButton>
        <div className="flex flex-1 justify-center">
          <ProgressLink index={progressIndex} />
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            label={t('nav.replay')}
            onClick={onReplay}
            badge={
              !ttsSupported ? <span className="block size-3 rounded-full bg-ink-soft" /> : undefined
            }
          >
            {ttsSupported ? <SpeakerIcon /> : <SpeakerMutedIcon />}
          </IconButton>
          <IconButton label={t('nav.settings')} onClick={onSettings}>
            <SettingsIcon />
          </IconButton>
        </div>
      </header>

      <main
        key={screenKey}
        className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-3 px-safe motion-safe:animate-[slideIn_240ms_ease-out] md:px-8 lg:justify-center"
      >
        {children}
      </main>

      <footer
        className="shrink-0 border-t-2 border-line bg-bg px-4 pb-safe px-safe md:px-8"
        style={{ minHeight: 'calc(var(--h-bottombar) + var(--safe-bottom))' }}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1280px] flex-col-reverse gap-3 py-3 md:flex-row md:items-center md:justify-between',
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            {bottom.back && (
              <SecondaryButton
                icon={<ArrowLeftIcon size={26} />}
                onClick={bottom.back.onClick}
                data-testid="nav-back"
                className="flex-1 md:flex-none"
              >
                {bottom.back.label}
              </SecondaryButton>
            )}
            {bottom.extra}
          </div>
          <PrimaryButton
            data-testid="nav-primary"
            full
            className="md:w-auto md:min-w-[220px]"
            softDisabled={bottom.primary.softDisabled}
            onClick={bottom.primary.onClick}
            icon={bottom.primary.icon}
            iconRight={bottom.primary.icon ? undefined : <ArrowRightIcon size={26} />}
          >
            {bottom.primary.label}
          </PrimaryButton>
        </div>
      </footer>
    </div>
  )
}
