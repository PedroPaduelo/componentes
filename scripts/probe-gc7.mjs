// Why is gap 11? Check actual positions of consecutive rects
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/github-contributions", { waitUntil: "networkidle", timeout: 45000 })
await sleep(4000)

const probe = await page.evaluate(() => {
  const svg = document.querySelector('svg.block.overflow-visible')
  if (!svg) return { error: 'no svg' }
  const rects = Array.from(svg.querySelectorAll('rect[data-count]'))
  // First 14 rects (2 weeks of 7 days)
  const info = rects.slice(0, 14).map((r, i) => {
    const b = r.getBoundingClientRect()
    return {
      i,
      x: Math.round(b.x * 100) / 100,
      y: Math.round(b.y * 100) / 100,
      w: Math.round(b.width * 100) / 100,
      h: Math.round(b.height * 100) / 100,
      right: Math.round((b.x + b.width) * 100) / 100,
    }
  })
  return { info }
})

console.log(JSON.stringify(probe, null, 2))
await browser.close()
