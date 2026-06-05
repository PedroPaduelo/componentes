/**
 * Verifica se o CANVAS do original muda conforme o mouse se move.
 * Compara hash do pixel data do canvas em 4 posições.
 */
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"
import crypto from "node:crypto"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto("https://chanhdai.com/components/dot-grid-spotlight", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

const positions = [
  { name: "center", x: 720, y: 450 },
  { name: "tl", x: 200, y: 200 },
  { name: "center2", x: 700, y: 400 },
  { name: "br", x: 1200, y: 800 },
]

const results = {}
for (const p of positions) {
  await page.mouse.move(p.x, p.y)
  await page.waitForTimeout(1200)

  // Get canvas pixel hash + spotlight canvas size
  const data = await page.evaluate(() => {
    const canvases = document.querySelectorAll("canvas")
    const out = []
    for (const c of canvases) {
      const r = c.getBoundingClientRect()
      try {
        // Sample 100 random pixels
        const ctx2 = c.getContext("2d")
        if (!ctx2) { out.push({ rect: { w: r.width, h: r.height }, err: "no 2d context" }); continue }
        const w = c.width, h = c.height
        // Read a strip across the center
        const pixels = ctx2.getImageData(Math.floor(w/2)-50, Math.floor(h/2)-5, 100, 10).data
        // Hash the pixel data
        let hash = 0
        for (let i = 0; i < pixels.length; i++) {
          hash = ((hash << 5) - hash + pixels[i]) | 0
        }
        out.push({
          rect: { w: Math.round(r.width), h: Math.round(r.height) },
          internalSize: { w, h },
          pixelHash: hash,
        })
      } catch (e) {
        out.push({ rect: { w: r.width, h: r.height }, err: e.message })
      }
    }
    return out
  })

  results[p.name] = { mouse: p, canvases: data }
  await page.screenshot({ path: `shots/dot-grid-spotlight/orig-canvas-${p.name}.png`, fullPage: false })
  console.log(`✓ orig-canvas-${p.name}.png — hashes:`, data.map(d => d.pixelHash).join(","))
}

writeFileSync("shots/dot-grid-spotlight/orig-canvas-mouse.json", JSON.stringify(results, null, 2))

// Compare hashes
const hashesByName = Object.fromEntries(
  Object.entries(results).map(([k, v]) => [k, v.canvases.map(c => c.pixelHash)])
)
console.log("hashes by position:", hashesByName)

const uniqueHashSets = new Set(Object.values(hashesByName).map(h => JSON.stringify(h)))
console.log("unique hash sets:", uniqueHashSets.size, "(>1 = canvas reacts to mouse)")

await browser.close()
