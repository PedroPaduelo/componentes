import { chromium } from "playwright"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
try { await page.goto("https://chanhdai.com/components/glow-card-grid", { waitUntil: "networkidle", timeout: 30000 }) } catch (e) { console.warn(e.message) }
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  // Find the parent of all glow-card elements
  const cards = document.querySelectorAll('[data-slot="glow-card"]')
  if (cards.length === 0) return { error: "no cards" }
  const parent = cards[0].parentElement
  const parentInfo = parent ? {
    tag: parent.tagName,
    className: parent.className?.toString().slice(0, 300),
    rect: (() => { const r = parent.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })(),
    computed: {
      display: getComputedStyle(parent).display,
      gridTemplateColumns: getComputedStyle(parent).gridTemplateColumns,
      gap: getComputedStyle(parent).gap,
    },
    childrenCount: parent.children.length,
    childTags: Array.from(parent.children).slice(0, 12).map(c => c.tagName + (c.getAttribute('data-slot') ? `[${c.getAttribute('data-slot')}]` : '')),
  } : null

  // find the actual visible card group (the one that wraps the cards, not doc-content-col)
  let cur = cards[0].parentElement
  const ancestors = []
  while (cur && ancestors.length < 5) {
    ancestors.push({
      tag: cur.tagName,
      className: cur.className?.toString().slice(0, 150),
      rect: (() => { const r = cur.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })(),
      display: getComputedStyle(cur).display,
      gridTemplateColumns: getComputedStyle(cur).gridTemplateColumns,
    })
    cur = cur.parentElement
  }

  return {
    cardCount: cards.length,
    parent: parentInfo,
    ancestors,
    firstCardRect: (() => { const r = cards[0].getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })(),
    firstCardComputed: {
      gridColumn: getComputedStyle(cards[0]).gridColumn,
      gridRow: getComputedStyle(cards[0]).gridRow,
      width: getComputedStyle(cards[0]).width,
      height: getComputedStyle(cards[0]).height,
    },
  }
})
console.log(JSON.stringify(info, null, 2))
await page.close()
await browser.close()
