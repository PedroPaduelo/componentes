// Validador da composição mind-map (mapa mental interativo com React Flow).
// Mede montagem, nós/edges, controls/minimap, destaque da raiz, cor do nó por
// tema, edição inline (duplo-clique → textarea) e ausência de overflow em 390px.
// Output em _meta/scratch/shots.
//
// Uso: node _meta/playwright/val-mind-map.mjs  (dev server em :5173)
import { chromium } from "playwright"
import { shot, saveJSON } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/mind-map"
const report = { light: {}, dark: {}, responsive: {}, editing: {} }

async function setTheme(page, theme) {
  await page.addInitScript((t) => localStorage.setItem("vitrine-theme", t), theme)
}

async function inspect(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slot='mind-map']")
    const flow = document.querySelector("[data-slot='react-flow']")
    const nodeEls = document.querySelectorAll(".react-flow__node")
    const edgeEls = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const rootNode = document.querySelector("[data-slot='mind-node'][data-root='true']")
    const childNode = document.querySelector("[data-slot='mind-node'][data-root='false']")
    const flowRect = flow?.getBoundingClientRect()
    const cs = (el) => (el ? getComputedStyle(el) : null)
    const rs = cs(rootNode)
    const chs = cs(childNode)
    return {
      hasRoot: !!root,
      flowHeight: flowRect ? Math.round(flowRect.height) : 0,
      nodes: nodeEls.length,
      edges: edgeEls.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      hasRootNode: !!rootNode,
      rootBg: rs ? rs.backgroundColor : null,
      childBg: chs ? chs.backgroundColor : null,
      childBorderW: chs ? chs.borderTopWidth : null,
      childBorderC: chs ? chs.borderTopColor : null,
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
      await shot(page, `mind-map-${theme}`, { sub: "mind-map" })
      await page.screenshot({
        path: `/workspace/_meta/scratch/shots/mind-map/full-${theme}.png`,
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
      path: "/workspace/_meta/scratch/shots/mind-map/mobile-390.png",
      animations: "disabled",
    })
    await mob.close()

    // Edição inline: duplo-clique num nó → aparece textarea
    const ed = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await setTheme(ed, "light")
    await ed.goto(URL, { waitUntil: "domcontentloaded" })
    await ed.waitForSelector("[data-slot='mind-node']", { timeout: 15000 })
    await ed.waitForTimeout(800)
    await ed.locator("[data-slot='mind-node']").first().dblclick()
    let sawTextarea = false
    for (let i = 0; i < 20; i++) {
      const has = await ed.evaluate(
        () => document.querySelectorAll("[data-slot='mind-node'] textarea").length,
      )
      if (has > 0) {
        sawTextarea = true
        break
      }
      await ed.waitForTimeout(100)
    }
    report.editing = { sawTextarea }
    await ed.screenshot({
      path: "/workspace/_meta/scratch/shots/mind-map/editing.png",
      animations: "disabled",
    })
    await ed.close()
  } finally {
    await browser.close()
  }

  saveJSON("mind-map/report", report)

  const checks = []
  const push = (name, ok, detail) => checks.push({ name, ok, detail })
  for (const theme of ["light", "dark"]) {
    const r = report[theme]
    push(`[${theme}] monta + flow altura>0`, r.hasRoot && r.flowHeight > 0, r.flowHeight)
    push(`[${theme}] >=8 nós`, r.nodes >= 8, r.nodes)
    push(`[${theme}] >=7 edges`, r.edges >= 7, r.edges)
    push(`[${theme}] Controls + MiniMap`, r.hasControls && r.hasMiniMap, `${r.hasControls}/${r.hasMiniMap}`)
    push(`[${theme}] raiz com destaque`, r.hasRootNode && !!r.rootBg, r.rootBg)
    push(`[${theme}] nó-filho bg tematizado`, !!r.childBg, r.childBg)
    push(
      `[${theme}] nó-filho borda visível`,
      !!r.childBorderW && parseFloat(r.childBorderW) > 0,
      `${r.childBorderW} ${r.childBorderC}`,
    )
  }
  push(
    "390px sem overflow horizontal",
    report.responsive.noHorizontalOverflow,
    `${report.responsive.scrollW}/${report.responsive.clientW}`,
  )
  push("edição inline (duplo-clique → textarea)", report.editing.sawTextarea, report.editing.sawTextarea)

  console.log("\n=== RESULTADO ===")
  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} (${c.detail})`)
  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
  console.log("rootBg light:", report.light.rootBg, "| childBg light:", report.light.childBg)
  console.log("rootBg dark:", report.dark.rootBg, "| childBg dark:", report.dark.childBg)
  if (failed.length > 0) process.exitCode = 1
}

run()
