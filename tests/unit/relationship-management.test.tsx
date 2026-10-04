/**
 * 관계 관리 (Relationship Management) — features requested by the domain design document:
 * document step titles, several feelings may be chosen (“여러 감정을 선택할 수 있도록 구성해도
 * 좋음”), the STEP 3 “핵심 피드백” appears after a reason is chosen, and exact md wording.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { getScenario } from '@/content/loader'
import { initialLessonState, reduce, type LessonEvent } from '@/engine/lessonMachine'
import { useLesson } from '@/engine/store'
import { Lesson } from '@/screens/lesson/Lesson'
import { useProgress } from '@/services/progress'
import { useSettings } from '@/services/settings'

const relation = getScenario('relation-pencil-prank')!
const KEY_FEEDBACK =
  '나는 친구를 웃겨주려고 장난을 했어요. 하지만 친구는 속상하거나 걱정할 수 있어요.'

describe('관계 관리 content wiring', () => {
  it('uses the document titles, multi-select feelings and key feedback after a choice', () => {
    expect(relation.stepTitles?.step3?.ko).toBe('왜 그런 기분이 들까요?')
    expect(relation.feeling.multiSelect).toBe(true)
    expect(relation.step3.type === 'multiple-choice' && relation.step3.principleAfterChoice).toBe(
      true,
    )
  })
  it('keeps the document’s quote spacing exactly', () => {
    expect(relation.action.options[2]!.text.ko).toBe(
      '연필을 돌려주고 “미안해. 나는 네가 웃을 줄 알았어.”라고 말해요.',
    )
    expect(relation.action.options[3]!.text.ko).toBe(
      '“내가 장난으로 숨겼는데 속상했어?”라고 친구에게 물어봐요.',
    )
  })
  it('lets the child keep more than one feeling', () => {
    const s = [
      { type: 'NEXT' },
      { type: 'NEXT' },
      { type: 'NEXT' },
      { type: 'NEXT' },
      { type: 'SELECT_FEELING', id: 'worried' },
      { type: 'SELECT_FEELING', id: 'upset' },
    ].reduce((x, e) => reduce(x, e as LessonEvent, relation), initialLessonState(relation.id))
    expect(s.feelingIds).toEqual(['worried', 'upset'])
  })
})

describe('관계 관리 lesson (screens)', () => {
  beforeEach(() => {
    useSettings.setState({ started: true, autoRead: false, sound: false, locale: 'ko' })
    useProgress.setState({ entries: {} })
    useLesson.getState().reset()
  })

  it('reveals the key feedback only after a reason is chosen', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/lesson/${relation.id}`]}>
        <Routes>
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
          <Route path="/lesson/:scenarioId/done" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )
    for (let i = 0; i < 4; i++) await user.click(screen.getByTestId('nav-primary'))
    await user.click(screen.getByRole('checkbox', { name: '걱정돼요' }))
    await user.click(screen.getByRole('checkbox', { name: '속상해요' }))
    await user.click(screen.getByTestId('nav-primary'))

    expect(screen.getByText('왜 그런 기분이 들까요?')).toBeInTheDocument()
    expect(screen.getByText("'걱정돼요, 속상해요'를 골랐어요.")).toBeInTheDocument()
    expect(screen.queryByText(KEY_FEEDBACK)).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /연필을 찾지 못해 속상했어요/ }))
    expect(screen.getByTestId('step3-key-feedback')).toHaveTextContent(KEY_FEEDBACK)
  })
})
