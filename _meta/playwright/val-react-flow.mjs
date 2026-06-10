// Validador Playwright — react-flow (suite de diagramas @xyflow/react).
//
// Valida em LIGHT e DARK:
//  - [data-slot=react-flow] existe e tem altura > 0
//  - nodes (.react-flow__node) renderizados
//  - edges (.react-flow__edge) presentes
//  - Controls e MiniMap visíveis
//  - node usa cor de fundo do tema (computed bg ≈ var(--card))
//
// Uso: node _meta/playwright/val-react-flow.mjs   (com `npm run dev` no ar)

import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/components/react-flow"

async function inspect(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  await page.reload({ waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-slot=react-flow]", { timeout: 15000 })
  // espera o React Flow montar nós
  await page.waitForSelector(".react-flow__node", { timeout: 15000 })
  await page.waitForTimeout(1200)

  const data = await page.evaluate(() => {
    const wraps = Array.from(document.querySelectorAll("[data-slot=react-flow]"))
    const first = wraps[0]
    const rect = first?.getBoundingClientRect()
    const node = document.querySelector(".react-flow__node [data-slot=react-flow-node]")
      || document.querySelector(".react-flow__node")
    const nodeBg = node ? getComputedStyle(node).backgroundColor : null
    const edgePath = document.querySelector(".react-flow__edge-path")
    const edgeStroke = edgePath ? getComputedStyle(edgePath).stroke : null
    const ctrlBtn = document.querySelector(".react-flow__controls-button")
    const ctrlBg = ctrlBtn ? getComputedStyle(ctrlBtn).backgroundColor : null
    const ctrlColor = ctrlBtn ? getComputedStyle(ctrlBtn).color : null
    const bgDot =
      document.querySelector("circle.react-flow__background-pattern") ||
      document.querySelector(".react-flow__background circle") ||
      document.querySelector(".react-flow__background path.react-flow__background-pattern")
    const bgFill = bgDot ? getComputedStyle(bgDot).fill : null
    return {
      wrapperCount: wraps.length,
      firstHeight: rect ? Math.round(rect.height) : 0,
      nodes: document.querySelectorAll(".react-flow__node").length,
      edges: document.querySelectorAll(".react-flow__edge").length,
      controls: !!document.querySelector(".react-flow__controls"),
      minimap: !!document.querySelector(".react-flow__minimap"),
      nodeBg,
      edgeStroke,
      ctrlBg,
      ctrlColor,
      bgFill,
    }
  })

  await shot(page, `react-flow-${theme}`, { sub: "react-flow" })
  return data
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 } })
const page = await ctx.newPage()
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 })

const results = {}
for (const theme of ["light", "dark"]) {
  try {
    results[theme] = await inspect(page, theme)
  } catch (err) {
    results[theme] = { error: String(err && err.message ? err.message : err) }
  }
}

await browser.close()

const checks = []
for (const theme of ["light", "dark"]) {
  const r = results[theme] || {}
  checks.push([`[${theme}] wrapper presente`, r.wrapperCount >= 1])
  checks.push([`[${theme}] altura > 0`, r.firstHeight > 0])
  checks.push([`[${theme}] nodes renderizados`, r.nodes > 0])
  checks.push([`[${theme}] edges presentes`, r.edges > 0])
  checks.push([`[${theme}] controls visíveis`, r.controls === true])
  checks.push([`[${theme}] minimap visível`, r.minimap === true])
  checks.push([`[${theme}] node tem bg`, !!r.nodeBg && r.nodeBg !== "rgba(0, 0, 0, 0)"])
  checks.push([`[${theme}] edge stroke visível`, !!r.edgeStroke && r.edgeStroke !== "none" && r.edgeStroke !== "rgba(0, 0, 0, 0)"])
  checks.push([`[${theme}] controls button bg tematizado`, !!r.ctrlBg && r.ctrlBg !== "rgba(0, 0, 0, 0)"])
  checks.push([`[${theme}] controls button cor tematizada`, !!r.ctrlColor && r.ctrlColor !== "rgba(0, 0, 0, 0)"])
  // Background pattern dot deve seguir var(--border), não o default hardcoded
  // do React Flow (#91919a light / #777 dark).
  checks.push([
    `[${theme}] background dot tematizado (≠ default xyflow)`,
    !!r.bgFill && r.bgFill !== "rgb(145, 145, 154)" && r.bgFill !== "rgb(119, 119, 119)",
  ])
}

saveJSON("react-flow/inspect", results)
console.log(JSON.stringify(results, null, 2))
let pass = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`)
  if (ok) pass++
}
console.log(`\n${pass}/${checks.length} checks OK`)
process.exit(pass === checks.length ? 0 : 1)
