/** Completion marks — PRD §11.4 `maumlink.progress.v1`. No personal data. */
import { create } from 'zustand'
import { z } from 'zod'
import { persist } from 'zustand/middleware'

interface ProgressEntry {
  completedAt: string
  times: number
}
interface ProgressState {
  entries: Record<string, ProgressEntry>
  markCompleted: (scenarioId: string) => void
  isCompleted: (scenarioId: string) => boolean
}

export const StoredProgress = z
  .object({
    entries: z
      .record(
        z.string(),
        z.object({
          completedAt: z.string(),
          times: z.number().int().positive(),
        }),
      )
      .catch({}),
  })
  .catch({ entries: {} })

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      entries: {},
      markCompleted: (id) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [id]: { completedAt: new Date().toISOString(), times: (s.entries[id]?.times ?? 0) + 1 },
          },
        })),
      isCompleted: (id) => Boolean(get().entries[id]),
    }),
    {
      name: 'maumlink.progress.v1',
      merge: (persisted, current) => ({ ...current, ...StoredProgress.parse(persisted) }),
    },
  ),
)
