/**
 * Responsive suite — PRD D16 / §12. Full happy path of every scenario at every viewport,
 * both text sizes, asserting FR-RES-01…04 on every screen; rotation persistence (FR-RES-05);
 * visual-regression snapshots per screen per viewport (Chromium, normal text size).
 */
import { expect, test } from '@playwright/test'
import {
  assertResponsive,
  gotoHome,
  loadScenarios,
  openScenario,
  playLesson,
  seedSettings,
  settleViewport,
} from './helpers'
import { VIEWPORTS, byName } from './viewports'

const scenarios = loadScenarios()
const TEXT_SIZES = ['normal', 'large'] as const

test.describe.configure({ mode: 'parallel' })

for (const vp of VIEWPORTS) {
  test.describe(`viewport ${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    for (const textSize of TEXT_SIZES) {
      for (const scenario of scenarios) {
        test(`${scenario.id} · text=${textSize}`, async ({ page, browserName }) => {
          await seedSettings(page, { textSize })
          await gotoHome(page)
          await assertResponsive(page, `${vp.name}/home`)
          const snap =
            browserName === 'chromium' && textSize === 'normal' && scenario === scenarios[0]
          if (snap)
            await expect(page).toHaveScreenshot(`${vp.name}-home.png`, { animations: 'disabled' })
          await openScenario(page, scenario)
          await playLesson(page, scenario, {
            tellMore: true,
            onScreen: async (screen) => {
              await assertResponsive(page, `${vp.name}/${scenario.id}/${screen}/${textSize}`)
              if (
                snap &&
                ['situation-key', 'feeling', 'step3', 'action', 'feedback', 'wrapup'].includes(
                  screen,
                )
              ) {
                await expect(page).toHaveScreenshot(`${vp.name}-${screen}.png`, {
                  animations: 'disabled',
                })
              }
            },
          })
        })
      }
    }
  })
}

test.describe('orientation change keeps state (FR-RES-05)', () => {
  const portrait = byName('tablet-portrait')
  const landscape = byName('tablet-landscape')
  test.use({ viewport: { width: portrait.width, height: portrait.height } })

  test('rotate on S2 with a selection and the hint open', async ({ page }) => {
    const scenario = scenarios[0]!
    await seedSettings(page)
    await gotoHome(page)
    await openScenario(page, scenario)
    for (let i = 0; i < scenario.situation.story.length + 1; i++)
      await page.getByTestId('nav-primary').click()
    const feeling = scenario.feeling.options[0]!
    await page.locator(`[data-emotion="${feeling}"]`).click()
    await page.getByTestId('nav-help').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.setViewportSize({ width: landscape.width, height: landscape.height })
    await settleViewport(page)
    await expect(page.getByRole('dialog')).toBeVisible()
    await assertResponsive(page, 'rotated-landscape/hint')
    await page.getByRole('button', { name: '닫기' }).click()
    await expect(page.locator(`[data-emotion="${feeling}"]`)).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await assertResponsive(page, 'rotated-landscape/feeling')

    await page.setViewportSize({ width: portrait.width, height: portrait.height })
    await settleViewport(page)
    await expect(page.locator(`[data-emotion="${feeling}"]`)).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await assertResponsive(page, 'rotated-portrait/feeling')
    await page.getByTestId('nav-primary').click()
    await expect(page.getByTestId('nav-more')).toBeVisible()
  })
})
