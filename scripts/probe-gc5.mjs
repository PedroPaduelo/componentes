// Probe vitrine structure
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("http://localhost:5173/components/github-contributions", { waitUntil: "networkidle", timeout: 30000 })
await sleep(2000)

const probe = await page.evaluate(() => {
  const wrap = document.querySelector("[data-slot='github-contributions']")
  if (!wrap) return { error: 'no wrap' }
  // Levels of nesting
  const children = Array.from(wrap.children)
  const levels = []
  let cur = wrap
  for (let i = 0; i < 4; i++) {
    const c = Array.from(cur.children)
    levels.push({
      tag: cur.tagName,
      childCount: c.length,
      firstChildTag: c[0]?.tagName,
      firstChildClass: c[0] ? String(c[0].className || '').slice(0, 100) : null,
    })
    if (c.length === 0 || !c[0]) break
    cur = c[0]
  }

  // Get the inner flex container of weeks
  const weeksContainer = wrap.querySelector(":scope > div")  // <div class="flex items-end gap-px overflow-x-auto">
  const weekColumns = weeksContainer ? Array.from(weeksContainer.children) : []
  const firstWeek = weekColumns[0]
  const firstWeekChildren = firstWeek ? Array.from(firstWeek.children) : []

  return {
    levels,
    weeksContainerChildCount: weekColumns.length,
    firstWeekClass: firstWeek ? String(firstWeek.className || '').slice(0, 100) : null,
    firstWeekRect: firstWeek ? (() => { const r = firstWeek.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })() : null,
    firstWeekChildCount: firstWeekChildren.length,
    firstWeekChild: firstWeekChildren[0] ? {
      tag: firstWeekChildren[0].tagName,
      class: String(firstWeekChildren[0].className || '').slice(0, 100),
      rect: (() => { const r = firstWeekChildren[0].getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })(),
    } : null,
    // how many populated cells
    populatedCellCount: wrap.querySelectorAll("div.rounded-sm.cursor-pointer").length,
  }
})

console.log(JSON.stringify(probe, null, 2))
await browser.close()
