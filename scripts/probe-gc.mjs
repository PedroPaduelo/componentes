// Quick probe of chanhdai.com github-contributions page
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try {
  await page.goto("https://chanhdai.com/components/github-contributions", { waitUntil: "networkidle", timeout: 45000 })
} catch (e) { console.log('goto err:', e.message) }
await sleep(4000)

// Dump page body text around the preview
const probe = await page.evaluate(() => {
  // Find the preview iframe (chanhdai uses an iframe for the preview)
  const iframes = Array.from(document.querySelectorAll('iframe'))
  const iframeSrcs = iframes.map(f => f.src)

  // Find a region with "contributions" in text
  const allText = document.body.innerText
  const idx = allText.toLowerCase().indexOf('contributions')
  const snippet = idx >= 0 ? allText.slice(Math.max(0, idx - 50), idx + 200) : null

  // Look for rect/div with data-count
  const dataCountEls = document.querySelectorAll('[data-count]')
  const dataCountCount = dataCountEls.length

  // Look for SVG
  const svgs = document.querySelectorAll('svg')
  const svgCount = svgs.length

  // Get computed color of the first few cells
  const sampleCells = Array.from(dataCountEls).slice(0, 5).map(el => {
    const cs = getComputedStyle(el)
    return {
      tag: el.tagName.toLowerCase(),
      w: el.getBoundingClientRect().width,
      h: el.getBoundingClientRect().height,
      bg: cs.backgroundColor,
      fill: el.getAttribute('fill'),
      dataCount: el.getAttribute('data-count'),
      dataDate: el.getAttribute('data-date'),
      dataLevel: el.getAttribute('data-level'),
      title: el.getAttribute('title'),
    }
  })

  // Look for any element with "contribution" in class
  const contEls = document.querySelectorAll('[class*="ontribution"]')

  return { iframeSrcs, snippet, dataCountCount, svgCount, sampleCells, contElCount: contEls.length }
})

console.log(JSON.stringify(probe, null, 2))

// Now check vitrine structure
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page2 = await ctx2.newPage()
await page2.goto("http://localhost:5173/components/github-contributions", { waitUntil: "networkidle", timeout: 30000 })
await sleep(2000)

const vitrineProbe = await page2.evaluate(() => {
  const wrap = document.querySelector("[data-slot='github-contributions']")
  if (!wrap) return { error: 'no wrap' }

  // Find the first row of cells (the column with weekdays)
  const firstColumn = wrap.querySelector("div > div")  // first week column
  const cells = firstColumn ? Array.from(firstColumn.children) : []
  const cellInfo = cells.map(c => {
    const cs = getComputedStyle(c)
    return {
      tag: c.tagName.toLowerCase(),
      w: Math.round(c.getBoundingClientRect().width),
      h: Math.round(c.getBoundingClientRect().height),
      bg: cs.backgroundColor,
      className: c.className.slice(0, 100),
    }
  })

  // Count week columns
  const weekColumns = wrap.querySelectorAll(":scope > div > div > div").length
  const allWeeks = firstColumn ? firstColumn.parentElement.children.length : 0

  return { cellCountInFirstColumn: cells.length, cellInfo, allWeeks, weekColumns }
})

console.log('VITRINE:', JSON.stringify(vitrineProbe, null, 2))

await browser.close()
