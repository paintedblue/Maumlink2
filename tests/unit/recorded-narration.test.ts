import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import inventory from '../../content-source/narration/inventory.json'
import recording from '../../src/services/recorded-narration.json'
import { resolveRecordedNarration } from '../../src/services/recordedNarration'

describe('recorded narration', () => {
  const clips = [
    { text: '속상해요', url: '/feeling.mp3' },
    { text: '친구의 마음을 살펴봐요.', url: '/reason.mp3' },
  ]

  it('assembles dynamic narration using complete phrases in order', () => {
    expect(resolveRecordedNarration('“속상해요”. 친구의 마음을 살펴봐요.', 'ko', clips)).toEqual([
      '/feeling.mp3',
      '/reason.mp3',
    ])
  })

  it('never drops unknown text, matches partial words, or uses Korean clips for English', () => {
    expect(resolveRecordedNarration('속상해요. 새로운 문장이에요.', 'ko', clips)).toBeUndefined()
    expect(resolveRecordedNarration('속상해요라는 말', 'ko', clips)).toBeUndefined()
    expect(resolveRecordedNarration('속상해요', 'en', clips)).toBeUndefined()
  })

  it('ships every registered MP3 inside public for offline precaching', () => {
    for (const clip of recording.clips) {
      expect(clip.url).toMatch(/^\/audio\/ko\/.+\.mp3$/)
      expect(existsSync(`public${clip.url}`), clip.url).toBe(true)
    }
  })

  it('covers every phrase the screens speak, so the browser voice is only a fallback', () => {
    const missing = inventory.clips
      .filter((phrase) => !resolveRecordedNarration(phrase.text, 'ko'))
      .map((phrase) => phrase.text)
    // Pending: the 2026-10-07 client correction (소개 → 고개) still needs its ElevenLabs clip.
    // Until `pnpm narration:import` registers it, the browser voice reads this one sentence.
    expect(missing).toEqual(['눈물이 나온다, 고개가 숙여진다, 몸에 힘이 빠진다.'])
  })

  it('assembles the Step 3 opening and the ending recap from recorded phrases', () => {
    // The learning objective is shown but never read (narratePrinciple: false).
    const opening =
      "'화가 나요'를 골랐어요. 그때 내 몸의 반응은 어떤가요? 머리에 열이 오르고 눈이 뜨거워지고, 목소리가 커진다."
    expect(resolveRecordedNarration(opening, 'ko')).toHaveLength(3)
    const recap =
      '오늘의 길 속상해요 내가 고른 방법. 조용한 곳에 잠시 혼자 있기. 숨을 크게 내쉬어보기'
    expect(resolveRecordedNarration(recap, 'ko')).toHaveLength(5)
  })
})
