// Validador Playwright para os 9 charts Tremor (Onda 1 da iniciativa Tremor).
//
// Para cada chart Tremor:
//   1. Navega em /components/<slug>
//   2. Espera o exemplo renderizar (data-slot="<slug>" presente)
//   3. Confirma tremor-id="tremor-raw" (atributo de identidade Tremor)
//   4. Mede dimensões do conteúdo renderizado:
//        - Recharts (7): <svg> interno com width ≥ 300 e height ≥ 200
//        - HTML puro (2): data-slot com width ≥ 300 (bar-list / category-bar)
//   5. Screenshot em _meta/scratch/shots/tremor-charts/<slug>-<theme>.png
//
// O ciclo roda em light E dark (set localStorage.vitrine-theme via addInitScript
// antes do goto). Sai com 0 se TODOS passaram, 1 caso contrário.
//
// Pré-requisitos (conforme _meta/playwright/README.md):
//   • dev server (label `fe`, porta 5173) no ar
//   • `npx playwright install chromium` já rodado
//
// Execução: `node _meta/playwright/val-tremor-charts.mjs`
//
// Helpers de output: _meta/playwright/_shots.mjs (ancora em
// /workspace/_meta/scratch/shots independente do cwd).

import { chromium } from "playwright"
import { shot } from "./_shots.mjs"

const BASE = "http://localhost:5173"
const VIEWPORT = { width: 1280, height: 720 }
const SCREENSHOT_DIR = "tremor-charts"

// 9 charts Tremor (Onda 1 do plano Tremor). `kind`:
//   - "recharts" → <svg> interno, exige svgWidth/svgHeight ≥ 300/200
//   - "html"     → sem Recharts, exige data-slot width ≥ 300
const CHARTS = [
  { slug: "area-chart-tremor",    kind: "recharts" },
  { slug: "bar-chart-tremor",     kind: "recharts" },
  { slug: "bar-list-tremor",      kind: "html" },
  { slug: "category-bar-tremor",  kind: "html" },
  { slug: "combo-chart-tremor",   kind: "recharts" },
  { slug: "donut-chart-tremor",   kind: "recharts" },
  { slug: "line-chart-tremor",    kind: "recharts" },
  { slug: "scatter-chart-tremor", kind: "recharts" },
  { slug: "spark-chart-tremor",   kind: "recharts" },
]

const THEMES = ["light", "dark"]

const browser = await chromium.launch()

let failures = 0
const failuresLog = []

function check(label, cond, extra = "") {
  const ok = !!cond
  if (!ok) {
    failures++
    failuresLog.push(`✗ ${label}${extra ? ` — ${extra}` : ""}`)
  }
  console.log(`${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`)
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 })
  // Recharts monta SVG em duas passadas (ResponsiveContainer + cálculo de
  // dimensões) e pode demorar mais em light/dark swap. Damos 3s pra garantir.
  await page.waitForTimeout(3000)
}

async function validateChart(slug, kind, theme) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  await ctx.addInitScript((t) => {
    try { localStorage.setItem("vitrine-theme", t) } catch {}
  }, theme)
  const page = await ctx.newPage()

  const consoleErrors = []
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text())
  })

  await goto(page, `/components/${slug}`)

  // 1. data-slot presente
  const slotCount = await page.locator(`[data-slot="${slug}"]`).count()
  check(`[${theme}] ${slug}: data-slot presente`, slotCount >= 1, `count=${slotCount}`)

  if (slotCount >= 1) {
    // 2. tremor-id="tremor-raw" — sanity de identidade Tremor
    const tremorId = await page
      .locator(`[data-slot="${slug}"]`)
      .first()
      .getAttribute("tremor-id")
    check(
      `[${theme}] ${slug}: tremor-id="tremor-raw"`,
      tremorId === "tremor-raw",
      `tremorId=${tremorId}`,
    )

    // 3. dimensões
    if (kind === "recharts") {
      const info = await page
        .locator(`[data-slot="${slug}"]`)
        .first()
        .evaluate((el) => {
          const svg = el.querySelector("svg")
          if (!svg) return { svgPresent: false }
          const r = svg.getBoundingClientRect()
          return {
            svgPresent: true,
            width: r.width,
            height: r.height,
            attrW: svg.getAttribute("width"),
            attrH: svg.getAttribute("height"),
          }
        })
      check(
        `[${theme}] ${slug}: <svg> presente (Recharts)`,
        info.svgPresent,
        `svgPresent=${info.svgPresent}`,
      )
      if (info.svgPresent) {
        check(
          `[${theme}] ${slug}: svg width ≥ 300`,
          info.width >= 300,
          `width=${info.width}`,
        )
        check(
          `[${theme}] ${slug}: svg height ≥ 200`,
          info.height >= 200,
          `height=${info.height}`,
        )
      }
    } else {
      // kind === "html" (bar-list-tremor, category-bar-tremor)
      const width = await page
        .locator(`[data-slot="${slug}"]`)
        .first()
        .evaluate((el) => el.getBoundingClientRect().width)
      check(
        `[${theme}] ${slug}: data-slot width ≥ 300 (html)`,
        width >= 300,
        `width=${width}`,
      )
    }
  }

  // 4. console sem erros
  check(
    `[${theme}] ${slug}: console sem errors`,
    consoleErrors.length === 0,
    consoleErrors.length ? consoleErrors.slice(0, 2).join(" | ") : "",
  )

  // 5. screenshot
  await shot(page, `${slug}-${theme}`, { sub: SCREENSHOT_DIR })

  await ctx.close()
}

for (const theme of THEMES) {
  console.log(`\n── theme: ${theme} ──`)
  for (const { slug, kind } of CHARTS) {
    await validateChart(slug, kind, theme)
  }
}

await browser.close()

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURES`}`)
if (failures > 0) {
  console.log("\nResumo das falhas:")
  for (const f of failuresLog) console.log("  " + f)
}
process.exit(failures === 0 ? 0 : 1)
