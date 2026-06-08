// Validador Playwright do Animated Modal (Aceternity UI) na vitrine.
// Critérios:
//  1. /components/animated-modal retorna 200 e renderiza [data-slot=animated-modal]
//  2. trigger (button) dentro do wrapper funciona e abre o body
//  3. body com [data-slot=animated-modal-body] aparece após click
//  4. body tem transform 3D aplicado (scale/rotateX/translateY inicial)
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots/animated-modal", { recursive: true })

const url = "http://localhost:5173/components/animated-modal"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

const results = []

async function inspect(theme) {
  const page = await ctx.newPage()
  if (theme === "dark") {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "dark"))
  } else {
    await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
  }
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(1500)

  // 1. existence: at least 2 [data-slot=animated-modal] (basic + form examples)
  const slots = await page.locator('[data-slot="animated-modal"]').count()

  // 2. triggers dentro do wrapper
  const triggers = await page
    .locator('[data-slot="animated-modal"] button')
    .count()

  // 3. click no primeiro trigger e checa se body aparece
  let bodyCount = 0
  let bodyRect = null
  let bodyTransform = null
  if (slots > 0) {
    const firstTrigger = page
      .locator('[data-slot="animated-modal"] button')
      .first()
    if ((await firstTrigger.count()) > 0) {
      await firstTrigger.click()
      await page.waitForTimeout(800)
      bodyCount = await page.locator('[data-slot="animated-modal-body"]').count()
      if (bodyCount > 0) {
        const body = page.locator('[data-slot="animated-modal-body"]').first()
        bodyRect = await body.boundingBox()
        bodyTransform = await body.evaluate((el) =>
          getComputedStyle(el).transform,
        )
      }
    }
  }

  await page.screenshot({
    path: `shots/animated-modal/${theme}.png`,
    fullPage: false,
  })

  results.push({
    theme,
    slots,
    triggers,
    bodyCount,
    bodyRect,
    bodyTransform,
  })
  await page.close()
}

await inspect("light")
await inspect("dark")

console.log(JSON.stringify(results, null, 2))
await browser.close()
