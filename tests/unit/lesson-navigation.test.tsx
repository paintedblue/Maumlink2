import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, expect, it } from 'vitest'
import { getEmotion, scenarios } from '@/content/loader'
import { loadSession } from '@/engine/persistence'
import { useLesson } from '@/engine/store'
import { Lesson } from '@/screens/lesson/Lesson'
import { useSettings } from '@/services/settings'

function CurrentRoute() {
  const { pathname, search } = useLocation()
  return (
    <output data-testid="current-route">
      {pathname}
      {search}
    </output>
  )
}

beforeEach(() => {
  useSettings.setState({ started: true, autoRead: false, sound: false, locale: 'ko' })
  useLesson.getState().reset()
})

it.each(scenarios)(
  '$id: 이전 reverses every lesson step and story sentence without leaving',
  async (scenario) => {
    const user = userEvent.setup()
    const lessonPath = `/lesson/${scenario.id}`
    const { unmount } = render(
      <MemoryRouter initialEntries={[lessonPath]}>
        <CurrentRoute />
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/lesson/:scenarioId" element={<Lesson />} />
        </Routes>
      </MemoryRouter>,
    )
    for (let i = 0; i <= scenario.situation.story.length; i++)
      await user.click(screen.getByTestId('nav-primary'))
    const feeling = getEmotion(scenario.feeling.options[0]!)
    await user.click(screen.getByRole('checkbox', { name: feeling.word.ko }))
    await user.click(screen.getByTestId('nav-primary'))
    if (scenario.step3.type === 'multiple-choice')
      await user.click(screen.getAllByRole('radio')[0]!)
    await user.click(screen.getByTestId('nav-primary'))
    const action = scenario.action.options[0]!
    await user.click(screen.getByRole('radio', { name: action.text.ko }))
    await user.click(screen.getByTestId('nav-primary'))

    for (const step of ['action', 'step3', 'feeling', 'situation']) {
      await user.click(screen.getByRole('button', { name: '이전' }))
      expect(screen.getByTestId('current-route')).toHaveTextContent(`${lessonPath}?step=${step}`)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      if (step === 'action')
        expect(screen.getByRole('radio', { name: action.text.ko })).toHaveAttribute(
          'aria-checked',
          'true',
        )
      if (step === 'feeling')
        expect(screen.getByRole('checkbox', { name: feeling.word.ko })).toHaveAttribute(
          'aria-checked',
          'true',
        )
    }
    expect(screen.getByTestId('story-card')).toHaveTextContent(scenario.situation.keySentence.ko)
    for (let i = scenario.situation.story.length - 1; i >= 0; i--) {
      await user.click(screen.getByRole('button', { name: '이전' }))
      expect(screen.getByTestId('story-card')).toHaveTextContent(scenario.situation.story[i]!.ko)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByTestId('current-route')).toHaveTextContent(`${lessonPath}?step=situation`)
      expect(loadSession(scenario)?.sentenceIndex).toBe(i)
    }
    expect(screen.queryByRole('button', { name: '이전' })).not.toBeInTheDocument()
    // Home remains an explicit, confirmed exit; Back never uses that route.
    await user.click(screen.getByRole('button', { name: '처음으로' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByTestId('confirm-yes'))
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    unmount()
  },
)
