/**
 * UI sounds — PRD §6.11: three soft sounds (tick, chime, turn), ≤ 400 ms, quiet.
 * Synthesized with WebAudio so there are no audio assets to download or precache
 * and they work offline from the first visit. Respects the sound setting.
 */
export type SoundName = 'tick' | 'chime' | 'turn'

let ctx: AudioContext | undefined
let enabled = true

function context(): AudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return undefined
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  gain: number,
  type: OscillatorType = 'sine',
) {
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(gain, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(g).connect(c.destination)
  o.start(start)
  o.stop(start + dur + 0.02)
}

export const sound = {
  setEnabled(v: boolean) {
    enabled = v
  },
  /** Call on the first user gesture so iOS allows audio. */
  unlock() {
    context()
  },
  play(name: SoundName) {
    if (!enabled) return
    const c = context()
    if (!c) return
    const t = c.currentTime
    // −12 dBFS ≈ 0.25 linear; keep everything at or below that.
    switch (name) {
      case 'tick':
        tone(c, 880, t, 0.06, 0.18)
        break
      case 'turn':
        tone(c, 520, t, 0.09, 0.14, 'triangle')
        break
      case 'chime':
        tone(c, 659.25, t, 0.28, 0.2)
        tone(c, 987.77, t + 0.12, 0.3, 0.16)
        break
    }
  },
}
