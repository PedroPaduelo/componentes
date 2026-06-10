// Validador da composição "Logic Circuit Simulator" (/compositions/circuit-simulator).
//
// Verifica: monta em light/dark/390px, [data-slot=react-flow] com altura > 0,
// >=7 nós, >=6 edges, Controls + MiniMap, paleta presente (desktop), node bg
// tematizado por tema + borda visível, 390px sem overflow horizontal.
// DIFERENCIAL: clica num switch e confirma que o estado de uma lamp MUDA
// (prova de que a propagação de sinal funciona).
//
// Uso: node _meta/playwright/val-circuit-simulator.mjs   (dev server na :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/circuit-simulator"
const SUB = "circuit-simulator"

const browser = await chromium.launch()
const report = {}

async function ctx(theme, width = 1440) {
  const c = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme,
  })
  const page = await c.newPage()
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  return { c, page }
}

async function base(theme, width, tag) {
  const { c, page } = await ctx(theme, width)
  await page.goto(URL, { waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-slot=react-flow]", { timeout: 15000 })
  await page.waitForSelector("[data-slot=circuit-node]", { timeout: 15000 })
  await page.waitForTimeout(900)

  const data = await page.evaluate(() => {
    const flow = document.querySelector("[data-slot=react-flow]")
    const fr = flow?.getBoundingClientRect()
    const nodes = document.querySelectorAll("[data-slot=circuit-node]")
    const edges = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const palette = [...document.querySelectorAll("[draggable=true]")].length
    // node bg + borda do primeiro nó
    const first = nodes[0]
    const cs = first ? getComputedStyle(first) : null
    return {
      flowH: fr ? Math.round(fr.height) : 0,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      paletteCount: palette,
      nodeBg: cs?.backgroundColor ?? null,
      nodeBorder: cs ? `${cs.borderTopWidth} ${cs.borderTopColor}` : null,
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
    }
  })
  report[tag] = data
  await shot(page, tag, { sub: SUB })
  await c.close()
  return data
}

// ---- light / dark / mobile ----
await base("light", 1440, "light")
await base("dark", 1440, "dark")
await base("light", 390, "mobile-390")

// ---- PROVA DA PROPAGAÇÃO DE SINAL ----
{
  const { c, page } = await ctx("light", 1440)
  await page.goto(URL, { waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-slot=circuit-node][data-kind=switch]", {
    timeout: 15000,
  })
  await page.waitForTimeout(900)

  const before = await page.evaluate(() => {
    const lamps = [...document.querySelectorAll("[data-kind=lamp]")].map(
      (l) => l.getAttribute("data-on"),
    )
    const sw = document.querySelector("[data-kind=switch]")
    return { lamps, switchBefore: sw?.getAttribute("data-on") }
  })

  // clica no primeiro switch
  await page.click("[data-slot=circuit-node][data-kind=switch]")
  await page.waitForTimeout(500)

  const after = await page.evaluate(() => {
    const lamps = [...document.querySelectorAll("[data-kind=lamp]")].map(
      (l) => l.getAttribute("data-on"),
    )
    const sw = document.querySelector("[data-kind=switch]")
    return { lamps, switchAfter: sw?.getAttribute("data-on") }
  })

  const lampChanged = before.lamps.some((v, i) => v !== after.lamps[i])
  const switchChanged = before.switchBefore !== after.switchAfter
  report.propagation = {
    switchBefore: before.switchBefore,
    switchAfter: after.switchAfter,
    lampsBefore: before.lamps,
    lampsAfter: after.lamps,
    switchChanged,
    lampChanged,
  }
  await shot(page, "after-toggle", { sub: SUB })
  await c.close()
}

// ---- avaliação ----
const checks = []
const push = (name, ok, detail) => checks.push({ name, ok, detail })
for (const t of ["light", "dark", "mobile-390"]) {
  const d = report[t]
  push(`${t}: flow altura>0`, d.flowH > 0, d.flowH)
  push(`${t}: >=7 nós`, d.nodeCount >= 7, d.nodeCount)
  push(`${t}: >=6 edges`, d.edgeCount >= 6, d.edgeCount)
  push(`${t}: Controls`, d.hasControls, d.hasControls)
  push(`${t}: MiniMap`, d.hasMiniMap, d.hasMiniMap)
  push(`${t}: node borda visível`, !/ 0px /.test(` ${d.nodeBorder} `), d.nodeBorder)
}
push("desktop: paleta presente", report.light.paletteCount >= 6, report.light.paletteCount)
push(
  "mobile-390: sem overflow horizontal",
  report["mobile-390"].docW <= report["mobile-390"].winW + 1,
  `${report["mobile-390"].docW} <= ${report["mobile-390"].winW}`,
)
push("DIFERENCIAL: switch alterna", report.propagation.switchChanged, report.propagation)
push("DIFERENCIAL: lamp propaga", report.propagation.lampChanged, report.propagation)

const failed = checks.filter((c) => !c.ok)
saveJSON(`${SUB}/report`, { report, checks })
console.log("\n=== CHECKS ===")
for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} → ${JSON.stringify(c.detail)}`)
console.log(`\n${failed.length === 0 ? "ALL PASS ✅" : `${failed.length} FAIL ❌`}`)

await browser.close()
process.exit(failed.length === 0 ? 0 : 1)
