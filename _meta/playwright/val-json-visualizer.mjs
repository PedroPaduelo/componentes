// Validador da composição json-visualizer (JSON → grafo de nós, React Flow).
// Mede montagem, nós/edges, controls/minimap, editor textarea, bg/borda do nó
// por tema, ausência de overflow em 390px e a PROVA DO DIFERENCIAL: editar o
// JSON + clicar "Visualizar" muda a contagem de nós (o grafo reage ao JSON).
// Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-json-visualizer.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/json-visualizer"
const report = { light: {}, dark: {}, responsive: {}, reactivity: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='json-visualizer']")
    const flow = document.querySelector("[data-slot='react-flow']")
    const nodeEls = document.querySelectorAll(".react-flow__node")
    const edgeEls = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const textarea = document.querySelector("[data-slot='json-visualizer'] textarea")
    const jsonNode = document.querySelector("[data-slot='json-node']")
    const flowRect = flow?.getBoundingClientRect()
    const cs = (el) => (el ? getComputedStyle(el) : null)
    const ns = cs(jsonNode)
    return {
      hasRoot: !!root,
      flowHeight: flowRect ? Math.round(flowRect.height) : 0,
      nodes: nodeEls.length,
      edges: edgeEls.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      hasTextarea: !!textarea,
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
      await shot(page, `json-visualizer-${theme}`, { sub: "json-visualizer" })
      await page.screenshot({
        path: `/workspace/_meta/scratch/shots/json-visualizer/full-${theme}.png`,
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
      path: "/workspace/_meta/scratch/shots/json-visualizer/mobile-390.png",
      animations: "disabled",
    })
    await mob.close()

    // PROVA DO DIFERENCIAL: editar o JSON + Visualizar muda a contagem de nós.
    const rx = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await setTheme(rx, "light")
    await rx.goto(URL, { waitUntil: "domcontentloaded" })
    await rx.waitForSelector(".react-flow__node", { timeout: 15000 })
    await rx.waitForTimeout(800)
    const before = await rx.evaluate(
      () => document.querySelectorAll(".react-flow__node").length,
    )
    // injeta um JSON novo com mais um objeto aninhado (gera +1 nó no mínimo)
    const NEW_JSON = JSON.stringify(
      {
        user: { id: 1, profile: { bio: "oi", links: { site: "x" } } },
        settings: { theme: "dark", notify: { email: true, sms: false } },
        audit: { last: { ip: "1.1.1.1" } },
      },
      null,
      2,
    )
    await rx.fill("[data-slot='json-visualizer'] textarea", NEW_JSON)
    await rx.getByRole("button", { name: "Visualizar" }).click()
    await rx.waitForTimeout(900)
    const after = await rx.evaluate(
      () => document.querySelectorAll(".react-flow__node").length,
    )
    report.reactivity = { before, after, changed: before !== after }
    await rx.screenshot({
      path: "/workspace/_meta/scratch/shots/json-visualizer/reactivity-after.png",
      animations: "disabled",
    })
    await rx.close()
  } finally {
    await browser.close()
  }

  saveJSON("json-visualizer/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] monta + flow altura>0`, r.hasRoot && r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] >=6 nós`, r.nodes >= 6, r.nodes)
    push(`[${theme}] >=5 edges`, r.edges >= 5, r.edges)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] editor textarea`, r.hasTextarea, r.hasTextarea)
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
    "DIFERENCIAL: editar JSON + Visualizar muda nº de nós",
    report.reactivity.changed,
    `${report.reactivity.before} → ${report.reactivity.after}`,
  )

  console.log("\n=== RESULTADO ===")
  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} (${c.detail})`)
  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
  console.log("nodeBg light:", report.light.nodeBg, "| nodeBg dark:", report.dark.nodeBg)
  if (failed.length > 0) process.exitCode = 1
}

run()
