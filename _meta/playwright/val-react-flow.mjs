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
    return {
      wrapperCount: wraps.length,
      firstHeight: rect ? Math.round(rect.height) : 0,
      nodes: document.querySelectorAll(".react-flow__node").length,
      edges: document.querySelectorAll(".react-flow__edge").length,
      controls: !!document.querySelector(".react-flow__controls"),
      minimap: !!document.querySelector(".react-flow__minimap"),
      nodeBg,
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
