import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

// Light
await page.goto("http://localhost:5173/components/theme-toggle-effect", { waitUntil: "networkidle" })
await page.waitForTimeout(800)
const hasBtnLight = await page.locator("button:has([class*='lucide-moon']), button:has([class*='lucide-sun'])").count()
const htmlClassLight = await page.evaluate(() => document.documentElement.className)
const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
console.log(`[LIGHT] html.class="${htmlClassLight}", bg=${bgLight}, toggleButtons=${hasBtnLight}`)
await page.screenshot({ path: "shots/theme-toggle-effect-light.png" })

// Clica e checa
const btn = page.locator("button[aria-label*='heme'], button[data-slot='theme-toggle-effect']").first()
const exists = await btn.count()
console.log(`toggle button found by aria/data-slot: ${exists}`)
if (exists) {
  await btn.click()
  await page.waitForTimeout(700)
  const htmlClassAfter = await page.evaluate(() => document.documentElement.className)
  const bgAfter = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  console.log(`[AFTER CLICK] html.class="${htmlClassAfter}", bg=${bgAfter}`)
  await page.screenshot({ path: "shots/theme-toggle-effect-after-click.png" })
}

await browser.close()
console.log("done")
