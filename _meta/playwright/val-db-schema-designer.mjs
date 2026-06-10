// Validador da composição db-schema-designer (diagrama ER com React Flow).
// Mede montagem, nós-tabela/edges (relações), controls/minimap, lista+inspetor,
// cor/borda do table node por tema e ausência de overflow horizontal em 390px.
// Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-db-schema-designer.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/db-schema-designer"
const report = { light: {}, dark: {}, responsive: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='db-schema-designer']")
    const flow = document.querySelector("[data-slot='react-flow']")
    const nodeEls = document.querySelectorAll(".react-flow__node")
    const edgeEls = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const list = Array.from(document.querySelectorAll("aside")).find((a) =>
      a.textContent?.includes("Tabelas"),
    )
    const inspector = Array.from(document.querySelectorAll("aside")).find((a) =>
      a.textContent?.includes("Inspetor"),
    )
    const firstNode = document.querySelector("[data-slot='table-node']")
    const cssCard = getComputedStyle(document.documentElement)
      .getPropertyValue("--card")
      .trim()
    const flowRect = flow?.getBoundingClientRect()
    const s = firstNode ? getComputedStyle(firstNode) : null
    return {
      hasRoot: !!root,
      flowHeight: flowRect ? Math.round(flowRect.height) : 0,
      nodes: nodeEls.length,
      edges: edgeEls.length,
      columns: document.querySelectorAll("[data-slot='table-column']").length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      hasList: !!list,
      hasInspector: !!inspector,
      nodeBg: s ? s.backgroundColor : null,
      nodeBorder: s ? { w: s.borderTopWidth, c: s.borderTopColor } : null,
      cssCard,
    }
  })
}

async function run() {
  const browser = await chromium.launch()
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      await setTheme(page, theme)
      await page.goto(URL, { waitUntil: "domcontentloaded" })
      await page.waitForSelector(".react-flow__node", { timeout: 15000 })
      await page.waitForTimeout(1200)
      report[theme] = await inspect(page)
      await shot(page, `db-schema-designer-${theme}`, { sub: "db-schema-designer" })
      await page.screenshot({
        path: `/workspace/_meta/scratch/shots/db-schema-designer/full-${theme}.png`,
        animations: "disabled",
      })
      await page.close()
    }

    // Responsivo 390px (light)
    const mob = await browser.newPage({ viewport: { width: 390, height: 780 } })
    await setTheme(mob, "light")
    await mob.goto(URL, { waitUntil: "domcontentloaded" })
    await mob.waitForSelector(".react-flow__node", { timeout: 15000 })
    await mob.waitForTimeout(1000)
    const overflow = await mob.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    report.responsive = {
      ...overflow,
      noHorizontalOverflow: overflow.scrollW <= overflow.clientW + 1,
    }
    await mob.screenshot({
      path: "/workspace/_meta/scratch/shots/db-schema-designer/mobile-390.png",
      animations: "disabled",
    })
    await mob.close()
  } finally {
    await browser.close()
  }

  saveJSON("db-schema-designer/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] monta + flow altura>0`, r.hasRoot && r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] >=4 tabelas`, r.nodes >= 4, r.nodes)
    push(`[${theme}] >=3 relações`, r.edges >= 3, r.edges)
    push(`[${theme}] colunas renderizadas`, r.columns >= 10, r.columns)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] lista + inspetor`, r.hasList && r.hasInspector, `${r.hasList}/${r.hasInspector}`)
    push(`[${theme}] table node bg presente`, !!r.nodeBg, r.nodeBg)
    push(
      `[${theme}] node borda visível`,
      !!r.nodeBorder && parseFloat(r.nodeBorder.w) > 0,
      r.nodeBorder ? `${r.nodeBorder.w} ${r.nodeBorder.c}` : "n/a",
    )
  }
  push(
    "390px sem overflow horizontal",
    report.responsive.noHorizontalOverflow,
    `${report.responsive.scrollW}/${report.responsive.clientW}`,
  )

  console.log("\n=== RESULTADO ===")
  for (const c of checks) {
    console.log(`${c.ok ? "✓" : "✗"} ${c.name} (${c.detail})`)
  }
  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
  console.log("nodeBg light:", report.light.nodeBg, "| dark:", report.dark.nodeBg)
  if (failed.length > 0) process.exitCode = 1
}

run()
