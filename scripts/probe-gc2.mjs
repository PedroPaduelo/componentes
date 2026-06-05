// Probe chanhdai.com — find the GitHub Contributions specific graph
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/github-contributions", { waitUntil: "networkidle", timeout: 45000 })
await sleep(3000)

// Find the GitHub Contributions preview specifically
const probe = await page.evaluate(() => {
  // Find an element with text "GitHub Contributions" then look for nearest preview
  const allText = Array.from(document.querySelectorAll('h1, h2, h3, h4, [class*="title"]'))
  const ghTitle = allText.find(el => el.textContent && el.textContent.trim() === 'GitHub Contributions')
  if (!ghTitle) return { error: 'no GitHub Contributions title' }

  // Walk up to find the section, then look for the preview container
  let cur = ghTitle
  for (let i = 0; i < 10; i++) {
    if (!cur.parentElement) break
    cur = cur.parentElement
    if (cur.querySelector('rect[data-count]')) break
  }

  // Look for the rects within this section
  const rects = cur.querySelectorAll('rect[data-count]')
  const first5 = Array.from(rects).slice(0, 5).map(r => {
    const cs = getComputedStyle(r)
    return {
      w: r.getBoundingClientRect().width,
      h: r.getBoundingClientRect().height,
      fill: r.getAttribute('fill'),
      dataCount: r.getAttribute('data-count'),
      dataDate: r.getAttribute('data-date'),
      dataLevel: r.getAttribute('data-level'),
      title: r.getAttribute('title'),
    }
  })

  // Find the parent svg to get total rect count in this section
  const svg = cur.querySelector('svg')
  const svgRectCount = svg ? svg.querySelectorAll('rect').length : 0

  // Cell positions to compute gap
  const positions = []
  if (svg) {
    const svgRects = Array.from(svg.querySelectorAll('rect[data-count]'))
    if (svgRects.length >= 2) {
      const r0 = svgRects[0].getBoundingClientRect()
      const r1 = svgRects[1].getBoundingClientRect()
      positions.push({ dx: Math.abs(r1.x - r0.x), w: r0.width, h: r0.height })
    }
    // gap horizontal (between cells in same column = different week)
    if (svgRects.length >= 8) {
      const r0 = svgRects[0].getBoundingClientRect()
      const r7 = svgRects[7].getBoundingClientRect()
      positions.push({ sameColumn: r0.x === r7.x, dy: Math.abs(r7.y - r0.y) })
    }
  }

  // Tooltip trigger pattern — chanhdai uses Radix Tooltip
  const tooltips = cur.querySelectorAll('[class*="tooltip"]')
  const tooltipCount = tooltips.length

  return {
    totalRectsInSection: rects.length,
    first5,
    svgRectCount,
    positions,
    tooltipCount,
    sectionRect: (() => { const r = cur.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
  }
})

console.log(JSON.stringify(probe, null, 2))

await browser.close()
