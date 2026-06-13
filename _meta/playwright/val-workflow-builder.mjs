// Validador da composição workflow-builder (editor visual com React Flow).
// Mede montagem, nós/edges, controls/minimap, paleta/inspetor, cor do nó por
// tema e ausência de overflow horizontal em 390px. Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-workflow-builder.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON, outPath } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/workflow-builder"
const report = { light: {}, dark: {}, responsive: {}, simulation: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='workflow-builder']")
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
    const firstNode = document.querySelector("[data-slot='workflow-node']")
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
      // mede borda do primeiro nó (deve ser visível nos 2 temas)
      report[theme].nodeBorder = await page.evaluate(() => {
        const n = document.querySelector("[data-slot='workflow-node']")
        if (!n) return null
        const s = getComputedStyle(n)
        return { w: s.borderTopWidth, c: s.borderTopColor }
      })
      await shot(page, `workflow-builder-${theme}`, {
        sub: "workflow-builder",
        // animações desabilitadas pra evitar travar no pulse da simulação
      })
      await page.screenshot({
        path: outPath(`workflow-builder/full-${theme}.png`),
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
      path: outPath("workflow-builder/mobile-390.png"),
      animations: "disabled",
    })
    await mob.close()

    // Simulação: clicar "Executar" e ver um nó com data-running="true"
    const sim = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await setTheme(sim, "light")
    await sim.goto(URL, { waitUntil: "domcontentloaded" })
    await sim.waitForSelector(".react-flow__node", { timeout: 15000 })
    await sim.waitForTimeout(800)
    await sim.getByRole("button", { name: /Executar/ }).click()
    let sawRunning = false
    for (let i = 0; i < 30; i++) {
      const running = await sim.evaluate(
        () => document.querySelectorAll("[data-running='true']").length,
      )
      if (running > 0) {
        sawRunning = true
        break
      }
      await sim.waitForTimeout(120)
    }
    const hasStopBtn = await sim
      .getByRole("button", { name: /Parar/ })
      .count()
    report.simulation = { sawRunning, hasStopBtn: hasStopBtn > 0 }
    await sim.close()
  } finally {
    await browser.close()
  }

  saveJSON("workflow-builder/report", report)

  // Avaliação dos critérios
  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] monta + flow altura>0`, r.hasRoot && r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] >=6 nós`, r.nodes >= 6, r.nodes)
    push(`[${theme}] >=5 edges`, r.edges >= 5, r.edges)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] paleta + inspetor`, r.hasPalette && r.hasInspector, `${r.hasPalette}/${r.hasInspector}`)
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
    "simulação acende nó (data-running)",
    report.simulation.sawRunning,
    `running=${report.simulation.sawRunning} parar=${report.simulation.hasStopBtn}`,
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
