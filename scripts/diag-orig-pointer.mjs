import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try { await page.goto("https://chanhdai.com/components/glow-card-grid", { waitUntil: "networkidle", timeout: 30000 }) } catch (e) { console.warn(e.message) }
await page.waitForTimeout(2500)

const info = await page.evaluate(() => {
  const card = document.querySelector('[data-slot="glow-card"]')
  const grid = card.parentElement
  return {
    gridTag: grid.tagName,
    gridClass: grid.className,
    gridPointerX: getComputedStyle(grid).getPropertyValue("--pointer-x"),
    cardPointerX: getComputedStyle(card).getPropertyValue("--pointer-x"),
    gridInlineStyle: grid.getAttribute("style"),
    cardInlineStyle: card.getAttribute("style"),
    // Check all cards
    allCards: Array.from(document.querySelectorAll('[data-slot="glow-card"]')).map(c => ({
      index: Array.from(c.parentElement.children).indexOf(c),
      pointerX: getComputedStyle(c).getPropertyValue("--pointer-x"),
      inlineStyle: c.getAttribute("style"),
    })),
  }
})
console.log(JSON.stringify(info, null, 2))
await page.close()
await browser.close()
