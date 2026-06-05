// scripts/compare-shimmer-prints.mjs
// Compara dimensões, cores dominantes e histograma dos 4 prints principais
import { chromium } from "playwright"
import { writeFileSync, readFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function analyze(file, label) {
  const page = await ctx.newPage()
  // Carregar a imagem como data URL
  const data = readFileSync(file).toString("base64")
  await page.setContent(`
    <canvas id="c" width="1440" height="900"></canvas>
    <img id="img" src="data:image/png;base64,${data}" style="display:none">
  `)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(500)

  const stats = await page.evaluate(() => {
    const img = document.getElementById("img")
    const canvas = document.getElementById("c")
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, 1440, 900).data

    // Calcular histograma simplificado por canal + cor média
    let r = 0, g = 0, b = 0, n = 0
    const colorBuckets = {}
    // Sample 1 a cada 100 pixels pra performance
    for (let i = 0; i < data.length; i += 400) {
      const pr = data[i], pg = data[i + 1], pb = data[i + 2]
      r += pr; g += pg; b += pb; n++
      // Bucket de cor a cada 32 níveis
      const key = `${Math.floor(pr / 32) * 32},${Math.floor(pg / 32) * 32},${Math.floor(pb / 32) * 32}`
      colorBuckets[key] = (colorBuckets[key] || 0) + 1
    }

    // Top 5 cores
    const top = Object.entries(colorBuckets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => ({ color: `rgb(${k})`, count: v, pct: ((v / n) * 100).toFixed(1) }))

    return {
      avgColor: { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) },
      totalSampled: n,
      topColors: top,
    }
  })

  console.log(`\n=== ${label} (${file}) ===`)
  console.log(`  Avg color: rgb(${stats.avgColor.r}, ${stats.avgColor.g}, ${stats.avgColor.b})`)
  console.log(`  Top colors:`)
  stats.topColors.forEach((c) => console.log(`    ${c.color} → ${c.pct}%`))

  await page.close()
  return { label, file, ...stats }
}

const a = await analyze("shots/shimmering-text/original-light.png", "original-light")
const b = await analyze("shots/shimmering-text/original-dark.png", "original-dark")
const c = await analyze("shots/shimmering-text/vitrine-light.png", "vitrine-light")
const d = await analyze("shots/shimmering-text/vitrine-dark.png", "vitrine-dark")

writeFileSync("shots/shimmering-text/compare-stats.json", JSON.stringify([a, b, c, d], null, 2))

await browser.close()
console.log("\n✓ Done")
