import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from './AppShell'
import { Home } from '@/screens/Home'
import { Lesson } from '@/screens/lesson/Lesson'

/** PRD §5.1 — two real routes; lesson steps live in engine state, not URLs. */
export const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: Home },
      { path: 'lesson/:scenarioId', Component: Lesson },
      { path: 'lesson/:scenarioId/done', Component: Lesson },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
