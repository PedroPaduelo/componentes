import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try { await page.goto("https://chanhdai.com/components/glow-card-grid", { waitUntil: "networkidle", timeout: 30000 }) } catch (e) { console.warn(e.message) }
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const card = document.querySelector('[data-slot="glow-card"]')
  if (!card) return { error: "no card" }
  // Find the inner glow div (first child with translate-x or pointer-events-none)
  const inner = card.querySelector('[class*="translate-x-"]') || card.querySelector('div[style*="--pointer"]')
  return {
    cardClass: card.className,
    innerClass: inner?.className,
    innerHTML: inner?.outerHTML?.slice(0, 400),
    cardChildrenTags: Array.from(card.children).map(c => ({
      tag: c.tagName,
      class: c.className?.toString().slice(0, 200),
      transform: getComputedStyle(c).transform,
    })),
  }
})
console.log(JSON.stringify(info, null, 2))
await page.close()
await browser.close()
