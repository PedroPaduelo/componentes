import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/work-experience-component", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(2500)

const result = await page.evaluate(() => {
  // 1) Logo <img> with clearbit URL
  const logoImgs = Array.from(document.querySelectorAll('img[src*="logo.clearbit.com"]'))
  // 2) <ul> with list-disc class (bullets)
  const ulListDisc = Array.from(document.querySelectorAll('ul.list-disc'))
  const liCount = Array.from(document.querySelectorAll('ul.list-disc > li')).length
  // 3) Stats grid (grid-cols-2 sm:grid-cols-4)
  const statsGrids = Array.from(document.querySelectorAll('[class*="grid-cols-2"][class*="sm:grid-cols-4"]'))
  const statsCardCount = statsGrids.length
  const statsLabels = []
  statsGrids.forEach((g) => {
    const labels = g.querySelectorAll('div')
    labels.forEach((l) => {
      const txt = l.textContent?.trim() || ""
      // stats labels are 10px
      if (l.className && l.className.includes("text-[10px]")) {
        statsLabels.push(txt)
      }
    })
  })
  return {
    logoCount: logoImgs.length,
    logoSrcs: logoImgs.map((i) => i.src),
    ulListDiscCount: ulListDisc.length,
    liCount,
    statsCardCount,
    statsLabels,
  }
})
console.log(JSON.stringify(result, null, 2))
await browser.close()
