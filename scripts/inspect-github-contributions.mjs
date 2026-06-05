import { chromium } from "playwright"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function inspect(url, label) {
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(2000)
  const info = await page.evaluate(() => {
    const wrap = document.querySelector("[data-slot=github-contributions]")
    const cells = wrap ? wrap.querySelectorAll("[data-slot=tooltip-trigger]") : []
    const rects = wrap ? wrap.querySelectorAll("div[class*='rounded-sm']") : []
    return {
      exists: !!wrap,
      rect: wrap && (() => { const r = wrap.getBoundingClientRect(); return { w: r.width, h: r.height } })(),
      cellCount: rects.length,
      sampleCells: Array.from(rects).slice(0, 5).map((el) => ({
        size: `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`,
        bg: getComputedStyle(el).backgroundColor,
      })),
    }
  })
  console.log(`[${label}]`, JSON.stringify(info, null, 2))
  await page.close()
}

await inspect("http://localhost:5173/components/github-contributions", "VITRINE-LIGHT")
await browser.close()
