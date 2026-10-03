import { expect, test } from '@playwright/test'
import { gotoHome, loadScenarios, openScenario, seedSettings } from './helpers'

// Regression: navigation used two rows on phones, leaving too little story space.
for (const viewport of [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
]) {
  test.describe(`lesson viewport ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport })
    for (const scenario of loadScenarios()) {
      test(`${scenario.id}: every story sentence fits above one-row navigation`, async ({
        page,
      }) => {
        await seedSettings(page)
        await gotoHome(page)
        await openScenario(page, scenario)
        await page.evaluate(() => document.fonts.ready)

        for (let sentence = 0; sentence <= scenario.situation.story.length; sentence++) {
          const back = await page.getByTestId('nav-back').boundingBox()
          const next = await page.getByTestId('nav-primary').boundingBox()
          expect(back).not.toBeNull()
          expect(next).not.toBeNull()
          expect(Math.abs(back!.y - next!.y)).toBeLessThanOrEqual(1)
          expect(next!.height).toBeGreaterThanOrEqual(64)
          expect(next!.y + next!.height).toBeLessThanOrEqual(viewport.height)
          const footer = await page.locator('.lesson-footer').boundingBox()
          expect(footer!.height).toBeLessThanOrEqual(82)
          const overflow = await page.getByRole('main').evaluate((el) => ({
            vertical: el.scrollHeight - el.clientHeight,
            horizontal: el.scrollWidth - el.clientWidth,
          }))
          expect(overflow.vertical, `sentence ${sentence}: vertical overflow`).toBeLessThanOrEqual(
            1,
          )
          expect(overflow.horizontal).toBeLessThanOrEqual(1)
          if (sentence < scenario.situation.story.length)
            await page.getByTestId('nav-primary').click()
        }
      })
    }
  })
}
