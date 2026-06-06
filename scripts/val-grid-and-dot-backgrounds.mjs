// scripts/val-grid-and-dot-backgrounds.mjs
// Inspeção visual/estrutural do componente grid-and-dot-backgrounds na vitrine.
import { chromium } from "playwright"

const URL = "http://localhost:5173/components/grid-and-dot-backgrounds"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`)
})

try {
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })
  await page.waitForTimeout(1500)
} catch (e) {
  console.warn(`warn: ${e.message}`)
}

const result = await page.evaluate(() => {
  const wrappers = Array.from(
    document.querySelectorAll('[data-slot="grid-and-dot-backgrounds"]'),
  )
  return wrappers.map((w) => {
    const r = w.getBoundingClientRect()
    const cs = getComputedStyle(w)
    const inner = w.querySelector('[aria-hidden="true"]')
    const innerCs = inner ? getComputedStyle(inner) : null
    return {
      variant: w.getAttribute("data-variant"),
      rect: { w: Math.round(r.width), h: Math.round(r.height) },
      bgColor: cs.backgroundColor,
      pattern: innerCs
        ? {
            bgImage: innerCs.backgroundImage.slice(0, 80),
            bgSize: innerCs.backgroundSize,
            maskImage: innerCs.maskImage.slice(0, 60),
          }
        : null,
      heading: w.querySelector("h2")?.textContent?.trim() ?? null,
    }
  })
})

console.log(JSON.stringify({ count: result.length, items: result, errors }, null, 2))
await browser.close()
