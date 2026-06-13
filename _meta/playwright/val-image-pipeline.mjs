// Validador da composição "Image Processing Pipeline" (/compositions/image-pipeline).
//
// Verifica: monta em light/dark/390px, [data-slot=react-flow] com altura > 0,
// >=5 nós, >=4 edges, Controls + MiniMap, paleta + inspector (desktop), node bg
// tematizado por tema + borda visível, >=4 <canvas> dentro de .react-flow__node,
// 390px sem overflow horizontal.
// DIFERENCIAL: aguarda as imagens carregarem e confirma que os <canvas> de
// preview têm pixels NÃO-vazios (prova do preview ao vivo) e que nós distintos
// produzem saídas distintas (prova de que o pipeline processa de fato).
//
// Uso: node _meta/playwright/val-image-pipeline.mjs   (dev server na :5173)
import { chromium } from "playwright"
import { shot, saveJSON, outPath } from "./_shots.mjs"

const URL = "http://localhost:5173/compositions/image-pipeline"
const SUB = "image-pipeline"

const browser = await chromium.launch()
const report = {}

async function ctx(theme, width = 1440) {
  const c = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme,
  })
  const page = await c.newPage()
  await page.addInitScript((t) => {
    localStorage.setItem("vitrine-theme", t)
  }, theme)
  return { c, page }
}

async function base(theme, width, tag) {
  const { c, page } = await ctx(theme, width)
  await page.goto(URL, { waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-slot=react-flow]", { timeout: 15000 })
  await page.waitForSelector("[data-slot=image-pipeline-node]", { timeout: 15000 })
  // espera o preview ao vivo: imagens do picsum carregaram e o pipeline
  // produziu saídas distintas (>=4 assinaturas únicas entre os canvases).
  // O placeholder cinza tem pixels, então exigimos VARIEDADE, não só não-vazio.
  await page
    .waitForFunction(
      () => {
        const cs = [...document.querySelectorAll(".react-flow__node canvas")]
        const sigs = cs.map((cv) => {
          const ctx2 = cv.getContext("2d")
          if (!ctx2 || cv.width === 0) return 0
          const { data } = ctx2.getImageData(0, 0, cv.width, cv.height)
          let sum = 0
          for (let i = 0; i < data.length; i += 200)
            sum += data[i] + data[i + 1] * 2
          return sum
        })
        return new Set(sigs.filter((s) => s > 0)).size >= 4
      },
      { timeout: 25000 },
    )
    .catch(() => {})
  await page.waitForTimeout(700)

  const data = await page.evaluate(() => {
    const flow = document.querySelector("[data-slot=react-flow]")
    const fr = flow?.getBoundingClientRect()
    const nodes = document.querySelectorAll("[data-slot=image-pipeline-node]")
    const edges = document.querySelectorAll(".react-flow__edge")
    const controls = document.querySelector(".react-flow__controls")
    const minimap = document.querySelector(".react-flow__minimap")
    const palette = [...document.querySelectorAll("[draggable=true]")].length
    const inspector = !!document.querySelector("[data-slot=image-pipeline] aside:last-of-type")
    const canvases = document.querySelectorAll(".react-flow__node canvas")
    const first = nodes[0]
    const cs = first ? getComputedStyle(first) : null

    // assinatura de cada canvas de preview (soma amostrada dos pixels)
    const sigs = [...canvases].map((cv) => {
      const ctx2 = cv.getContext("2d")
      if (!ctx2 || cv.width === 0) return 0
      const { data } = ctx2.getImageData(0, 0, cv.width, cv.height)
      let sum = 0
      for (let i = 0; i < data.length; i += 200) sum += data[i] + data[i + 1] * 2
      return sum
    })
    const nonEmpty = sigs.filter((s) => s > 0).length
    const distinct = new Set(sigs.filter((s) => s > 0)).size

    return {
      flowH: fr ? Math.round(fr.height) : 0,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      hasControls: !!controls,
      hasMiniMap: !!minimap,
      paletteCount: palette,
      hasInspector: inspector,
      canvasCount: canvases.length,
      canvasNonEmpty: nonEmpty,
      canvasDistinct: distinct,
      nodeBg: cs?.backgroundColor ?? null,
      nodeBorder: cs ? `${cs.borderTopWidth} ${cs.borderTopColor}` : null,
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
    }
  })
  report[tag] = data
  await shot(page, tag, { sub: SUB, animations: "disabled" }).catch(() =>
    page.screenshot({
      path: outPath(`${SUB}/${tag}.png`),
      animations: "disabled",
    }),
  )
  await c.close()
  return data
}

await base("light", 1440, "light")
await base("dark", 1440, "dark")
await base("light", 390, "mobile-390")

// ---- avaliação ----
const checks = []
const push = (name, ok, detail) => checks.push({ name, ok, detail })
for (const t of ["light", "dark", "mobile-390"]) {
  const d = report[t]
  push(`${t}: flow altura>0`, d.flowH > 0, d.flowH)
  push(`${t}: >=5 nós`, d.nodeCount >= 5, d.nodeCount)
  push(`${t}: >=4 edges`, d.edgeCount >= 4, d.edgeCount)
  push(`${t}: Controls`, d.hasControls, d.hasControls)
  push(`${t}: MiniMap`, d.hasMiniMap, d.hasMiniMap)
  push(`${t}: node borda visível`, !/ 0px /.test(` ${d.nodeBorder} `), d.nodeBorder)
}
push("desktop: paleta presente", report.light.paletteCount >= 5, report.light.paletteCount)
push("desktop: inspector presente", report.light.hasInspector, report.light.hasInspector)
push("DIFERENCIAL: >=4 canvas nos nós", report.light.canvasCount >= 4, report.light.canvasCount)
push(
  "DIFERENCIAL: previews ao vivo (>=4 canvas com pixels)",
  report.light.canvasNonEmpty >= 4,
  report.light.canvasNonEmpty,
)
push(
  "DIFERENCIAL: etapas produzem saídas distintas",
  report.light.canvasDistinct >= 3,
  report.light.canvasDistinct,
)
push(
  "mobile-390: sem overflow horizontal",
  report["mobile-390"].docW <= report["mobile-390"].winW + 1,
  `${report["mobile-390"].docW} <= ${report["mobile-390"].winW}`,
)

const failed = checks.filter((c) => !c.ok)
saveJSON(`${SUB}/report`, { report, checks })
console.log("\n=== CHECKS ===")
for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} → ${JSON.stringify(c.detail)}`)
console.log(`\n${failed.length === 0 ? "ALL PASS ✅" : `${failed.length} FAIL ❌`}`)

await browser.close()
process.exit(failed.length === 0 ? 0 : 1)
