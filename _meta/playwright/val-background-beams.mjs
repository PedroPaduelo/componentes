import { chromium } from "playwright"

const URL = "http://localhost:5173/components/background-beams"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(1000)

const wrapCount = await page.locator("[data-slot=background-beams]").count()
const svgCount = await page.locator("[data-slot=background-beams] svg").count()
const pathCount = await page.locator("[data-slot=background-beams] svg path").count()
const gradCount = await page.locator("[data-slot=background-beams] svg linearGradient").count()

const snapshot = async () => {
  return page.evaluate(() => {
    const g = document.querySelector("[data-slot=background-beams] svg linearGradient")
    if (!g) return null
    return {
      x1: g.getAttribute("x1"),
      y1: g.getAttribute("y1"),
      x2: g.getAttribute("x2"),
      y2: g.getAttribute("y2"),
    }
  })
}

const frame1 = await snapshot()
await page.waitForTimeout(1500)
const frame2 = await snapshot()

const moved =
  JSON.stringify(frame1) !== JSON.stringify(frame2) &&
  frame1 !== null &&
  frame2 !== null

console.log(JSON.stringify({
  wrapCount, svgCount, pathCount, gradCount,
  frame1, frame2, moved,
}, null, 2))

const ok = wrapCount === 1 && svgCount === 1 && pathCount > 10 && gradCount > 10 && moved
console.log(ok ? "PASS ✓" : "FAIL ✗")
await browser.close()
process.exit(ok ? 0 : 1)
