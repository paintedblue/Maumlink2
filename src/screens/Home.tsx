import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { scenariosByDomain } from '@/content/loader'
import type { Domain, Scenario } from '@/content/schema'
import { IconButton } from '@/design/Button'
import { domainSurface } from '@/design/Card'
import { Sheet } from '@/design/Sheet'
import { cn } from '@/design/cn'
import { CheckIcon, LinkMark, SettingsIcon, SpeakerIcon, SpeakerMutedIcon } from '@/design/icons'
import { useT } from '@/i18n/useT'
import { useLesson } from '@/engine/store'
import { useProgress } from '@/services/progress'
import { useSettings } from '@/services/settings'
import { sound } from '@/services/sound'
import { useAutoRead, useSpeak } from '@/services/useSpeak'
import { SettingsSheet } from './SettingsSheet'
import { StartGate } from './StartGate'

const ORDER: Domain[] = ['self', 'social', 'relation', 'mind', 'reserved']

export function Home() {
  const started = useSettings((s) => s.started)
  if (!started) return <StartGate />
  return <HomeInner />
}

function HomeInner() {
  const { t, L } = useT()
  const navigate = useNavigate()
  const { speak, supported } = useSpeak()
  const entries = useProgress((s) => s.entries)
  const soundOn = useSettings((s) => s.sound)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [picker, setPicker] = useState<Domain | null>(null)
  const greeting = t('home.greeting')

  useEffect(() => sound.setEnabled(soundOn), [soundOn])
  useAutoRead(greeting, 'home')

  const reset = useLesson((l) => l.reset)
  const open = (s: Scenario) => {
    reset()
    navigate(`/lesson/${s.id}`)
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col px-4 pb-safe pt-safe md:px-8">
      <header className="flex items-center justify-between py-4 md:py-6">
        <div className="flex items-center gap-3">
          <LinkMark size={44} className="text-ink" />
          <span className="text-body font-bold text-ink">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-3">
          <IconButton
            label={t('a11y.speak')}
            onClick={() => void speak(greeting)}
            badge={
              !supported ? (
                <span className="block size-3 rounded-full bg-ink-soft" title={t('tts.muted')} />
              ) : undefined
            }
          >
            {supported ? <SpeakerIcon /> : <SpeakerMutedIcon />}
          </IconButton>
          <IconButton label={t('nav.settings')} onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </div>
      </header>

      <h1 className="py-4 text-center text-story font-bold text-ink md:py-8">{greeting}</h1>
      {!supported && (
        <p className="mb-4 text-center text-caption text-ink-soft">{t('tts.unavailable')}</p>
      )}

      <section
        aria-label={t('home.pick')}
        className="grid grid-cols-1 gap-4 pb-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      >
        {ORDER.map((d) => {
          const list = scenariosByDomain[d]
          const reserved = d === 'reserved' || list.length === 0
          const done = list.some((s) => entries[s.id])
          return (
            <button
              key={d}
              type="button"
              data-domain={d}
              disabled={reserved}
              aria-label={`${t(`domain.${d}`)}${reserved ? ` (${t('home.reserved')})` : ''}`}
              className={cn(
                'relative flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-card border-[3px] p-5 text-ink transition-transform duration-150 active:scale-[0.98] motion-reduce:transition-none lg:min-h-[280px]',
                domainSurface[d],
                reserved
                  ? 'cursor-default opacity-50 grayscale'
                  : 'hoverable:hover:brightness-[1.02]',
              )}
              onClick={() => {
                if (reserved) return
                sound.play('tick')
                if (list.length === 1) open(list[0]!)
                else setPicker(d)
              }}
            >
              <img
                src={`/icons/domain/${d}.svg`}
                alt=""
                width={96}
                height={96}
                className="size-20 lg:size-24"
              />
              <span className="text-story font-bold leading-tight">{t(`domain.${d}`)}</span>
              <span className="text-body text-ink-soft">
                {reserved ? t('home.reserved') : t('home.count', { n: list.length })}
              </span>
              {done && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-caption font-bold text-ink">
                  <CheckIcon size={16} /> {t('home.done')}
                </span>
              )}
            </button>
          )
        })}
      </section>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Sheet open={picker !== null} onClose={() => setPicker(null)} title={t('home.pick')}>
        <div className="flex flex-col gap-3">
          {(picker ? scenariosByDomain[picker] : []).map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                'tap flex items-center justify-between rounded-card border-[3px] px-5 py-4 text-left text-body font-bold text-ink',
                domainSurface[s.domain],
              )}
              onClick={() => open(s)}
            >
              <span>{L(s.title)}</span>
              {entries[s.id] && <CheckIcon size={22} />}
            </button>
          ))}
        </div>
      </Sheet>
    </main>
  )
}
