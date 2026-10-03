import { useT } from '@/i18n/useT'

/** M0 placeholder shell — replaced by the full Home in M1 (FR-HOME-*). */
export function Home() {
  const { t } = useT()
  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-ink">
      <h1 className="text-story font-bold">{t('app.name')}</h1>
      <p className="text-body text-ink-soft">{t('home.greeting')}</p>
    </main>
  )
}
