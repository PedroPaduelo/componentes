// scripts/inspect-component-region.mjs
// Inspeciona a região central onde está o componente
import { chromium } from "playwright"
import { writeFileSync, readFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function cropRegion(file, label, region) {
  const page = await ctx.newPage()
  const data = readFileSync(file).toString("base64")
  await page.setContent(`
    <canvas id="c" width="1440" height="900"></canvas>
    <img id="img" src="data:image/png;base64,${data}" style="display:none">
  `)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(500)

  const out = await page.evaluate(({ region }) => {
    const img = document.getElementById("img")
    const canvas = document.getElementById("c")
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const { x, y, w, h } = region
    const data = ctx.getImageData(x, y, w, h).data

    let r = 0, g = 0, b = 0, a = 0, n = 0
    let nonZero = 0  // pixels que não são fundo (branco ou preto)
    for (let i = 0; i < data.length; i += 16) {
      const pr = data[i], pg = data[i + 1], pb = data[i + 2]
      r += pr; g += pg; b += pb; n++
      // Para LIGHT (fundo branco): pixels não-fundo são < 200
      // Para DARK (fundo preto): pixels não-fundo são > 50
      const isBg = (pr > 240 && pg > 240 && pb > 240) || (pr < 20 && pg < 20 && pb < 20)
      if (!isBg) nonZero++
    }

    return {
      avgColor: { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) },
      nonBgPixels: nonZero,
      totalSampled: n,
      nonBgPct: ((nonZero / n) * 100).toFixed(2),
    }
  }, { region })

  console.log(`\n=== ${label} (${file}) region ${JSON.stringify(region)} ===`)
  console.log(`  Avg color: rgb(${out.avgColor.r}, ${out.avgColor.g}, ${out.avgColor.b})`)
  console.log(`  Non-bg pixels: ${out.nonBgPixels} / ${out.totalSampled} (${out.nonBgPct}%)`)

  await page.close()
  return out
}

// Regiões aproximadas do componente (centro da página)
// Original top:452, vitrine top:438
const regions = [
  { name: "region-shimmer-text", x: 200, y: 400, w: 600, h: 150 },
  { name: "region-titulo", x: 200, y: 200, w: 1000, h: 200 },
  { name: "region-pagina-toda", x: 0, y: 0, w: 1440, h: 900 },
]

const results = {}
for (const reg of regions) {
  results[reg.name] = {}
  for (const file of [
    { path: "shots/shimmering-text/original-light.png", key: "original-light" },
    { path: "shots/shimmering-text/original-dark.png", key: "original-dark" },
    { path: "shots/shimmering-text/vitrine-light.png", key: "vitrine-light" },
    { path: "shots/shimmering-text/vitrine-dark.png", key: "vitrine-dark" },
  ]) {
    results[reg.name][file.key] = await cropRegion(file.path, `${file.key}-${reg.name}`, { x: reg.x, y: reg.y, w: reg.w, h: reg.h })
  }
}

writeFileSync("shots/shimmering-text/region-stats.json", JSON.stringify(results, null, 2))
await browser.close()
console.log("\n✓ Done")
