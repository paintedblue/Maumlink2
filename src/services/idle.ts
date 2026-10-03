import { useEffect, useRef } from 'react'

/**
 * Fires `onIdle` once after `ms` with no pointer/keyboard activity while `active`.
 * Used for the feeling-screen auto-hint (FR-S2-04). Resets on any interaction.
 */
export function useIdle(ms: number, onIdle: () => void, active: boolean): void {
  const cb = useRef(onIdle)
  useEffect(() => {
    cb.current = onIdle
  }, [onIdle])
  useEffect(() => {
    if (!active) return
    let timer: number | undefined
    const arm = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => cb.current(), ms)
    }
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart']
    for (const e of events) window.addEventListener(e, arm, { passive: true })
    arm()
    return () => {
      if (timer) window.clearTimeout(timer)
      for (const e of events) window.removeEventListener(e, arm)
    }
  }, [ms, active])
}
