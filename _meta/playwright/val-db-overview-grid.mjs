// _meta/playwright/val-db-overview-grid.mjs
// Valida `db-overview-grid` na página /components/db-overview-grid.
//
// Comportamento esperado:
//   - 3 instâncias [data-slot=db-overview-grid] (3 examples na vitrine)
//   - Cada uma com N≥4 tiles [data-slot=db-overview-tile]
//   - Cada tile tem nome, env chip, status dot, engine, host:port,
//     3 mini-barras (connections/size/cache), 4 mini-stats, top tables
//   - Filtro de busca reduz a lista (typing "oracle" esconde os postgres-only)
//   - Click em tile abre Dialog [data-slot=db-overview-detail] com
//     o conteúdo do render prop
//   - Em 390px (mobile) o grid vira 1 coluna
//   - Sem erros de console / page errors
//
// Saída em _meta/scratch/shots/db-overview-grid/.
//
// Uso: `node _meta/playwright/val-db-overview-grid.mjs` (precisa do
// dev server em http://localhost:5173).

import { chromium } from "playwright"
import { saveJSON, shot, outPath, SHOTS_DIR } from "./_shots.mjs"

const URL = "http://localhost:5173/components/db-overview-grid"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const errs = []
page.on("pageerror", (e) => errs.push("pageerror: " + e.message))
page.on("console", (m) => {
  if (m.type() === "error") errs.push("console: " + m.text())
})

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30_000 })
await page.waitForSelector("[data-slot=db-overview-grid]", { timeout: 10_000 })
await page.waitForTimeout(500)

// 1) visão geral das instâncias e tiles
const overview = await page.evaluate(() => {
  const grids = Array.from(
    document.querySelectorAll("[data-slot=db-overview-grid]"),
  )
  return grids.map((g, i) => {
    const tiles = Array.from(g.querySelectorAll("[data-slot=db-overview-tile]"))
    const headerText = g.querySelector("div")?.textContent?.slice(0, 200) ?? ""
    return {
      index: i,
      headerText,
      tileCount: tiles.length,
      firstTileName: tiles[0]?.querySelector("h3")?.textContent ?? null,
      firstTileStatus: tiles[0]?.getAttribute("data-status") ?? null,
      firstTileEnv: tiles[0]?.getAttribute("data-env") ?? null,
      firstTileEngiText:
        tiles[0]?.querySelector(".font-mono")?.textContent ?? null,
    }
  })
})
console.log("[overview]", JSON.stringify(overview, null, 2))

// 2) detalhamento do PRIMEIRO tile do PRIMEIRO example
const tileDetail = await page.evaluate(() => {
  const g = document.querySelector("[data-slot=db-overview-grid]")
  if (!g) return null
  const t = g.querySelector("[data-slot=db-overview-tile]")
  if (!t) return null
  const rect = t.getBoundingClientRect()
  const cs = getComputedStyle(t)
  return {
    rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
    border: cs.borderTopWidth,
    borderColor: cs.borderTopColor,
    bg: cs.backgroundColor,
    color: cs.color,
    tileName: t.querySelector("h3")?.textContent ?? null,
    status: t.getAttribute("data-status"),
    env: t.getAttribute("data-env"),
    // número de mini-barras
    barCount: t.querySelectorAll("[role=progressbar]").length,
    // número de mini-stats (QPS, Slow, TPS, Repl)
    statLabelCount: t.querySelectorAll("span.text-\\[10px\\]").length,
    // tem "last backup"?
    hasBackupText: t.textContent?.toLowerCase().includes("last backup") ?? false,
  }
})
console.log("[tileDetail]", JSON.stringify(tileDetail, null, 2))

// 3) Filtro de busca: digita "billing" no SEGUNDO grid (que tem billing-prod
//    entre 6 dbs, então o tileCount deve cair de 6 para 1).
const secondSearch = page
  .locator("[data-slot=db-overview-grid]")
  .nth(1)
  .locator("[data-slot=db-overview-search]")
await secondSearch.click()
await secondSearch.fill("billing")
await page.waitForTimeout(300)

const filteredCount = await page.evaluate(() => {
  // pega o tileCount do SEGUNDO grid (que está com o filtro)
  const grids = document.querySelectorAll("[data-slot=db-overview-grid]")
  const g = grids[1]
  return g?.querySelectorAll("[data-slot=db-overview-tile]").length ?? 0
})
console.log("[after search 'billing' on 2nd grid] tileCount =", filteredCount)

// limpa busca
await secondSearch.fill("")
await page.waitForTimeout(200)

// 4) Click no primeiro tile abre Dialog com a render prop
const firstTile = page
  .locator("[data-slot=db-overview-grid]")
  .first()
  .locator("[data-slot=db-overview-tile]")
  .first()
await firstTile.click()
await page.waitForSelector("[data-slot=db-overview-detail]", { timeout: 5_000 })
const dialogContent = await page.evaluate(() => {
  const d = document.querySelector("[data-slot=db-overview-detail]")
  if (!d) return null
  return {
    title: d.querySelector("[data-slot=dialog-title]")?.textContent ?? null,
    text: d.textContent?.slice(0, 200) ?? "",
    hasJson: d.textContent?.includes("Detalhe conectado") ?? false,
    hasCustomJson: d.textContent?.includes("renderDetail") ?? false,
  }
})
console.log("[dialog]", JSON.stringify(dialogContent, null, 2))
await shot(page, "dialog-open", { sub: "db-overview-grid" })

// fecha dialog
await page.keyboard.press("Escape")
await page.waitForTimeout(200)

// 5) Mobile 390px: grid vira 1 coluna
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(300)
const mobile = await page.evaluate(() => {
  const g = document.querySelector("[data-slot=db-overview-grid]")
  if (!g) return null
  const list = g.querySelector("[data-slot=db-overview-grid-list]")
  if (!list) return null
  const cs = getComputedStyle(list)
  return {
    gridCols: cs.gridTemplateColumns,
    childCount: list.children.length,
    firstChildRect: (() => {
      const r = list.children[0]?.getBoundingClientRect()
      return r ? { w: Math.round(r.width), h: Math.round(r.height) } : null
    })(),
    overflowX: document.body.scrollWidth,
  }
})
console.log("[mobile 390]", JSON.stringify(mobile, null, 2))
await shot(page, "mobile-390", { sub: "db-overview-grid" })

// 6) dark mode
await page.setViewportSize({ width: 1440, height: 900 })
await page.evaluate(() => localStorage.setItem("vitrine-theme", "dark"))
await page.reload({ waitUntil: "domcontentloaded" })
await page.waitForSelector("[data-slot=db-overview-grid]", { timeout: 10_000 })
await page.waitForTimeout(500)
await shot(page, "dark", { sub: "db-overview-grid", fullPage: true })

// limpa busca
await secondSearch.fill("")
await page.waitForTimeout(200)

// relatório consolidado
const report = {
  url: URL,
  overview,
  tileDetail,
  filteredCount,
  dialogContent,
  mobile,
  errs,
}
saveJSON("db-overview-grid/report", report)

// checks de aceitação (para humano ler; o script não falha)
const checks = []
function check(label, ok, hint = "") {
  checks.push({ label, ok, hint })
}
check(
  "3 examples renderizados (3 instâncias [data-slot=db-overview-grid])",
  overview.length === 3,
  `got ${overview.length}`,
)
check(
  "cada example tem ≥4 tiles",
  overview.every((o) => o.tileCount >= 4),
  overview.map((o) => o.tileCount).join("/"),
)
check(
  "tile tem nome, status e env data attrs",
  overview.every(
    (o) => o.firstTileName && o.firstTileStatus && o.firstTileEnv,
  ),
)
check(
  "tile tem 3 mini-barras (connections/size/cache)",
  tileDetail?.barCount === 3,
  `got ${tileDetail?.barCount}`,
)
check("tile tem 'last backup' no footer", tileDetail?.hasBackupText === true)
check(
  "filtro 'billing' reduz a 2º grid de 6 → 1",
  filteredCount === 1,
  `count=${filteredCount} (esperado 1)`,
)
check(
  "click no tile abre dialog com render prop",
  dialogContent?.hasCustomJson === true,
  JSON.stringify(dialogContent),
)
check(
  "mobile 390px = 1 coluna (gridCols 1 valor)",
  mobile?.gridCols.split(" ").length === 1,
  `gridCols=${mobile?.gridCols}`,
)
check("0 erros de console / pageerror", errs.length === 0, errs.slice(0, 3).join(" | "))

console.log("\n=== CHECKS ===")
for (const c of checks) {
  console.log(`${c.ok ? "✅" : "❌"} ${c.label}${c.hint ? `  (${c.hint})` : ""}`)
}
const passed = checks.filter((c) => c.ok).length
console.log(`\n${passed}/${checks.length} checks passed`)

await browser.close()
console.log("done")
