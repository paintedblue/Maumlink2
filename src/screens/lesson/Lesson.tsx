import { Navigate, useParams } from 'react-router'
import { getScenario } from '@/content/loader'

/** M0 placeholder — the Lesson Engine screens arrive in M1. */
export function Lesson() {
  const { scenarioId = '' } = useParams()
  const scenario = getScenario(scenarioId)
  if (!scenario) return <Navigate to="/" replace />
  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-ink">
      <h1 className="text-story font-bold">{scenario.title.ko}</h1>
    </main>
  )
}
