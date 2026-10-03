import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { scenariosByDomain } from '@/content/loader'
import type { Domain, Scenario } from '@/content/schema'
import { IconButton } from '@/design/Button'
import { domainSurface } from '@/design/domain'
import { Sheet } from '@/design/Sheet'
import { cn } from '@/design/cn'
import {
  CheckIcon,
  ChevronRightIcon,
  LinkMark,
  SettingsIcon,
  SpeakerIcon,
  SpeakerMutedIcon,
} from '@/design/icons'
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
  const { t, L, locale } = useT()
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
    <div className="home-screen">
      <header className="home-masthead">
        <div className="home-header">
          <div className="brand-lockup">
            <span className="brand-symbol">
              <LinkMark size={44} />
            </span>
            <span className="brand-name">{t('app.name')}</span>
          </div>
          <div className="utility-controls">
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
        </div>

        <div className="home-intro">
          <h1 className="home-question">{greeting}</h1>
          <span className="home-intro-line" aria-hidden="true" />
        </div>
      </header>
      <main className="home-library">
        {!supported && (
          <p className="mb-4 text-center text-caption text-ink-soft">{t('tts.unavailable')}</p>
        )}

        <section aria-label={t('home.pick')} className="domain-grid">
          {ORDER.map((d) => {
            const list = scenariosByDomain[d]
            const reserved = d === 'reserved' || list.length === 0
            const done = list.length > 0 && list.every((s) => entries[s.id])
            const scene = list[0]
            const cover = scene?.situation.imageByLocale?.[locale] ?? scene?.situation.image
            const imageBase = cover?.replace(/\.(png|webp|jpe?g)$/i, '')
            return (
              <button
                key={d}
                type="button"
                data-domain={d}
                disabled={reserved}
                aria-label={`${t(`domain.${d}`)}${reserved ? ` (${t('home.reserved')})` : ''}`}
                className={cn('domain-card', reserved && 'domain-card--reserved')}
                onClick={() => {
                  if (reserved) return
                  sound.play('tick')
                  if (list.length === 1) open(list[0]!)
                  else setPicker(d)
                }}
              >
                {!reserved && (
                  <span className="domain-card-cover">
                    {imageBase ? (
                      <img
                        src={`${imageBase}-800.webp`}
                        alt=""
                        width={800}
                        height={500}
                        decoding="async"
                      />
                    ) : (
                      <img
                        src={`/icons/domain/${d}.svg`}
                        alt=""
                        width={96}
                        height={96}
                        className="domain-cover-fallback"
                      />
                    )}
                    <span className={`domain-cover-symbol domain-cover-symbol--${d}`}>
                      <img src={`/icons/domain/${d}.svg`} alt="" width={32} height={32} />
                    </span>
                  </span>
                )}
                <span className="domain-card-content">
                  <span className="domain-card-name">{t(`domain.${d}`)}</span>
                  {!reserved && scene && (
                    <span className="domain-card-summary">{L(scene.situation.keySentence)}</span>
                  )}
                  {!reserved && (
                    <span className="domain-card-meta">
                      <span className="text-caption text-ink-soft">
                        {t('home.count', { n: list.length })}
                      </span>
                      <span className="domain-card-arrow">
                        <ChevronRightIcon size={24} />
                      </span>
                    </span>
                  )}
                </span>
                {done && (
                  <span className="domain-completed">
                    <CheckIcon size={16} /> {t('home.done')}
                  </span>
                )}
              </button>
            )
          })}
        </section>
      </main>
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
    </div>
  )
}
