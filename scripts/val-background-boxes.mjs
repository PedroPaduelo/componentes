import { chromium } from "playwright"

const URL = "http://localhost:5173/components/background-boxes"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const t0 = Date.now()
await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 })
const loadMs = Date.now() - t0
await page.waitForTimeout(1000)

const info = await page.evaluate(() => {
  const root = document.querySelector("[data-slot=background-boxes]")
  if (!root) return { found: false }
  // células = motion.div folha (com border-t border-r); contamos descendentes
  const cells = root.querySelectorAll("div.border-t.border-r")
  const rowsContainers = root.querySelectorAll(":scope > div")
  const pluses = root.querySelectorAll("svg")
  return {
    found: true,
    rows: rowsContainers.length,
    cells: cells.length,
    pluses: pluses.length,
    rootRect: (() => {
      const r = root.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })(),
  }
})

// Testa hover: dispara pointerenter/mouseover na célula (a perspectiva tira
// a célula do viewport, então usamos eventos sintéticos que disparam o
// whileHover do motion sem depender de coordenadas).
let hoverResult = { before: null, after: null, changed: false }
if (info.found && info.cells > 0) {
  const cell = page.locator("[data-slot=background-boxes] div.border-t.border-r").nth(200)
  const before = await cell.evaluate((el) => getComputedStyle(el).backgroundColor)
  await cell.evaluate((el) => {
    for (const type of ["pointerenter", "pointerover", "mouseenter", "mouseover"]) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true }))
    }
  })
  await page.waitForTimeout(400)
  const after = await cell.evaluate((el) => getComputedStyle(el).backgroundColor)
  hoverResult = { before, after, changed: before !== after }
}

console.log(JSON.stringify({ loadMs, ...info, hover: hoverResult }, null, 2))

const ok =
  info.found &&
  info.cells > 100 &&
  info.rows > 10 &&
  hoverResult.changed &&
  loadMs < 15000
console.log(ok ? "RESULT: PASS" : "RESULT: FAIL")
await browser.close()
process.exit(ok ? 0 : 1)
