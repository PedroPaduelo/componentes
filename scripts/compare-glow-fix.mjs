// scripts/compare-glow-fix.mjs
// Compara pixel-a-pixel usando Playwright (sem dep nova).
// Carrega cada PNG via fetch, decodifica num <canvas>, e lê getImageData.
// Detecta a presença de cor no border do card.
import { chromium } from "playwright"

const cases = [
  { name: "no-hover-light", path: "shots/vitrine-glow-no-hover-light.png" },
  { name: "hover-center-light", path: "shots/vitrine-glow-hover-center-light.png" },
  { name: "hover-tl-light", path: "shots/vitrine-glow-hover-tl-light.png" },
  { name: "no-hover-dark", path: "shots/vitrine-glow-no-hover-dark.png" },
  { name: "hover-center-dark", path: "shots/vitrine-glow-hover-center-dark.png" },
  { name: "hover-tl-dark", path: "shots/vitrine-glow-hover-tl-dark.png" },
  { name: "ncdai-reference-light", path: "shots/ncdai-glow-card-grid.png" },
  { name: "ncdai-reference-dark", path: "shots/ncdai-glow-card-grid-dark.png" },
]

// coords (x, y, w, h) de uma faixa do border do primeiro card visível
const sampleSpecs = {
  "no-hover-light": { x: 380, y: 540, w: 30, h: 30 },
  "hover-center-light": { x: 380, y: 540, w: 30, h: 30 },
  "hover-tl-light": { x: 700, y: 540, w: 30, h: 30 },
  "no-hover-dark": { x: 380, y: 540, w: 30, h: 30 },
  "hover-center-dark": { x: 380, y: 540, w: 30, h: 30 },
  "hover-tl-dark": { x: 700, y: 540, w: 30, h: 30 },
  "ncdai-reference-light": { x: 380, y: 380, w: 30, h: 30 },
  "ncdai-reference-dark": { x: 380, y: 380, w: 30, h: 30 },
}

const browser = await chromium.launch()
const page = await browser.newPage()

const samples = {}
for (const c of cases) {
  // fetch the file and load as data url
  const fs = await import("node:fs/promises")
  const buf = await fs.readFile(c.path)
  const dataUrl = `data:image/png;base64,${buf.toString("base64")}`
  const sample = await page.evaluate(
    async ({ dataUrl, x, y, w, h }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const cnv = document.createElement("canvas")
      cnv.width = img.width
      cnv.height = img.height
      const ctx = cnv.getContext("2d")
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(x, y, w, h).data
      let r = 0,
        g = 0,
        b = 0,
        n = 0
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        n++
      }
      return {
        r: Math.round(r / n),
        g: Math.round(g / n),
        b: Math.round(b / n),
        width: img.width,
        height: img.height,
      }
    },
    { dataUrl, ...sampleSpecs[c.name] },
  )
  samples[c.name] = sample
}

await page.close()
await browser.close()

console.log("=== BORDER COLOR SAMPLE (mean RGB) ===")
for (const c of cases) {
  const s = samples[c.name]
  console.log(`[${c.name.padEnd(25)}] ${s.width}x${s.height}  rgb(${String(s.r).padStart(3)}, ${String(s.g).padStart(3)}, ${String(s.b).padStart(3)})`)
}

console.log("\n=== DIFFS (sign of neon) ===")
function diff(a, b) {
  return { dr: Math.abs(a.r - b.r), dg: Math.abs(a.g - b.g), db: Math.abs(a.b - b.b) }
}
function show(a, b, label) {
  const sa = samples[a]
  const sb = samples[b]
  if (!sa || !sb) return
  const d = diff(sa, sb)
  const max = Math.max(d.dr, d.dg, d.db)
  const verdict = max > 15 ? "✅ neon change detected" : "❌ no visible change"
  console.log(`[${label}] ΔR=${String(d.dr).padStart(3)} ΔG=${String(d.dg).padStart(3)} ΔB=${String(d.db).padStart(3)} (max=${String(max).padStart(3)}) — ${verdict}`)
}
show("no-hover-light", "hover-center-light", "vitrine: no-hover → hover-center (LIGHT)")
show("no-hover-dark", "hover-center-dark", "vitrine: no-hover → hover-center (DARK)")
show("no-hover-light", "hover-tl-light", "vitrine: no-hover → hover-tl (LIGHT)")
show("no-hover-dark", "hover-tl-dark", "vitrine: no-hover → hover-tl (DARK)")
