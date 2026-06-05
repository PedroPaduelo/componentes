import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try { await page.goto("https://chanhdai.com/components/glow-card-grid", { waitUntil: "networkidle", timeout: 30000 }) } catch (e) { console.warn(e.message) }
await page.waitForTimeout(2500)

const gridRect = await page.evaluate(() => {
  const card = document.querySelector('[data-slot="glow-card"]')
  const grid = card.parentElement
  const r = grid.getBoundingClientRect()
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
})

// Move to center of grid (which is on card 4, NOT card 0)
await page.mouse.move(gridRect.x + gridRect.w / 2, gridRect.y + gridRect.h / 2)
await page.waitForTimeout(500)

const info = await page.evaluate(() => {
  const card0 = document.querySelectorAll('[data-slot="glow-card"]')[0]
  const card4 = document.querySelectorAll('[data-slot="glow-card"]')[4]
  const grid = card0.parentElement
  return {
    gridPointerX: getComputedStyle(grid).getPropertyValue("--pointer-x"),
    card0PointerX: getComputedStyle(card0).getPropertyValue("--pointer-x"),
    card4PointerX: getComputedStyle(card4).getPropertyValue("--pointer-x"),
    gridStyle: grid.getAttribute("style"),
    card0Style: card0.getAttribute("style"),
    card4Style: card4.getAttribute("style"),
  }
})
console.log(JSON.stringify(info, null, 2))
await page.close()
await browser.close()
