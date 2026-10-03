import { useEffect, useRef, type ReactNode } from 'react'
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
  const content = useRef<HTMLElement>(null)
  useEffect(() => {
    content.current?.scrollTo?.({ top: 0 })
    const heading = content.current?.querySelector('h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [screenKey])
  return (
    <div className="lesson-shell flex h-dvh flex-col bg-bg text-ink">
      <header
        className="lesson-header flex shrink-0 items-center justify-between gap-4"
        style={{ minHeight: 'calc(var(--h-topbar) + var(--safe-top))' }}
      >
        <IconButton label={t('nav.home')} onClick={onHome}>
          <HomeIcon />
        </IconButton>
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2">
          <ProgressLink index={progressIndex} />
          <span className="hidden text-caption text-ink-soft md:block">
            {t(`step.${screenKey}`)}
          </span>
        </div>
        <div className="flex items-center gap-4">
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
        ref={content}
        key={screenKey}
        className="lesson-content mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col overflow-y-auto motion-safe:animate-[slideIn_240ms_ease-out]"
      >
        {children}
      </main>

      <footer
        className="lesson-footer shrink-0 border-t-2 border-line bg-surface"
        style={{ minHeight: 'calc(var(--h-bottombar) + var(--safe-bottom))' }}
      >
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1280px] flex-col-reverse gap-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(160px,0.7fr)] md:items-center',
          )}
        >
          <div className="flex flex-wrap items-center gap-4">
            {bottom.back && (
              <SecondaryButton
                quiet
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
            quiet
            data-testid="nav-primary"
            full
            className="md:ml-auto md:w-full md:min-w-0 md:max-w-[320px]"
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
