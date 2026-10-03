import { expect, test } from '@playwright/test'
import { gotoHome, loadScenarios, seedSettings } from './helpers'
import { VIEWPORTS } from './viewports'

for (const vp of VIEWPORTS) {
  for (const textSize of ['normal', 'large'] as const) {
    test.describe(`home cover ${vp.name} ${textSize}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } })
      test('each image fills the left side, including cards with completion badges', async ({
        page,
      }) => {
        await seedSettings(page, { textSize })
        await page.addInitScript(
          (ids) => {
            const entries = Object.fromEntries(
              ids.map((id) => [id, { times: 1, completedAt: '2026-10-03T00:00:00.000Z' }]),
            )
            localStorage.setItem(
              'maumlink.progress.v1',
              JSON.stringify({ state: { entries }, version: 0 }),
            )
          },
          loadScenarios().map((s) => s.id),
        )
        await gotoHome(page)
        await page.mouse.move(0, 0)
        await page.evaluate(() => document.fonts.ready)
        const cards = page.locator('.domain-card:not(:disabled)')
        await expect(cards).toHaveCount(4)
        for (const card of await cards.all()) {
          await card.scrollIntoViewIfNeeded()
          await expect(card.locator('.domain-completed')).toBeVisible()
          const cover = card.locator('.domain-card-cover')
          const image = cover.locator(':scope > img')
          await expect(image).toBeVisible()
          await expect
            .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
            .toBeGreaterThan(0)
          const c = (await card.boundingBox())!
          const frame = (await cover.boundingBox())!
          const img = (await image.boundingBox())!
          const border = await card.evaluate((el) =>
            parseFloat(getComputedStyle(el).borderTopWidth),
          )
          expect(Math.abs(frame.y - c.y - border)).toBeLessThanOrEqual(1)
          expect(Math.abs(frame.y + frame.height - (c.y + c.height - border))).toBeLessThanOrEqual(
            1,
          )
          for (const key of ['x', 'y', 'width', 'height'] as const)
            expect(
              Math.abs(img[key] - frame[key]),
              `${vp.name}/${textSize}: image ${key}`,
            ).toBeLessThanOrEqual(1)
          await expect(image).toHaveCSS('object-fit', 'cover')
        }
      })
    })
  }
}
