// Validador da composição media-studio (estúdio de mídia generativa com React Flow).
// Mede montagem, nós/edges, controls/minimap, paleta agrupada por categoria +
// inspetor, cor/borda do nó por tema, ausência de overflow em 390px e — o
// DIFERENCIAL — a simulação de "Gerar" (nó entra em data-generating="true").
// Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-media-studio.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/media-studio"
const report = { light: {}, dark: {}, responsive: {}, simulation: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='media-studio']")
    const flow = document.querySelector("[data-slot='react-flow']")
    const nodeEls = document.querySelectorAll(".react-flow__node")
    const edgeEls = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const palette = Array.from(document.querySelectorAll("aside")).find((a) =>
      a.textContent?.includes("Paleta"),
    )
    const inspector = Array.from(document.querySelectorAll("aside")).find((a) =>
      a.textContent?.includes("Inspetor"),
    )
    const paletteText = palette?.textContent ?? ""
    const hasCategories =
      paletteText.includes("Inputs") &&
      paletteText.includes("Generation") &&
      paletteText.includes("Layout")
    const firstNode = document.querySelector("[data-slot='media-node']")
    const flowRect = flow?.getBoundingClientRect()
    return {
      hasRoot: !!root,
      flowHeight: flowRect ? Math.round(flowRect.height) : 0,
      nodes: nodeEls.length,
      edges: edgeEls.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      hasPalette: !!palette,
      hasInspector: !!inspector,
      hasCategories,
      nodeBg: firstNode ? getComputedStyle(firstNode).backgroundColor : null,
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
      const info = await inspect(page)
      report[theme] = info
      report[theme].nodeBorder = await page.evaluate(() => {
        const n = document.querySelector("[data-slot='media-node']")
        if (!n) return null
        const s = getComputedStyle(n)
        return { w: s.borderTopWidth, c: s.borderTopColor }
      })
      await shot(page, `media-studio-${theme}`, { sub: "media-studio" })
      await page.screenshot({
        path: `/workspace/_meta/scratch/shots/media-studio/full-${theme}.png`,
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
      path: "/workspace/_meta/scratch/shots/media-studio/mobile-390.png",
      animations: "disabled",
    })
    await mob.close()

    // Simulação: clicar "Gerar" e ver um nó com data-generating="true"
    const sim = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await setTheme(sim, "light")
    await sim.goto(URL, { waitUntil: "domcontentloaded" })
    await sim.waitForSelector(".react-flow__node", { timeout: 15000 })
    await sim.waitForTimeout(800)
    await sim.getByRole("button", { name: /Gerar/ }).click()
    let sawGenerating = false
    for (let i = 0; i < 40; i++) {
      const generating = await sim.evaluate(
        () => document.querySelectorAll("[data-generating='true']").length,
      )
      if (generating > 0) {
        sawGenerating = true
        break
      }
      await sim.waitForTimeout(120)
    }
    const hasStopBtn = await sim.getByRole("button", { name: /Parar/ }).count()
    report.simulation = { sawGenerating, hasStopBtn: hasStopBtn > 0 }
    await sim.screenshot({
      path: "/workspace/_meta/scratch/shots/media-studio/generating.png",
      animations: "disabled",
    })
    await sim.close()
  } finally {
    await browser.close()
  }

  saveJSON("media-studio/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] monta + flow altura>0`, r.hasRoot && r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] >=7 nós`, r.nodes >= 7, r.nodes)
    push(`[${theme}] >=6 edges`, r.edges >= 6, r.edges)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] paleta + inspetor`, r.hasPalette && r.hasInspector, `${r.hasPalette}/${r.hasInspector}`)
    push(`[${theme}] paleta agrupada (categorias)`, r.hasCategories, r.hasCategories)
    push(`[${theme}] node bg presente`, !!r.nodeBg, r.nodeBg)
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
  push(
    "simulação: nó entra em generating (data-generating)",
    report.simulation.sawGenerating,
    `generating=${report.simulation.sawGenerating} parar=${report.simulation.hasStopBtn}`,
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
