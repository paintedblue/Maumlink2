import { useEffect, useState } from 'react'
import { speech } from '@/services/speech'
import { Outlet } from 'react-router'
import { useSettings } from '@/services/settings'

/** Applies persisted settings to <html> (text size, lang) and hosts the routes. */
export function AppShell() {
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => speech.onText(setAnnouncement), [])
  const textSize = useSettings((s) => s.textSize)
  const locale = useSettings((s) => s.locale)

  useEffect(() => {
    const html = document.documentElement
    html.dataset.text = textSize
    html.lang = locale
  }, [textSize, locale])

  return (
    <>
      <Outlet />
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </>
  )
}
