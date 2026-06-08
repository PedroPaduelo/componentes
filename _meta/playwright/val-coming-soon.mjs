import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const BASE = "http://localhost:5199"
const URL = `${BASE}/compositions/coming-soon`

const browser = await chromium.launch()
const results = {}

for (const theme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const stars = q("[data-slot=stars-background]")
    const shooting = q("[data-slot=shooting-stars]")
    const colourful = q("[data-slot=colourful-text]")
    const animated = document.querySelectorAll("[data-slot=animated-number]")
    const vanish = q("form input")
    const h1 = q("h1")
    return {
      hasStars: !!stars,
      hasShooting: !!shooting,
      hasColourful: !!colourful,
      animatedCount: animated.length,
      hasVanishInput: !!vanish,
      h1Text: h1?.textContent?.trim() || null,
      h1Color: h1 ? getComputedStyle(h1).color : null,
    }
  })

  await shot(page, `coming-soon-${theme}`, { animations: "disabled", timeout: 15000 }).catch(() => {})
  results[theme] = { info, errors }
  await ctx.close()
}

saveJSON("coming-soon-report", results)
console.log(JSON.stringify(results, null, 2))
await browser.close()
