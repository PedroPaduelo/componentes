// scripts/val-text-hover-effect.mjs
// Smoke test visual: confirma que o TextHoverEffect renderiza com data-slot
// correto, o SVG interno tem viewBox esperado, e os stops do gradiente
// aparecem no DOM.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

mkdirSync("shots", { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()

await page.goto("http://localhost:5173/components/text-hover-effect", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
})
await page.waitForTimeout(1500)

const info = await page.evaluate(() => {
  const wrap = document.querySelector('[data-slot="text-hover-effect"]')
  const svg = wrap?.querySelector("svg")
  const texts = Array.from(wrap?.querySelectorAll("text") ?? []).map((t) => ({
    content: t.textContent,
    stroke: t.getAttribute("stroke"),
    fill: t.getAttribute("fill"),
  }))
  const stops = Array.from(
    wrap?.querySelectorAll("linearGradient stop, radialGradient stop") ?? []
  ).map((s) => s.getAttribute("stop-color"))
  return {
    wrapPresent: !!wrap,
    wrapRect: wrap
      ? (() => {
          const r = wrap.getBoundingClientRect()
          return { w: Math.round(r.width), h: Math.round(r.height) }
        })()
      : null,
    svgViewBox: svg?.getAttribute("viewBox"),
    svgRole: svg?.getAttribute("role"),
    svgAriaLabel: svg?.getAttribute("aria-label"),
    textsCount: texts.length,
    texts,
    stopsCount: stops.length,
    stops,
  }
})

console.log(JSON.stringify(info, null, 2))
await page.screenshot({
  path: "shots/text-hover-effect-light.png",
  animations: "disabled",
  timeout: 15000,
})

// Hover: confirma que os 5 stops do gradiente signature aparecem
const wrap = page.locator('[data-slot="text-hover-effect"] svg').first()
await wrap.hover()
await page.waitForTimeout(300)
const hoverStops = await page.evaluate(() =>
  Array.from(
    document.querySelectorAll(
      '[data-slot="text-hover-effect"] linearGradient stop'
    )
  ).map((s) => s.getAttribute("stop-color"))
)
console.log("hoverStops:", JSON.stringify(hoverStops))
await page.screenshot({
  path: "shots/text-hover-effect-hover.png",
  animations: "disabled",
  timeout: 15000,
})

// Dark mode
await page.evaluate(() => localStorage.setItem("vitrine-theme", "dark"))
await page.reload({ waitUntil: "domcontentloaded" })
await page.waitForTimeout(1500)
await page.screenshot({
  path: "shots/text-hover-effect-dark.png",
  animations: "disabled",
  timeout: 15000,
})

await browser.close()
console.log("done")
