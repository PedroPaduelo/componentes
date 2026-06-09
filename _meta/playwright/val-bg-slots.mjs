import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await ctx.newPage()
await page.addInitScript(() => localStorage.setItem("vitrine-theme", "light"))
await page.goto("http://localhost:5173/compositions/backgrounds-showcase", { waitUntil: "domcontentloaded", timeout: 30000 })
await page.waitForTimeout(2500)

const info = await page.evaluate(() => {
  const slots = ["sparkles","vortex","background-beams","background-lines","dot-grid-spotlight","perspective-grid","mask-container","background-ripple-effect"]
  const found = {}
  for (const s of slots) found[s] = document.querySelectorAll(`[data-slot=${s}]`).length
  // counts approximate; some don't have data-slot. Count cards + headings
  const cards = document.querySelectorAll("article").length
  const h3 = Array.from(document.querySelectorAll("article h3")).map(e => e.textContent.trim())
  // adaptive label legibility: pick the Dot Grid label + Ripple label color in light
  const labels = Array.from(document.querySelectorAll("article h3, article p, [class*='text-foreground']")).slice(0,0)
  return { slotCounts: found, cardCount: cards, cardTitles: h3 }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
