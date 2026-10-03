import { useT } from '@/i18n/useT'

/** Friendly, localized wordmark with an accessible name and no external font dependency. */
export function BrandLogo({ className = '' }: { className?: string }) {
  const { t, locale } = useT()
  return (
    <img
      className={`brand-wordmark ${className}`}
      src={locale === 'ko' ? '/brand/logo-ko.svg' : '/brand/logo-en.svg'}
      alt={t('app.name')}
      width={locale === 'ko' ? 310 : 375}
      height={100}
      draggable={false}
    />
  )
}
