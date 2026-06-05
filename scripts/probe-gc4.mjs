// Find SVGs that contain data-count rects
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/github-contributions", { waitUntil: "networkidle", timeout: 45000 })
await sleep(4000)

const probe = await page.evaluate(() => {
  const svgs = Array.from(document.querySelectorAll('svg'))
  const result = []
  for (const svg of svgs) {
    const rects = svg.querySelectorAll('rect[data-count]')
    if (rects.length > 0) {
      const r = svg.getBoundingClientRect()
      result.push({
        rectCount: rects.length,
        viewBox: svg.getAttribute('viewBox'),
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        firstRect: rects[0] ? {
          w: rects[0].getBoundingClientRect().width,
          h: rects[0].getBoundingClientRect().height,
          dataCount: rects[0].getAttribute('data-count'),
          dataLevel: rects[0].getAttribute('data-level'),
        } : null,
        classes: String(svg.getAttribute('class') || '').slice(0, 100),
      })
    }
  }
  // Sort by rectCount
  return result.sort((a, b) => b.rectCount - a.rectCount)
})

console.log(JSON.stringify(probe, null, 2))
await browser.close()
