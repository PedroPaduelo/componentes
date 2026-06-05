// Final probe of chanhdai's GitHub Contributions
import { chromium } from "playwright"
import { setTimeout as sleep } from "node:timers/promises"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto("https://chanhdai.com/components/github-contributions", { waitUntil: "networkidle", timeout: 45000 })
await sleep(4000)

const probe = await page.evaluate(() => {
  const getClass = (el) => {
    if (!el) return ''
    if (typeof el.className === 'string') return el.className
    if (el.className && el.className.baseVal !== undefined) return el.className.baseVal
    return ''
  }

  const rects = Array.from(document.querySelectorAll('rect[data-count]'))
  const parentCounts = new Map()
  for (const r of rects) {
    const p = r.parentElement
    const key = p ? p.tagName + '::' + getClass(p).slice(0, 80) : 'orphan'
    parentCounts.set(key, (parentCounts.get(key) || 0) + 1)
  }
  const sorted = Array.from(parentCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Pick a rect from the biggest cluster
  const biggest = sorted[0]
  let sample = null
  if (biggest) {
    const targetRect = rects.find(r => {
      const p = r.parentElement
      const key = p ? p.tagName + '::' + getClass(p).slice(0, 80) : 'orphan'
      return key === biggest[0]
    })
    if (targetRect) {
      const cs = getComputedStyle(targetRect)
      const parent = targetRect.parentElement
      const pcs = parent ? getComputedStyle(parent) : null
      sample = {
        rectBg: cs.backgroundColor,
        rectFill: targetRect.getAttribute('fill'),
        rectClass: getClass(targetRect),
        parentClass: parent ? getClass(parent).slice(0, 200) : null,
        parentDisplay: pcs ? pcs.display : null,
        parentGap: pcs ? pcs.gap : null,
        parentGrid: pcs ? pcs.gridTemplateColumns : null,
        dataLevel: targetRect.getAttribute('data-level'),
        dataCount: targetRect.getAttribute('data-count'),
      }
    }
  }

  return { parentCounts: sorted, sample, totalRects: rects.length }
})

console.log(JSON.stringify(probe, null, 2))
await browser.close()
