// Validador da composição data-pipeline (source → transform → chart, React Flow).
// Mede montagem, nós/edges, controls/minimap, paleta+inspector (desktop), o
// chart node com barras, bg/borda do nó por tema, ausência de overflow em 390px
// e a PROVA DO DIFERENCIAL: alterar o valor do filtro recalcula o pipeline e
// muda o nº de barras do gráfico (resultado ao vivo). Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-data-pipeline.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/data-pipeline"
const report = { light: {}, dark: {}, responsive: {}, reactivity: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='data-pipeline']")
    const flow = document.querySelector("[data-slot='react-flow']")
    const nodeEls = document.querySelectorAll(".react-flow__node")
    const edgeEls = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const palette = document.querySelector(
      "[data-slot='data-pipeline'] aside",
    )
    const chartNode = document.querySelector("[data-kind='chart']")
    const bars = document.querySelectorAll("[data-slot='data-pipeline-bar']")
    const someNode = document.querySelector("[data-slot='data-pipeline-node']")
    const flowRect = flow?.getBoundingClientRect()
    const cs = (el) => (el ? getComputedStyle(el) : null)
    const ns = cs(someNode)
    return {
      hasRoot: !!root,
      flowHeight: flowRect ? Math.round(flowRect.height) : 0,
      nodes: nodeEls.length,
      edges: edgeEls.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      hasPalette: !!palette,
      hasChartNode: !!chartNode,
      bars: bars.length,
      nodeBg: ns ? ns.backgroundColor : null,
      nodeBorderW: ns ? ns.borderTopWidth : null,
      nodeBorderC: ns ? ns.borderTopColor : null,
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
      await page.waitForTimeout(1000)
      report[theme] = await inspect(page)
      await shot(page, `data-pipeline-${theme}`, { sub: "data-pipeline" })
      await page.screenshot({
        path: `/workspace/_meta/scratch/shots/data-pipeline/full-${theme}.png`,
        animations: "disabled",
      })
      await page.close()
    }

    // Responsivo 390px (light)
    const mob = await browser.newPage({ viewport: { width: 390, height: 780 } })
    await setTheme(mob, "light")
    await mob.goto(URL, { waitUntil: "domcontentloaded" })
    await mob.waitForSelector(".react-flow__node", { timeout: 15000 })
    await mob.waitForTimeout(900)
    const overflow = await mob.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    report.responsive = {
      ...overflow,
      noHorizontalOverflow: overflow.scrollW <= overflow.clientW + 1,
    }
    await mob.screenshot({
      path: "/workspace/_meta/scratch/shots/data-pipeline/mobile-390.png",
      animations: "disabled",
    })
    await mob.close()

    // PROVA DO DIFERENCIAL: mudar o valor do filtro recalcula -> muda nº de barras.
    const rx = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await setTheme(rx, "light")
    await rx.goto(URL, { waitUntil: "domcontentloaded" })
    await rx.waitForSelector(".react-flow__node", { timeout: 15000 })
    await rx.waitForTimeout(900)
    const barsBefore = await rx.evaluate(
      () => document.querySelectorAll("[data-slot='data-pipeline-bar']").length,
    )
    // seleciona o bloco de filtro
    await rx.click("[data-kind='filter']")
    await rx.waitForTimeout(400)
    // muda o valor para 500000 (filtra quase tudo -> menos regiões no grupo)
    const input = rx.locator("input[placeholder='ex.: 1000']")
    await input.fill("500000")
    await rx.waitForTimeout(800)
    const barsAfter = await rx.evaluate(
      () => document.querySelectorAll("[data-slot='data-pipeline-bar']").length,
    )
    report.reactivity = {
      barsBefore,
      barsAfter,
      changed: barsBefore !== barsAfter,
    }
    await rx.screenshot({
      path: "/workspace/_meta/scratch/shots/data-pipeline/reactivity-after.png",
      animations: "disabled",
    })
    await rx.close()
  } finally {
    await browser.close()
  }

  saveJSON("data-pipeline/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] monta + flow altura>0`, r.hasRoot && r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] >=5 nós`, r.nodes >= 5, r.nodes)
    push(`[${theme}] >=4 edges`, r.edges >= 4, r.edges)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] paleta/inspector (desktop)`, r.hasPalette, r.hasPalette)
    push(`[${theme}] chart node + >=3 barras`, r.hasChartNode && r.bars >= 3, `chart=${r.hasChartNode} bars=${r.bars}`)
    push(`[${theme}] nó bg tematizado`, !!r.nodeBg, r.nodeBg)
    push(
      `[${theme}] nó borda visível`,
      !!r.nodeBorderW && parseFloat(r.nodeBorderW) > 0,
      `${r.nodeBorderW} ${r.nodeBorderC}`,
    )
  }
  push(
    "390px sem overflow horizontal",
    report.responsive.noHorizontalOverflow,
    `${report.responsive.scrollW}/${report.responsive.clientW}`,
  )
  push(
    "DIFERENCIAL: mudar filtro recalcula -> muda nº de barras",
    report.reactivity.changed,
    `${report.reactivity.barsBefore} → ${report.reactivity.barsAfter} barras`,
  )

  console.log("\n=== RESULTADO ===")
  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} (${c.detail})`)
  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
  console.log("nodeBg light:", report.light.nodeBg, "| nodeBg dark:", report.dark.nodeBg)
  if (failed.length > 0) process.exitCode = 1
}

run()
